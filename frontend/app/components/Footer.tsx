'use client';

import Link from 'next/link';
import { LifeBuoy, MessageSquare, Send } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#050505] py-12 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">

          <div className="flex items-center gap-4 order-3 md:order-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              © {currentYear} EXPLOIT
            </span>
            <div className="w-[1px] h-3 bg-white/10 hidden sm:block"/>
            <span className="hidden sm:block text-[9px] uppercase tracking-widest text-white/10 font-mono">
              v2.0.4_stable
            </span>
          </div>

          <div className="flex items-center gap-8 order-2 md:order-3">
            <Link
              href="https://t.me/..."
              target="_blank"
              className="group flex items-center gap-2 text-white/40 hover:text-white transition-all"
            >
              <Send size={16} className="group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"/>
              <span className="text-[9px] uppercase tracking-widest">Telegram</span>
            </Link>

            <Link
              href="https://discord.gg/..."
              target="_blank"
              className="group flex items-center gap-2 text-white/40 hover:text-white transition-all"
            >
              <MessageSquare size={16} className="group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"/>
              <span className="text-[9px] uppercase tracking-widest">Discord</span>
            </Link>

            <Link
              href="/support"
              className="group flex items-center gap-2 text-white/40 hover:text-white transition-all"
            >
              <LifeBuoy size={16} className="group-hover:rotate-45 transition-transform"/>
              <span className="text-[9px] uppercase tracking-widest">Help</span>
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}