'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShieldCheck } from 'lucide-react';
import $api from '@/app/axiosApi';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

type PurchaseOrder = {
  amount: string;
  status: 'PAID';
  paymentSource: string | null;
  deliveredKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await $api.get<PurchaseOrder[]>('/orders/my');
        setOrders(data);
      } catch (e) {
        if (isAxiosError(e)) {
          const msg = e.response?.data?.message;
          toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Не удалось загрузить покупки');
        } else {
          toast.error('Не удалось загрузить покупки');
        }
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
    const timer = setInterval(() => {
      void loadOrders();
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="site-shell font-main pb-20">
      <div className="page-container pt-24">
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h1 className="text-sm md:text-base uppercase tracking-[0.3em] text-white/80">Мои покупки</h1>
            <ShieldCheck className="text-white/40" size={18} />
          </div>

          {loading ? (
            <div className="p-10 text-white/60 text-sm">Загружаем покупки...</div>
          ) : orders.length === 0 ? (
            <div className="p-16 md:p-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6">
                <Package className="text-white/40" size={30} />
              </div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Здесь будут ваши покупки</p>
              <p className="text-sm text-white/25 mt-3 max-w-md">
                После успешной оплаты заказ появится в этом разделе автоматически.
              </p>
              <Link
                href="/#categories"
                className="mt-8 px-6 py-2.5 border border-white/20 text-white/90 hover:bg-white hover:text-black transition"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {orders.map((order) => (
                <div key={`${order.createdAt}-${order.updatedAt}-${order.amount}`} className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">Покупка</p>
                      <p className="text-xs text-white/50 mt-1">
                        Источник оплаты: {order.paymentSource ?? '—'}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-white">{Number(order.amount).toFixed(2)} ₽</p>
                      <p className="text-xs text-white/50 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-white/70">Статус: {order.status}</div>
                  {order.deliveredKey && (
                    <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="text-[11px] text-emerald-100/80 mb-1">Ключ доступа</p>
                      <code className="text-emerald-100 break-all">{order.deliveredKey}</code>
                    </div>
                  )}
                  {order.status === 'PAID' && !order.deliveredKey && (
                    <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                      <p className="text-[11px] text-yellow-100/90">
                        Оплата подтверждена. Ключ готовится к выдаче, обновим список автоматически.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
