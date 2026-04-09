import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup, Telegraf } from 'telegraf';
import type { InlineKeyboardMarkup } from 'telegraf/types';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { KeysService } from '../keys/keys.service';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '../orders/order.entity';
import {
  primaryProductImage,
  resolvePublicAssetUrl,
} from './telegram-assets.util';

type ApproveManualResult = Awaited<
  ReturnType<OrdersService['approveManualOrder']>
>;

const BTN_CATALOG = '🛍️ Каталог';
const BTN_PROFILE = '👤 Профиль';
const BTN_PURCHASES = '🗂 Мои покупки';
const BTN_SUPPORT = '👨‍💻 Поддержка';
const BTN_REVIEWS = '☀️ Отзывы';

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Telegraf | null = null;
  private readonly pendingScreenshotOrder = new Map<string, number>();
  private expireInterval: NodeJS.Timeout | null = null; // добавить

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly keysService: KeysService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  private get adminTelegramId(): string | undefined {
    return this.config.get<string>('ADMIN_TELEGRAM_ID');
  }

  private get publicBaseUrl(): string {
    return (
      this.config.get<string>('PUBLIC_API_BASE_URL')?.replace(/\/$/, '') ?? ''
    );
  }

  private get botUsername(): string {
    return (this.config.get<string>('TELEGRAM_BOT_USERNAME') ?? '')
      .replace(/^@/, '')
      .trim();
  }

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN не задан — Telegram-бот не запускается',
      );
      return;
    }

    this.bot = new Telegraf(token);
    this.registerHandlers();

    void this.bot
      .launch()
      .then(() => this.logger.log('Telegram-бот запущен'))
      .catch((e: unknown) =>
        this.logger.error(
          'Ошибка запуска Telegram-бота',
          e instanceof Error ? e.stack : String(e),
        ),
      );

    this.expireInterval = setInterval(() => {
      void (async () => {
        const expired = await this.ordersService.expireOldOrders();
        for (const order of expired) {
          const tgId = order.user?.telegramId;
          if (tgId && this.bot) {
            await this.bot.telegram.sendMessage(
              tgId,
              `⏰ Заказ #${order.publicId ?? order.id} отменён — время оплаты истекло (30 мин).`,
            );
          }
        }
      })();
    }, 60 * 1000);
  }

  onModuleDestroy() {
    if (this.bot) {
      this.bot.stop('NestJS shutdown');
      if (this.expireInterval) {
        clearInterval(this.expireInterval);
        this.expireInterval = null;
      }
    }
  }

  async notifyAfterWebAdminDecision(
    orderId: number,
    result: ApproveManualResult,
  ) {
    const tgId = result.order.user?.telegramId;
    if (!tgId || !this.bot) return;

    if (result.keyDelivered && result.order.deliveredKey) {
      await this.bot.telegram.sendMessage(
        tgId,
        `✅ Заказ #${publicOrderLabel(result.order)} подтверждён.\n\nВаш ключ:\n\`${result.order.deliveredKey}\``,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    if (result.noKeysAvailable) {
      await this.bot.telegram.sendMessage(
        tgId,
        `✅ Оплата по заказу #${publicOrderLabel(result.order)} подтверждена, но ключи временно закончились. Мы свяжемся с вами.`,
      );

      const admin = this.adminTelegramId;
      if (admin) {
        await this.bot.telegram.sendMessage(
          admin,
          `⚠️ Заказ #${publicOrderLabel(result.order)} (веб): оплата подтверждена, ключей нет.`,
        );
      }
    }
  }

  async getPublicFileUrl(fileId: string): Promise<string | null> {
    if (!this.bot) return null;

    try {
      const link = await this.bot.telegram.getFileLink(fileId);
      return link.href;
    } catch (e) {
      this.logger.warn(
        `getFileLink failed: ${e instanceof Error ? e.message : e}`,
      );
      return null;
    }
  }

  async notifyAfterWebReject(orderId: number, order: Order) {
    if (!this.bot) return;

    const full = await this.ordersService.findByIdWithRelations(orderId);
    const tgId = full?.user?.telegramId;
    if (!tgId) return;

    const comment = order.adminReviewComment
      ? `\nКомментарий: ${order.adminReviewComment}`
      : '';

    await this.bot.telegram.sendMessage(
      tgId,
      `❌ Оплата по заказу #${full ? publicOrderLabel(full) : orderId} отклонена.${comment}`,
    );
  }

  private mainReplyKeyboard() {
    return Markup.keyboard([
      [BTN_CATALOG],
      [BTN_PROFILE, BTN_PURCHASES],
      [BTN_SUPPORT, BTN_REVIEWS],
    ])
      .resize()
      .persistent();
  }

  private parseStartPayload(ctx: Context): string | undefined {
    const msg = ctx.message;
    if (!msg || !('text' in msg)) {
      return undefined;
    }

    const text = msg.text.trim();
    if (!text.startsWith('/start')) return undefined;

    const rest = text.replace(/^\/start\s*/i, '').trim();
    return rest || undefined;
  }

  private async sendPhotoOrText(
    ctx: Context,
    chatId: number,
    url: string | null,
    caption: string,
    extra: { reply_markup?: InlineKeyboardMarkup } = {},
  ) {
    try {
      if (url) {
        await ctx.telegram.sendPhoto(chatId, url, {
          caption,
          ...extra,
        });
        return;
      }
    } catch (e) {
      this.logger.warn(
        `sendPhoto failed: ${e instanceof Error ? e.message : e}`,
      );
    }

    await ctx.telegram.sendMessage(chatId, caption, extra);
  }

  private getChatId(ctx: Context): number | null {
    if (ctx.chat?.id) return ctx.chat.id;

    const callbackMessage =
      ctx.callbackQuery &&
      'message' in ctx.callbackQuery &&
      ctx.callbackQuery.message;

    if (
      callbackMessage &&
      typeof callbackMessage === 'object' &&
      'chat' in callbackMessage &&
      callbackMessage.chat?.id
    ) {
      return callbackMessage.chat.id;
    }

    return null;
  }

  private registerHandlers() {
    if (!this.bot) return;

    this.bot.start(async (ctx) => {
      try {
        const payload = this.parseStartPayload(ctx);

        await this.usersService.findOrCreateTelegramUser({
          telegramId: String(ctx.from.id),
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          startPayload: payload,
        });

        await ctx.reply(
          `👋 Привет, ${ctx.from.first_name}!\n\n` +
            `🛒 Добро пожаловать \n\n` +
            `Здесь ты можешь купить читы и моды для мобильных игр.\n\n` +
            `Выбери раздел 👇`,
          {
            parse_mode: 'Markdown',
            ...this.mainReplyKeyboard(),
          },
        );
      } catch (e) {
        this.logger.error(e);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
      }
    });

    this.bot.hears(BTN_CATALOG, async (ctx) => {
      await this.showCatalog(ctx);
    });

    this.bot.hears(BTN_PROFILE, async (ctx) => {
      await this.showProfile(ctx);
    });

    this.bot.hears(BTN_PURCHASES, async (ctx) => {
      await this.showMyPurchases(ctx);
    });

    this.bot.hears(BTN_SUPPORT, async (ctx) => {
      await this.sendSupportInfo(ctx);
    });

    this.bot.hears(BTN_REVIEWS, async (ctx) => {
      await this.showReviews(ctx);
    });

    this.bot.command('orders', async (ctx) => {
      await this.showMyPurchases(ctx);
    });

    this.bot.command('support', async (ctx) => {
      await this.sendSupportInfo(ctx);
    });

    this.bot.action(/^c:(\d+)$/, async (ctx) => {
      const id = Number(ctx.match[1]);
      await ctx.answerCbQuery();
      await this.showCategory(ctx as Context, id);
    });

    this.bot.action(/^nav:catalog$/, async (ctx) => {
      await ctx.answerCbQuery();
      await this.showCatalog(ctx as Context);
    });

    this.bot.action(/^p:(\d+)$/, async (ctx) => {
      const id = Number(ctx.match[1]);
      await ctx.answerCbQuery();
      await this.showProduct(ctx as Context, id);
    });

    this.bot.action(/^b:(\d+):(\d+)$/, async (ctx) => {
      const productId = Number(ctx.match[1]);
      const priceIdx = Number(ctx.match[2]);
      await ctx.answerCbQuery();
      await this.startPurchase(ctx as Context, productId, priceIdx);
    });

    this.bot.action(/^o:(\d+)$/, async (ctx) => {
      const orderId = Number(ctx.match[1]);
      await ctx.answerCbQuery();
      await this.showOrderDetail(ctx as Context, orderId);
    });

    this.bot.action(/^a:(\d+)$/, async (ctx) => {
      const orderId = Number(ctx.match[1]);
      await this.handleAdminApprove(ctx, orderId);
    });

    this.bot.action(/^r:(\d+)$/, async (ctx) => {
      const orderId = Number(ctx.match[1]);
      await this.handleAdminReject(ctx, orderId);
    });

    this.bot.action(/^cancel:(\d+)$/, async (ctx) => {
      const orderId = Number(ctx.match[1]);

      await ctx.answerCbQuery();

      await this.ordersService.cancelOrder(orderId);
      this.pendingScreenshotOrder.delete(String(ctx.from.id));

      await ctx.reply('Заказ отменён.', this.mainReplyKeyboard());
    });

    this.bot.action(/^paid:(\d+)$/, async (ctx) => {
      const orderId = Number(ctx.match[1]);
      const order = await this.ordersService.findById(orderId);

      if (
        order?.status === OrderStatus.CANCELLED ||
        order?.status === OrderStatus.EXPIRED
      ) {
        return ctx.reply('Заявка отменена');
      }

      await ctx.answerCbQuery();
      this.pendingScreenshotOrder.set(String(ctx.from.id), orderId);

      await ctx.reply('Теперь отправьте скриншот оплаты.', {
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('Отмена', `cancel:${orderId}`)],
        ]).reply_markup,
      });
    });

    this.bot.on('photo', async (ctx) => {
      try {
        await this.handlePaymentPhoto(ctx);
      } catch (e) {
        this.logger.error(e);
        await ctx.reply('Не удалось обработать фото.');
      }
    });
  }

  private async showCatalog(ctx: Context) {
    const roots = await this.categoriesService.getRootCategories();

    if (!roots.length) {
      await ctx.reply('Категории пока пусты.');
      return;
    }

    const rows = roots.map((c) => [
      Markup.button.callback(c.name, `c:${c.id}`),
    ]);

    await ctx.reply(
      '📚 Каталог\n\nВыберите категорию:',
      Markup.inlineKeyboard(rows),
    );
  }

  private async showProfile(ctx: Context) {
    const user = await this.ensureTelegramUser(ctx);
    const info = await this.usersService.getReferralProfileInfo(user.id);

    if (!info) {
      await ctx.reply('Профиль не найден.');
      return;
    }

    const u = info.user;
    const s = info.stats;
    const uname = u.telegramUsername ? `@${u.telegramUsername}` : '—';

    const link =
      this.botUsername && u.referralCode
        ? `https://t.me/${this.botUsername}?start=ref_${u.referralCode}`
        : '— (задайте TELEGRAM_BOT_USERNAME в .env)';

    const text =
      `👤 Профиль\n\n` +
      `Username: ${uname}\n` +
      `Регистрация: ${u.created_at.toISOString().slice(0, 10)}\n\n` +
      `Реферальная система` +
      `🔗 Ссылка: ${link}\n` +
      `Приглашено: ${s.invitedUsersCount}\n` +
      `Оплаченных начислений: ${s.successfulReferralsCount}\n` +
      `Всего заработано: ${s.totalReferralEarned} ₽\n` +
      `Баланс: ${s.referralBalance} ₽`;

    await ctx.reply(text);
  }

  private async showReviews(ctx: Context) {
    await ctx.reply('⭐️ Ознакомьтесь с отзывами наших покупателей:', {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.url('⭐️ Отзывы', 'https://t.me/reviews_zero')],
      ]).reply_markup,
    });
  }

  private async showMyPurchases(ctx: Context) {
    const user = await this.ensureTelegramUser(ctx);
    const orders = await this.ordersService.findOrdersForUser(user.id, 20);

    if (!orders.length) {
      await ctx.reply('У вас пока нет покупок.');
      return;
    }

    await ctx.reply('Мои покупки:');

    const chatId = this.getChatId(ctx);
    if (!chatId) {
      await ctx.reply('Не удалось определить чат.');
      return;
    }

    for (const o of orders) {
      const name = o.product?.name ?? 'Товар';
      const line =
        `#${publicOrderLabel(o)} · ${name}\n` +
        `${o.amount} ₽ · ${o.status}\n` +
        `${new Date(o.createdAt).toLocaleString('ru-RU')}`;

      await ctx.telegram.sendMessage(chatId, line, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('Подробнее', `o:${o.id}`)],
        ]).reply_markup,
      });
    }
  }

  private async showOrderDetail(ctx: Context, orderId: number) {
    const user = await this.ensureTelegramUser(ctx);
    const order = await this.ordersService.findByIdWithRelations(orderId);

    if (!order || order.userId !== user.id) {
      await ctx.reply('Заказ не найден.');
      return;
    }

    const name = order.product?.name ?? 'Товар';

    let text =
      `Заказ #${publicOrderLabel(order)}\n` +
      `Товар: ${name}\n` +
      `Сумма: ${order.amount} ₽\n` +
      `Статус: ${order.status}\n` +
      `Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}\n`;

    if (order.adminReviewComment) {
      text += `\nКомментарий: ${order.adminReviewComment}\n`;
    }

    if (order.deliveredKey && order.status === OrderStatus.PAID) {
      text += `\n🔑 Ключ:\n\`${order.deliveredKey}\``;
      await ctx.reply(text, { parse_mode: 'Markdown' });
      return;
    }

    await ctx.reply(text);
  }

  private async ensureTelegramUser(ctx: {
    from?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  }) {
    if (!ctx.from) {
      throw new Error('Нет данных пользователя Telegram');
    }

    return this.usersService.findOrCreateTelegramUser({
      telegramId: String(ctx.from.id),
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
    });
  }

  private async showCategory(ctx: Context, categoryId: number) {
    const cat =
      await this.categoriesService.getCategoryByIdWithChildren(categoryId);

    const chatId = this.getChatId(ctx);
    if (!chatId) {
      await ctx.reply('Не удалось определить чат.');
      return;
    }

    const base = this.publicBaseUrl;
    const categoryUrl = resolvePublicAssetUrl(base, cat.image);

    const categoryCaption = `${cat.description ? `\n\n${cat.description}` : ''}`;

    const activeChildren = (cat.children ?? []).filter((ch) => ch.isActive);

    if (activeChildren.length > 0) {
      await this.sendPhotoOrText(ctx, chatId, categoryUrl, categoryCaption, {
        reply_markup: Markup.inlineKeyboard([
          ...activeChildren.map((c) => [
            Markup.button.callback(c.name, `c:${c.id}`),
          ]),
          [Markup.button.callback('← Назад к категориям', 'nav:catalog')],
        ]).reply_markup,
      });
      return;
    }

    const data =
      await this.categoriesService.listActiveProductsForCategory(categoryId);

    const products = data.products ?? [];

    const caption = products.length
      ? `${categoryCaption}\n\nТовары категории «${data.name}»:`
      : `${categoryCaption}\n\nВ категории пока нет товаров.`;

    const markup = products.length
      ? Markup.inlineKeyboard([
          ...products.map((p) => [
            Markup.button.callback(
              `${p.name} — от ${minPrice(p)} ₽`,
              `p:${p.id}`,
            ),
          ]),
          [Markup.button.callback('← Назад к категориям', 'nav:catalog')],
        ])
      : Markup.inlineKeyboard([
          [Markup.button.callback('← Назад к категориям', 'nav:catalog')],
        ]);

    await this.sendPhotoOrText(ctx, chatId, categoryUrl, caption, {
      reply_markup: markup.reply_markup,
    });
  }

  private async showProduct(ctx: Context, productId: number) {
    const p = await this.productsService.findByIdForBot(productId);
    const stock = await this.keysService.countAvailableForProduct(p.id);
    const prices = p.prices ?? [];

    if (!prices.length) {
      const text = `«${p.name}» — цены не настроены.`;
      await ctx.reply(text);
      return;
    }

    const priceRows = prices.map((pr, idx) => [
      Markup.button.callback(
        `${pr.duration} — ${pr.price} ₽`,
        `b:${p.id}:${idx}`,
      ),
    ]);

    const backRow = p.categoryId
      ? [Markup.button.callback('← Назад к категории', `c:${p.categoryId}`)]
      : [Markup.button.callback('← К каталогу', 'nav:catalog')];

    const catName = p.category?.name ?? '—';

    const caption =
      `📦 ${p.name}\n` +
      `Категория: ${catName}\n` +
      `В наличии ключей: ${stock}\n\n` +
      `${p.description}\n\n` +
      `Выберите период:`;

    const markup = Markup.inlineKeyboard([...priceRows, backRow]);

    const base = this.publicBaseUrl;
    const img = primaryProductImage(p);
    const url = resolvePublicAssetUrl(base, img);

    const chatId = this.getChatId(ctx);
    if (!chatId) {
      await ctx.reply('Не удалось определить чат.');
      return;
    }

    await this.sendPhotoOrText(ctx, chatId, url, caption, {
      reply_markup: markup.reply_markup,
    });
  }

  private async startPurchase(
    ctx: Context,
    productId: number,
    priceIndex: number,
  ) {
    const user = await this.ensureTelegramUser(ctx);
    const product = await this.productsService.findByIdForBot(productId);
    const prices = product.prices ?? [];
    const tier = prices[priceIndex];

    if (!tier) {
      await ctx.reply('Некорректный тариф.');
      return;
    }

    const order = await this.ordersService.createManualCardOrder(
      user.id,
      product.id,
      tier.price,
      priceIndex,
    );

    this.pendingScreenshotOrder.set(String(ctx.from!.id), order.id);

    // const card = this.config.getOrThrow<string>('PAYMENT_CARD_NUMBER');
    // const holder = this.config.getOrThrow<string>('PAYMENT_CARD_HOLDER');
    // const bank = this.config.getOrThrow<string>('PAYMENT_BANK_NAME');
    const yoomoney = this.config.getOrThrow<string>('YOOMONEY_NUMBER');

    await ctx.reply(
      `🛒 *Заказ #${publicOrderLabel(order)}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📦 *Товар:* ${product.name} (${tier.duration})\n` +
        `💰 *Сумма:* ${tier.price} ₽\n\n` +
        `💳 *Реквизиты для оплаты:*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🟡 *ЮMoney:* \`${yoomoney}\`\n\n` +
        `💳 *Оплата по ссылке:*\n` +
        `[Перейти к оплате](https://yoomoney.ru/to/4100119494438077)\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📸 Переведите *точную сумму* и сохраните чек.\n` +
        `После оплаты нажмите кнопку ниже 👇`,
      {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('✅ Я оплатил', `paid:${order.id}`)],
          [Markup.button.callback('❌ Отмена', `cancel:${order.id}`)],
        ]).reply_markup,
      },
    );
  }

  private async handlePaymentPhoto(ctx: Context) {
    const user = await this.ensureTelegramUser(ctx);
    const photos =
      ctx.message && 'photo' in ctx.message ? ctx.message.photo : undefined;

    if (!photos?.length) return;

    const fileId = photos[photos.length - 1].file_id;
    const tgUid = String(ctx.from!.id);

    let orderId = this.pendingScreenshotOrder.get(tgUid);
    if (!orderId) {
      const last = await this.ordersService.findLastWaitingPaymentForUser(
        user.id,
      );
      orderId = last?.id;
    }

    if (!orderId) {
      await ctx.reply(
        'Не найден заказ в статусе ожидания оплаты. Оформите покупку через «Каталог» или «Товары».',
      );
      return;
    }

    const order = await this.ordersService.findById(orderId);

    if (!order) {
      await ctx.reply('Заказ не найден.');
      return;
    }

    if (order.userId !== user.id) {
      await ctx.reply('Это не ваш заказ.');
      return;
    }

    if (order.status === OrderStatus.PENDING_REVIEW) {
      await this.notifyAdminDuplicateScreenshot(order, user);
      await ctx.reply('Скриншот по этому заказу уже получен и ждёт проверки.');
      return;
    }

    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      await ctx.reply(
        'Этот заказ уже не ожидает оплату. Создайте новый заказ.',
      );
      return;
    }

    await this.ordersService.attachTelegramPaymentProof(order.id, fileId, null);
    this.pendingScreenshotOrder.delete(tgUid);

    await ctx.reply('Скриншот получен. Ожидайте проверки администратором.');

    await this.notifyAdminNewPaymentProof(order.id, fileId, user);
  }

  private async notifyAdminNewPaymentProof(
    orderId: number,
    fileId: string,
    user: { telegramUsername?: string | null; telegramId?: string | null },
  ) {
    const admin = this.adminTelegramId;
    if (!admin || !this.bot) return;

    const order = await this.ordersService.findByIdWithRelations(orderId);
    if (!order) return;

    const caption =
      `Новый скрин оплаты\n` +
      `Заказ: #${publicOrderLabel(order)} (id ${order.id})\n` +
      `Товар: ${order.product?.name ?? '—'}\n` +
      `Сумма: ${order.amount} ₽\n` +
      `Покупатель: @${user.telegramUsername ?? '—'} (${user.telegramId})\n` +
      `Статус: ${order.status}\n` +
      `Создан: ${order.createdAt.toISOString()}`;

    await this.bot.telegram.sendPhoto(admin, fileId, {
      caption,
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback('Выдать товар', `a:${order.id}`),
          Markup.button.callback('Отклонить', `r:${order.id}`),
        ],
      ]).reply_markup,
    });
  }

  private async notifyAdminDuplicateScreenshot(
    order: Order,
    user: { telegramUsername?: string | null; telegramId?: string | null },
  ) {
    const admin = this.adminTelegramId;
    if (!admin || !this.bot) return;

    await this.bot.telegram.sendMessage(
      admin,
      `⚠️ Повторный скрин по заказу #${publicOrderLabel(order)} от @${user.telegramUsername ?? '—'} (${user.telegramId})`,
    );
  }

  private async handleAdminApprove(
    ctx: {
      from?: { id: number };
      answerCbQuery: (t?: string) => Promise<unknown>;
      reply: (t: string) => Promise<unknown>;
      editMessageReplyMarkup?: (markup: {
        inline_keyboard: [];
      }) => Promise<unknown>;
    },
    orderId: number,
  ) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.answerCbQuery('Недостаточно прав');
      return;
    }

    await ctx.answerCbQuery('Обрабатываю...');

    try {
      const result = await this.ordersService.approveManualOrder(orderId);
      const order = result.order;
      const tgBuyer = order.user?.telegramId;

      if (tgBuyer && this.bot) {
        if (result.keyDelivered && order.deliveredKey) {
          const safeKey = order.deliveredKey.replace(/`/g, "'");
          await this.bot.telegram.sendMessage(
            tgBuyer,
            `✅ Оплата подтверждена.\n\nВаш ключ: ${safeKey}\n\nСкачать чит можно в @setup_mods`,
          );
        } else if (result.noKeysAvailable) {
          await this.bot.telegram.sendMessage(
            tgBuyer,
            `✅ Оплата по заказу #${publicOrderLabel(order)} подтверждена, но ключи временно закончились. Мы свяжемся с вами.`,
          );

          const admin = this.adminTelegramId;
          if (admin) {
            await this.bot.telegram.sendMessage(
              admin,
              `⚠️ Заказ #${publicOrderLabel(order)}: ключей нет в наличии.`,
            );
          }
        }
      }

      if (ctx.editMessageReplyMarkup) {
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      }

      await ctx.reply(`Заказ #${publicOrderLabel(order)} обработан (выдача).`);
    } catch (e) {
      this.logger.warn(
        `Повторная/ошибочная попытка approve для заказа #${orderId}`,
        e instanceof Error ? e.stack : String(e),
      );

      const message = e instanceof Error ? e.message : 'Неизвестная ошибка';

      if (message.includes('Заказ не ожидает решения администратора')) {
        if (ctx.editMessageReplyMarkup) {
          await ctx
            .editMessageReplyMarkup({ inline_keyboard: [] })
            .catch(() => null);
        }

        await ctx.reply(`Заказ #${orderId} уже был обработан ранее.`);
        return;
      }

      await ctx.reply(`Ошибка при обработке заказа #${orderId}: ${message}`);
    }
  }

  private async handleAdminReject(
    ctx: {
      from?: { id: number };
      answerCbQuery: (t?: string) => Promise<unknown>;
      reply: (t: string) => Promise<unknown>;
    },
    orderId: number,
  ) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.answerCbQuery('Недостаточно прав');
      return;
    }

    await ctx.answerCbQuery();

    try {
      const saved = await this.ordersService.rejectManualOrder(orderId);
      const full = await this.ordersService.findByIdWithRelations(orderId);
      const tgBuyer = full?.user?.telegramId;

      if (tgBuyer && this.bot) {
        await this.bot.telegram.sendMessage(
          tgBuyer,
          `❌ Оплата по заказу #${full ? publicOrderLabel(full) : orderId} отклонена.`,
        );
      }

      await ctx.reply(
        `Заказ #${full ? publicOrderLabel(full) : orderId} отклонён.`,
      );
      void saved;
    } catch (e) {
      if (e instanceof BadRequestException) {
        await ctx.reply(`⚠️ ${e.message}`);
      } else {
        this.logger.error(e);
        await ctx.reply('Ошибка при отклонении заказа.');
      }
    }
  }

  private isAdmin(fromId?: number) {
    const admin = this.adminTelegramId;
    if (!admin || fromId === undefined) return false;
    return String(fromId) === admin;
  }

  private async sendSupportInfo(ctx: {
    reply: (t: string) => Promise<unknown>;
  }) {
    const username = this.config.get<string>('SUPPORT_USERNAME');
    const text = username
      ? `Поддержка: @${username.replace(/^@/, '')}\n Файлы: @setup_mods`
      : 'Напишите в поддержку через контакты на сайте.';

    await ctx.reply(text);
  }
}

function minPrice(p: { prices?: { price: number }[] }) {
  const list = p.prices ?? [];
  if (!list.length) return '—';
  return Math.min(...list.map((x) => x.price));
}

function publicOrderLabel(o: { publicId: string | null; id: number }): string {
  return o.publicId ?? String(o.id);
}
