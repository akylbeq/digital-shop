import Link from 'next/link';

export default function FailPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 w-full max-w-4xl px-4 text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.6em] text-white/40">
              Payment Status
            </span>
            <div className="h-[1px] w-8 bg-white/20" />
          </div>

          <div className="mb-6 inline-flex items-center rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-rose-200">
            Payment Failed
          </div>

          <h1 className="text-[16vw] sm:text-[12vw] lg:text-[8rem] font-black leading-none tracking-tighter uppercase italic text-white mix-blend-difference select-none">
            Fail
          </h1>

          <p className="mt-6 max-w-xl text-sm sm:text-base text-white/60 leading-relaxed">
            Оплата не была завершена. Попробуй ещё раз или выбери другой способ оплаты.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="px-8 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
            >
              На главную
            </Link>

            <Link
              href="/#categories"
              className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-colors"
            >
              В каталог
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}