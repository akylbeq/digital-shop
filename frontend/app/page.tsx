import { getCategories, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  const categories = await getCategories();
  const advantages = [
    {
      title: 'Мгновенная выдача',
      text: 'После подтверждения оплаты товар автоматически появляется в личных покупках.',
    },
    {
      title: 'Проверенные поставщики',
      text: 'Публикуем только те цифровые позиции, которые проходят ручную модерацию.',
    },
    {
      title: 'Прозрачная оплата',
      text: 'Вы всегда видите статус заказа и проверку оплаты в реальном времени.',
    },
    {
      title: 'Поддержка 24/7',
      text: 'Оперативно помогаем по вопросам заказа, оплаты и активации.',
    },
  ];

  return (
    <div className="site-shell selection:bg-white selection:text-black">

      <section className="h-screen flex flex-col items-center justify-center relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="text-center z-10 w-full px-4 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.6em] text-white/40">Premium Assets</span>
            <div className="h-[1px] w-8 bg-white/20" />
          </div>

          <h1 className="text-[5vw] font-black leading-none tracking-tighter uppercase italic text-white select-none">
            Лучший магазин по продаже читов для ваших игр
          </h1>

          <p className="mt-6 text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
            Большой каталог приватных качественных читов, созданных опытными разработчиками, которые сделают вашу игру более продуктивной и комфортной.
          </p>

          <Link
          href="#categories"
          className="mt-10 px-8 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
          >
          Каталог
        </Link>
    </div>

  <div className="absolute bottom-12 flex flex-col items-center gap-4">
    <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
  </div>
</section>

  <section id="why-us" className="premium-section page-container">
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Почему стоит выбрать именно нас</p>
        <h2 className="text-3xl md:text-4xl font-semibold mt-2">Платформа для уверенных покупок</h2>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {advantages.map((item) => (
        <div key={item.title} className="premium-card p-6">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  </section>

  <section id="categories" className="page-container premium-section">
    <div className="flex items-end justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-semibold">Каталог категорий</h2>
      <span className="text-xs uppercase tracking-[0.2em] text-white/40">{categories.length} категорий</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((c) => (
        <Link
          href={`/${c.slug}`}
          key={c.slug}
        >
          <div
            key={c.id}
            className="rounded-xl border border-white/10 bg-[#0b0b0b] overflow-hidden hover:border-white/20 hover:bg-[#101010] transition cursor-pointer"
          >
            <div className="relative h-44 w-full bg-white/5">
              {c.image && (
                <Image
                  src={getImageUrl(c.image)}
                  alt={c.name}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  unoptimized
                  className="object-cover"
                  loading="lazy"
                />
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight line-clamp-1">{c.name}</h3>
                <span className={`shrink-0 text-[11px] px-2 py-1 rounded-md border ${
                  c.isActive
                    ? 'border-emerald-400/30 text-emerald-200 bg-emerald-400/10'
                    : 'border-rose-400/30 text-rose-200 bg-rose-400/10'
                }`}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/40">{c.slug}</span>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>

  <section id="how-buy" className="page-container pb-16">
    <div className="premium-card p-6 md:p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-white/45 mb-3">Как купить</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
        <div><span className="text-white font-semibold">1.</span> Выберите категорию и товар.</div>
        <div><span className="text-white font-semibold">2.</span> Оплатите удобным способом.</div>
        <div><span className="text-white font-semibold">3.</span> Получите ключ в разделе «Мои покупки».</div>
      </div>
    </div>
  </section>
</div>
);
}