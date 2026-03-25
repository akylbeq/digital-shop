'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import { IProduct } from '@/app/types';
import { getImageUrl } from '@/lib/api';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default function ProductClient({ product }: { product: IProduct }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const selectedIndex = selected ?? (product.prices.length ? 0 : null);
  const selectedPrice =
    selectedIndex !== null ? product.prices[selectedIndex] : null;

  const allImages = useMemo(
    () => [product.image, ...(product.imagesAlbum || [])].filter(Boolean) as string[],
    [product.image, product.imagesAlbum]
  );

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useState(() => {
    if (!api) return;
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {allImages.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="relative rounded-2xl overflow-hidden bg-[#0b0b0b] border border-white/10 aspect-video">
                    <Image
                      fill
                      src={getImageUrl(img)}
                      alt={product.name}
                      className="object-cover"
                      unoptimized
                      sizes="100vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {allImages.length > 1 && (
              <>
                <CarouselPrevious className="left-3 bg-black/60 border-white/10 hover:bg-black/80" />
                <CarouselNext className="right-3 bg-black/60 border-white/10 hover:bg-black/80" />
              </>
            )}
          </Carousel>

          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={`relative w-16 h-10 rounded-lg overflow-hidden border cursor-pointer transition-opacity ${
                    current === i ? 'opacity-100 border-white/30' : 'opacity-60 border-white/10'
                  }`}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={img}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {product.badges?.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              {product.badges.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: b.color }}
                >
                  <span dangerouslySetInnerHTML={{ __html: b.icon }} />
                  <span>{b.title}</span>
                </div>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight tracking-tight">
            {product.name}
          </h1>

          <p className="text-sm text-white/45 leading-relaxed">
            {product.description}
          </p>

          <div className="h-px bg-white/[0.06]" />

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-3">
              Выберите период
            </p>
            <div className="grid grid-cols-3 gap-2">
              {product.prices.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="flex flex-col gap-1.5 p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    background:
                      selectedIndex === i
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(255,255,255,0.02)',
                    border:
                      selectedIndex === i
                        ? '1px solid rgba(255,255,255,0.3)'
                        : '1px solid rgba(255,255,255,0.07)',
                    transform:
                      selectedIndex === i ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  <span className="text-[10px] text-white/35 uppercase tracking-widest">
                    {p.duration}
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatPrice(p.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1 mb-1">
              <span className="text-xs text-white/30">Итого</span>
              <span className="text-2xl font-semibold text-white">
                {selectedPrice ? formatPrice(selectedPrice.price) : '—'}
              </span>
            </div>

            <Link href="https://t.me/xploi">
              <button
                disabled={!selectedPrice || !product.isActive}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30 hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'white', color: '#050505' }}
              >
                {selectedPrice ? `Купить за · ` +  formatPrice(selectedPrice.price) : 'Select period'}
              </button>
            </Link>

            <Link
              href={`/${product.category.slug}`}
              className="w-full py-3 rounded-xl text-sm text-center text-white/30 hover:text-white/60 border border-white/[0.07] hover:border-white/15 transition-all"
            >
              ← Назад
            </Link>
          </div>

          <div className="flex items-center gap-4 flex-wrap pt-1">
            {['🔒 Secure payment', '⚡ Instant delivery', '✅ Money-back guarantee'].map(
              (item) => (
                <span key={item} className="text-[11px] text-white/25">
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {product.features?.length > 0 && (
        <div>
          <div className="h-px bg-white/[0.06] mb-10" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-6">
            Функции
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  {f.icon && <span dangerouslySetInnerHTML={{ __html: f.icon }} />}
                  <span className="text-sm font-medium text-white">{f.title}</span>
                </div>
                <ul className="space-y-2">
                  {f.items.map((item, ii) => (
                    <li
                      key={ii}
                      className="flex items-start gap-2 text-xs text-white/40 leading-relaxed"
                    >
                      <span className="text-white/20 shrink-0 mt-0.5">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}