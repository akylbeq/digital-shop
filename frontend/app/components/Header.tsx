'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUserStore } from '@/app/store/user/user.store';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user} = useUserStore();


  const AuthBlock = ({mobile = false}) => (
    <div className={`${mobile ? 'flex flex-col gap-6' : 'hidden md:flex items-center gap-8'}`}>
      {user?.role === 'admin' && (
        <Link
          href="/dashboard"
          className="group relative flex items-center gap-2 px-3 py-1 border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all duration-300"
        >
          <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
    </span>

          <span
            className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/50 group-hover:text-white transition-colors">
      Root_Access
    </span>

          <div
            className="absolute -top-[1px] -right-[1px] w-1 h-1 border-t border-r border-white/40 group-hover:border-white transition-colors"/>
        </Link>
      )}
      {user ? (
        <Link
          href="/profile"
          onClick={() => setIsMenuOpen(false)}
          className={`group flex items-center gap-4 transition-all duration-300 ${mobile ? 'w-full' : ''}`}
        >
          <div className="flex flex-col items-end">
            <span
              className="text-[9px] text-white/30 uppercase tracking-[0.3em] group-hover:text-white/50 transition-colors">
              Authorized
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white">
              {user.email.split('@')[0]}
            </span>
          </div>

          <div
            className="w-8 h-8 border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-white/30 transition-all">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"/>
          </div>
        </Link>
      ) : (
        <div className={`flex ${mobile ? 'flex-col gap-6' : 'items-center gap-8'}`}>
          <Link
            href="/auth/login"
            onClick={() => setIsMenuOpen(false)}
            className="text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all duration-500"
          >
            Войти
          </Link>

          <Link
            href="/auth/register"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-2 border border-white text-white text-[10px] font-title uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 active:scale-95 text-center"
          >
            Регистрация
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-10 py-6 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/5">
        <Link
          href="/"
          className="group flex items-center font-mono transition-all duration-300"
        >
          <span className="text-white/20 group-hover:text-white transition-colors duration-300">
    [
  </span>

          <span className="px-2 text-base sm:text-lg tracking-[0.2em] uppercase font-medium text-white">
    Exploit
    <span
      className="ml-1 inline-block w-2 h-4 bg-white animate-[pulse_1s_infinite] align-middle group-hover:bg-red-600 transition-colors"/>
  </span>

          <span className="text-white/20 group-hover:text-white transition-colors duration-300">
    ]
  </span>

          <div className="ml-4 hidden lg:block overflow-hidden">
            <div
              className="text-[8px] leading-tight text-white/20 uppercase tracking-widest group-hover:-translate-y-full transition-transform duration-500">
              <p>System.Ready</p>
              <p className="text-white/60">Access.Granted</p>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.3em] text-gray-500">
          <Link href="/#categories"
                className="hover:text-white transition-colors font-mono font-medium text-sm">Каталог</Link>
          <Link href="/contact"
                className="hover:text-white transition-colors font-mono font-medium text-sm">Контакты</Link>
        </nav>

        <AuthBlock/>

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
      </header>

      <div
        className={`fixed inset-0 bg-[#0a0a0a]/98 backdrop-blur-xl z-40 transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
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

          <AuthBlock mobile/>
        </nav>
      </div>
    </>
  );
}