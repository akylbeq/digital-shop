import React from 'react';
import Link from 'next/link';
import { useUserStore } from '@/app/store/user/user.store';

interface Props {
  mobile?: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const AuthBlock = ({mobile = false, setIsMenuOpen}: Props) => {
  const {user} = useUserStore();

  return (
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
};

export default AuthBlock;