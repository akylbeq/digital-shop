'use client';
import React from 'react';
import { useUserStore } from '@/app/store/user/user.store';
import { Clock, CreditCard, LogOut, Package, Settings, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout} = useUserStore();
  const router = useRouter();

  const logOut = () => {
    logout();
    router.push('/');
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-main pb-20">
      {/* Сетка на фоне для технологичного вида */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-32 relative z-10">

        {/* Header Профиля */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <User size={40} className="text-white/20" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white text-black p-1.5 rounded-lg">
                <Shield size={14} fill="currentColor" />
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-1">Authenticated User</p>
              <h1 className="font-title text-2xl md:text-3xl tracking-widest uppercase">{user.email.split('@')[0]}</h1>
              <p className="text-xs font-mono text-white/40 mt-1">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logOut}
            className="flex items-center gap-2 px-6 py-3 border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all text-[10px] font-title uppercase tracking-widest"
          >
            <LogOut size={14} />
            Logout Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Левая колонка: Навигация/Статистика */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl">
              <h3 className="font-title text-[10px] tracking-widest text-white/30 uppercase mb-6">Account Balance</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light">$0.00</span>
                <span className="text-xs text-white/20 uppercase font-title tracking-tighter">USD</span>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-black font-title text-[10px] tracking-widest uppercase hover:bg-zinc-200 transition-colors">
                Top Up Balance
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { icon: Package, label: 'My Purchases', active: true },
                { icon: CreditCard, label: 'Billing History', active: false },
                { icon: Settings, label: 'Security Settings', active: false },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all border ${
                    item.active
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'border-transparent text-white/40 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-xs uppercase tracking-[0.2em] font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Правая колонка: Контент (Заказы) */}
          <div className="lg:col-span-8">
            <div className="border border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="font-title text-xs tracking-[0.3em] uppercase">Recent Activity</h2>
                <Clock size={16} className="text-white/20" />
              </div>

              {/* Состояние пустого списка заказов */}
              <div className="p-20 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 opacity-20">
                  <Package size={32} />
                </div>
                <p className="font-title text-[10px] tracking-widest text-white/30 uppercase mb-2">No active orders</p>
                <p className="text-sm text-white/10 max-w-[240px]">У вас пока нет приобретенных товаров. Все ваши покупки появятся здесь.</p>
                <a href="/" className="mt-8 text-[10px] font-title uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-white transition-all">
                  Browse Shop
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}