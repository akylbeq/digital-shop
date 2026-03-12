'use client';
import { useProductStore } from '@/app/store/product/product.store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Preloader from '@/app/components/Preloader';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import NotFound from 'next/dist/client/components/builtin/not-found';

export default function ProductPage() {
  const { product, fetchProductBySlug, productLoading } = useProductStore();
  const { productPage, products: categorySlug } = useParams();
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!productPage) return;
    void fetchProductBySlug(productPage.toString());
  }, [productPage]);

  useEffect(() => {
    if (product?.prices?.length) setSelected(0);
  }, [product]);

  if (!productPage) return null;
  if (productLoading) return <Preloader />;
  if (!product) return <NotFound />;

  const selectedPrice = selected !== null ? product.prices[selected] : null;
  const allImages = [product.image, ...(product.imagesAlbum || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <Breadcrumb className="mb-10">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${product.category.slug}`}>{product.category.name.toUpperCase()}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${product.slug}`}>{product.name.toUpperCase()}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* ── TOP BLOCK ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Carousel */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {allImages.map((img, i) => (
                  <CarouselItem key={i}>
                    <div className="rounded-2xl overflow-hidden bg-[#0b0b0b] border border-white/10 aspect-video">
                      <img
                        src={`http://localhost:8000${img}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
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

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3">
                {allImages.map((img, i) => (
                  <div key={i} className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <img src={`http://localhost:8000${img}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            {product.badges?.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                {product.badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm" style={{ color: b.color }}>
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

            {/* Prices */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-3">Select period</p>
              <div className="grid grid-cols-3 gap-2">
                {product.prices.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className="flex flex-col gap-1.5 p-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: selected === i ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border: selected === i ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                      transform: selected === i ? 'translateY(-1px)' : 'translateY(0)',
                    }}
                  >
                    <span className="text-[10px] text-white/35 uppercase tracking-widest">{p.duration}</span>
                    <span className="text-lg font-semibold text-white">${p.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Buy */}
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between px-1 mb-1">
                <span className="text-xs text-white/30">Total</span>
                <span className="text-2xl font-semibold text-white">
                  {selectedPrice ? `$${selectedPrice.price}` : '—'}
                </span>
              </div>
              <button
                disabled={!selectedPrice || !product.isActive}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30 hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'white', color: '#050505' }}
              >
                {selectedPrice ? `Buy · $${selectedPrice.price}` : 'Select period'}
              </button>
              <button
                onClick={() => router.push(`/${categorySlug}`)}
                className="w-full py-3 rounded-xl text-sm text-white/30 hover:text-white/60 border border-white/[0.07] hover:border-white/15 transition-all"
              >
                ← Back
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-4 flex-wrap pt-1">
              {['🔒 Secure payment', '⚡ Instant delivery', '✅ Money-back guarantee'].map(item => (
                <span key={item} className="text-[11px] text-white/25">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        {product.features?.length > 0 && (
          <div>
            <div className="h-px bg-white/[0.06] mb-10" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-6">Features</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.features.map((f, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    {f.icon && <span dangerouslySetInnerHTML={{ __html: f.icon }} />}
                    <span className="text-sm font-medium text-white">{f.title}</span>
                  </div>
                  <ul className="space-y-2">
                    {f.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-2 text-xs text-white/40 leading-relaxed">
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
      </div>
    </div>
  );
}