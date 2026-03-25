import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { author, telegram, message } = await req.json();

    if (!author?.trim() || !telegram?.trim()) {
      return NextResponse.json(
        { message: 'Имя и Telegram обязательны' },
        { status: 400 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { message: 'Не настроены переменные окружения' },
        { status: 500 }
      );
    }

    const text = [
      '📩 Новое сообщение с сайта',
      `👤 Имя: ${author}`,
      `📨 Telegram: ${telegram}`,
      message?.trim() ? `💬 Сообщение: ${message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
      cache: 'no-store',
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      console.log('Telegram error:', tgData);

      return NextResponse.json(
        { message: 'Ошибка Telegram', error: tgData },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Server error:', error);

    return NextResponse.json(
      { message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}