'use client'
import { useCheckoutStore } from '@/app/store/checkout/checkout.store';
import { useEffect } from 'react';
import NotFound from 'next/dist/client/components/builtin/not-found';
import { useParams } from 'next/navigation';

export default function Invoice() {
  const {order, getOrderStatus, orderStatus} = useCheckoutStore();
  const {id} = useParams();

  useEffect(() => {
    getOrderStatus(id as string);
    if (order)
      window.open(order.payment_url, '_blank', 'noopener,noreferrer');
  }, [order, id]);

  if (!orderStatus) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0f14] shadow-2xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-white">
            Оплата заказа
          </h1>

          <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-yellow-500/40 text-yellow-400 bg-yellow-500/10">
            <span className="animate-pulse">🔄</span>
            Ожидание оплаты
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4 space-y-4 bg-white/5">

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">ID заказа</span>
            <span className="text-white font-medium">{orderStatus.publicId}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Товар</span>
            <span className="text-white font-medium">{orderStatus.product}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Подписка</span>
            <span className="text-white font-medium">{orderStatus.duration}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Дата заказа</span>
            <span className="text-white font-medium">
              {(new Date(orderStatus.createdAt).toLocaleString())}
            </span>
          </div>

        </div>

        <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 active:scale-[0.99] transition">
          <span>↗</span>
          Перейти к оплате
        </button>

      </div>
    </div>
  );
}