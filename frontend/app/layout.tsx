import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Providers from '@/app/components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Exploit - Digital Shop',
  description: 'Магазин цифровых товаров. Игры, программы, подписки. Мгновенная доставка 24/7.',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
    >
    <Providers>
      <Header/>
      <main className="pt-[87px]">
        {children}
      </main>
      <Footer/>
    </Providers>
    </body>
    </html>
  );
}