'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthBlock from '@/app/components/AuthBlock';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header
        className="border-b border-white/5"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 md:px-10 lg:px-0 py-6">
          <Link
            href="/"
            className="group flex items-center font-mono transition-all duration-300"
          >
          <span className="text-white/20 group-hover:text-white transition-colors duration-300">
            [
          </span>

            <span className="px-2 text-base sm:text-lg tracking-[0.2em] uppercase font-medium text-white">
              ZSoft
          <span
            className="ml-1 inline-block w-2 h-4 bg-white animate-[pulse_1s_infinite] align-middle group-hover:bg-red-600 transition-colors"/>
          </span>

            <span className="text-white/20 group-hover:text-white transition-colors duration-300">
            ]
  </span>

          </Link>

          <nav className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.3em] text-gray-500">
            <Link href="/#categories"
                  className="hover:text-white transition-colors font-mono font-medium text-sm">Каталог</Link>
            <Link href="/contact"
                  className="hover:text-white transition-colors font-mono font-medium text-sm">Контакты</Link>
          </nav>

          <AuthBlock setIsMenuOpen={setIsMenuOpen} />

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 w-6 h-6 justify-center z-50"
            aria-label="Menu"
          >
          <span
            className={`w-full h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span
              className={`w-full h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span
              className={`w-full h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </header>
      <div
        className={`fixed inset-0 backdrop-blur-xl z-40 transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <nav className="flex flex-col items-center justify-center h-full gap-12">
          <div className="flex flex-col items-center gap-8">
            <Link
              href="/#categories"
              className="text-lg uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link
              href="/contact"
              className="text-lg uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Контакты
            </Link>
          </div>

          <div className="w-8 h-[1px] bg-white/10"></div>

          <AuthBlock mobile setIsMenuOpen={setIsMenuOpen} />
        </nav>
      </div>
    </>
  );
}