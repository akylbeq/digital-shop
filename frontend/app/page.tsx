import { getCategories, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  const categories = await getCategories();
  console.log(categories);

  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-black">

      <section className="h-screen flex flex-col items-center justify-center relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="text-center z-10 w-full px-4 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.6em] text-white/40">Premium Assets</span>
            <div className="h-[1px] w-8 bg-white/20" />
          </div>

          <h1 className="text-[18vw] font-black leading-none tracking-tighter uppercase italic text-white mix-blend-difference select-none">
            eprime
          </h1>

          <p className="mt-6 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
            Secure. Digital. Distributed.
          </p>

          <a
          href="#categories"
          className="mt-10 px-8 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
          >
          Каталог
        </a>
    </div>

  <div className="absolute bottom-12 flex flex-col items-center gap-4">
    <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
  </div>
</section>

  <section id="categories" className="max-w-6xl mx-auto py-12 px-4 sm:px-6 md:px-10 lg:px-0 ">
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
</div>
);
}