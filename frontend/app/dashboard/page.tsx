'use client';
import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
red
      {/*/!* 1. ПОД-ШАПКА (Sub-navigation) — Только системные вкладки *!/*/}
      {/*<div className="sticky top-[72px] z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">*/}
      {/*  <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">*/}
      {/*    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">*/}
      {/*      {[*/}
      {/*        { id: 'inventory', label: 'Products', icon: ShoppingCart },*/}
      {/*        { id: 'categories', label: 'Categories', icon: Layers },*/}
      {/*        { id: 'stats', label: 'Analytics', icon: BarChart3 },*/}
      {/*      ].map((item) => (*/}
      {/*        <button*/}
      {/*          key={item.id}*/}
      {/*          onClick={() => setActiveTab(item.id)}*/}
      {/*          className={`flex items-center gap-2 px-1 py-4 text-[10px] uppercase tracking-widest transition-all relative ${*/}
      {/*            activeTab === item.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'*/}
      {/*          }`}*/}
      {/*        >*/}
      {/*          <item.icon size={13} />*/}
      {/*          {item.label}*/}
      {/*          {activeTab === item.id && (*/}
      {/*            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white animate-in slide-in-from-left-full" />*/}
      {/*          )}*/}
      {/*        </button>*/}
      {/*      ))}*/}
      {/*    </div>*/}

      {/*    <div className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600 font-mono">*/}
      {/*      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />*/}
      {/*      Admin_Mode: Active*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*/!* 2. КОНТЕНТ *!/*/}
      {/*<main className="max-w-[1400px] mx-auto px-6 py-12 mt-6">*/}

      {/*  /!* Заголовок секции и кнопка добавления *!/*/}
      {/*  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">*/}
      {/*    <div className="space-y-1">*/}
      {/*      <h1 className="text-4xl font-title uppercase tracking-tighter italic">*/}
      {/*        {activeTab} <span className="text-zinc-800 not-italic">Control</span>*/}
      {/*      </h1>*/}
      {/*      <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Database_v2.0 // Node_Active</p>*/}
      {/*    </div>*/}

      {/*    <div className="flex items-center gap-3 w-full md:w-auto">*/}
      {/*      <div className="relative flex-1 md:w-72">*/}
      {/*        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />*/}
      {/*        <input*/}
      {/*          className="w-full bg-white/[0.02] border border-white/5 py-3.5 pl-11 pr-4 text-[10px] uppercase tracking-widest outline-none focus:border-white/10 transition-all"*/}
      {/*          placeholder="Filter by ID or Name..."*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*      <button*/}
      {/*        onClick={() => setIsModalOpen(true)}*/}
      {/*        className="bg-white text-black px-6 py-3.5 hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2"*/}
      {/*      >*/}
      {/*        <Plus size={18} />*/}
      {/*        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Add</span>*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  </div>*/}

      {/*  /!* Список товаров (List Mode) *!/*/}
      {/*  <div className="border border-white/5 bg-white/[0.01]">*/}
      {/*    <div className="overflow-x-auto">*/}
      {/*      <table className="w-full text-left min-w-[700px]">*/}
      {/*        <thead>*/}
      {/*        <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.3em] text-zinc-500">*/}
      {/*          <th className="px-8 py-6">Reference</th>*/}
      {/*          <th className="px-8 py-6">Designation</th>*/}
      {/*          <th className="px-8 py-6">Value</th>*/}
      {/*          <th className="px-8 py-6 text-right">Actions</th>*/}
      {/*        </tr>*/}
      {/*        </thead>*/}
      {/*        <tbody className="text-[11px] font-mono">*/}
      {/*        {[1, 2, 3, 4, 5].map((i) => (*/}
      {/*          <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">*/}
      {/*            <td className="px-8 py-6 text-zinc-600">#000{i}</td>*/}
      {/*            <td className="px-8 py-6">*/}
      {/*              <div className="flex items-center gap-3">*/}
      {/*                <div className="w-2 h-2 bg-white/10 group-hover:bg-white transition-colors" />*/}
      {/*                <span className="uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">Digital_Asset_0{i}</span>*/}
      {/*              </div>*/}
      {/*            </td>*/}
      {/*            <td className="px-8 py-6 text-white/60">$29.99</td>*/}
      {/*            <td className="px-8 py-6">*/}
      {/*              <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">*/}
      {/*                <button className="text-zinc-500 hover:text-white"><Edit3 size={14} /></button>*/}
      {/*                <button className="text-zinc-500 hover:text-red-500"><Trash2 size={14} /></button>*/}
      {/*              </div>*/}
      {/*            </td>*/}
      {/*          </tr>*/}
      {/*        ))}*/}
      {/*        </tbody>*/}
      {/*      </table>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</main>*/}

      {/*/!* Модалка (сохраняем стиль) *!/*/}
      {/*{isModalOpen && (*/}
      {/*  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">*/}
      {/*    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />*/}
      {/*    <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-10 animate-in zoom-in-95 duration-200">*/}
      {/*      <div className="flex justify-between items-center mb-10">*/}
      {/*        <h2 className="text-2xl font-title uppercase italic">Deployment</h2>*/}
      {/*        <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>*/}
      {/*      </div>*/}
      {/*      /!* Форма *!/*/}
      {/*      <button className="w-full py-5 bg-white text-black font-bold text-[10px] uppercase tracking-[0.4em] mt-8 hover:bg-zinc-200 transition-all">*/}
      {/*        Execute Process*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}