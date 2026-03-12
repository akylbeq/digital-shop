'use client';
import React, { useEffect, useState } from 'react';
import { BarChart3, Layers, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  const navItems = [
    { id: 'inventory', label: 'Products', icon: ShoppingCart, href: '/dashboard/products' },
    { id: 'categories', label: 'Categories', icon: Layers, href: '/dashboard/categories' },
    { id: 'stats', label: 'Analytics', icon: BarChart3, href: '/dashboard/stats' },
  ];

  return (
    <div className="mt-12 min-h-screen bg-[#050505] text-zinc-100 font-sans">
      {/* 1. ПОД-ШАПКА (Sub-navigation) */}
      <div className="sticky top-[80] bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2 px-1 py-4 text-[10px] uppercase tracking-widest transition-all relative ${
                  pathname === item.href ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <item.icon size={13} />
                {item.label}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. КОНТЕНТ */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}