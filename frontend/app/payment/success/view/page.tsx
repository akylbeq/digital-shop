'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrderStatusResponse = {
  id: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  isDelivered: boolean;
  deliveredKey: string | null;
};

export default function SuccessPage() {
  const [data, setData] = useState<OrderStatusResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (!orderId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${orderId}/status`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-4xl font-black uppercase italic">Success</h1>

        {!data && (
          <p className="mt-4 text-white/60">Проверяем статус оплаты...</p>
        )}

        {data?.status === 'PENDING' && (
          <p className="mt-4 text-white/60">Платёж ещё обрабатывается...</p>
        )}

        {data?.status === 'FAILED' && (
          <p className="mt-4 text-rose-300">Оплата не прошла.</p>
        )}

        {data?.status === 'PAID' && (
          <div className="mt-6">
            <p className="text-emerald-300">Оплата успешна.</p>

            {data.deliveredKey ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-black p-4">
                <p className="text-sm text-white/50 mb-2">Ваш ключ:</p>
                <code className="break-all text-white">{data.deliveredKey}</code>
              </div>
            ) : (
              <p className="mt-4 text-white/60">Товар готовится к выдаче...</p>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/frontend/public"
            className="px-5 py-3 rounded-xl bg-white text-black hover:bg-white/90 transition"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}