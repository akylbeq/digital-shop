'use client';
import { useCategoryStore } from '@/app/store/category/category.store';
import { ICategoryWithProducts, IProduct } from '@/app/types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import NotFound from 'next/dist/client/components/builtin/not-found';
import Preloader from '@/app/components/Preloader';

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function ProductCard({ product, index }: { product: IProduct; index: number }) {
  const [hovered, setHovered] = useState(false);
  const lowestPrice = Math.min(...product.prices.map(p => p.price));
  const router = useRouter();
  const { products } = useParams();

  return (
    <article
      onClick={() => router.push(`/${products}/${product.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: '#0b0b0b',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hovered ? '0 0 40px rgba(255,255,255,0.04), 0 20px 50px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.4s ease, transform 0.4s ease, border-color 0.3s ease',
      }}
    >
      <div className="relative w-full h-60 overflow-hidden bg-white/[0.03] flex-shrink-0">
        {product.image ? (
          <img
            src={'http://localhost:8000' + product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/10 text-5xl font-light">{product.name.charAt(0)}</span>
          </div>
        )}

        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to top, #0b0b0b 0%, rgba(11,11,11,0.4) 50%, transparent 100%)' }} />

        {product.badges?.length > 0 ? (
          <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
            {product.badges.map((b, i) => (
              <div key={i}
                   className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full backdrop-blur-sm"
                   style={{ color: b.color, background: 'rgba(0,0,0,0.55)', border: `1px solid ${b.color}30` }}>
                <span dangerouslySetInnerHTML={{ __html: b.icon }} />
                <span>{b.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="absolute top-3 left-3 text-[10px] text-white/30 tracking-widest font-mono">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}

        <span className="absolute top-3 right-3 text-[10px] text-white/60 tracking-wider border border-white/15 rounded-full px-2.5 py-1 backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
          ОТ {formatPrice(lowestPrice)}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">

        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1">
          {product.name}
        </h3>
        <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-white/25 font-mono">/{product.slug}</span>
          <span
            className="text-[11px] flex items-center gap-1 transition-colors duration-200"
            style={{ color: hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>
            View
            <svg className="w-3 h-3 transition-transform duration-200"
                 style={{ transform: hovered ? 'translateX(2px)' : 'translateX(0)' }}
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}

export default function ProductPage() {
  const { fetchProductsBySlug, categoryWithProducts, categoryWithProductsLoading } = useCategoryStore();
  const { products } = useParams();

  useEffect(() => {
    if (!products) return;
    void fetchProductsBySlug(products.toString());
  }, [products]);

  if (categoryWithProductsLoading) return <Preloader />

  if (!products || !categoryWithProducts) return <NotFound />;

  const category: ICategoryWithProducts = categoryWithProducts;
  const lowestPrice = Math.min(...category.products.flatMap(p => p.prices.map(pr => pr.price)));

  return (
    <>
      <div className="min-h-screen text-white selection:bg-white selection:text-black"
           style={{ background: '#050505', fontFamily: "'DM Mono', monospace" }}>

        <div className="relative w-full h-[420px] overflow-hidden">
          {category.image ? (
            <img
              src={'http://localhost:8000' + category.image}
              alt={category.name}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.4)' }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #111 0%, #050505 100%)' }} />
          )}

          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.6) 60%, #050505 100%)' }} />

          <div className="absolute inset-0 opacity-[0.04]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

          <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-6 pb-12">
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
                    <Link href={`/${category.slug}`}>{category.name.toUpperCase()}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-10 rounded-full"
                       style={{ background: 'linear-gradient(to bottom, white, rgba(255,255,255,0.1))' }} />
                  <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    {category.name}
                  </h1>
                </div>
                <p className="text-sm text-white/50 leading-relaxed font-light max-w-md pl-4">
                  {category.description}
                </p>
              </div>

              <div className="hidden md:flex items-center gap-6 px-6 py-4 rounded-2xl border border-white/[0.08] flex-shrink-0"
                   style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
                <div className="text-center">
                  <p className="text-2xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {category.products.length}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mt-1">Всего</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {formatPrice(lowestPrice)}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mt-1">От</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
            {category.products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </section>

          <footer className="mt-16 pt-8 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-[10px] font-mono text-white/20 tracking-wider uppercase">All prices in USD · Billed as selected</p>
            <p className="text-[10px] font-mono text-white/20 tracking-wider uppercase">{category.products.length} products · {category.slug}</p>
          </footer>
        </div>
      </div>
    </>
  );
}