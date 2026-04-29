'use client'
import { useCheckoutStore } from '@/app/store/checkout/checkout.store';
import { useEffect, useMemo, useRef, useState } from 'react';
import NotFound from 'next/dist/client/components/builtin/not-found';
import { useParams } from 'next/navigation';
import { PublicOrderStatus } from '@/app/types';
import Link from 'next/link';

const FINAL_STATUSES: PublicOrderStatus[] = [
  'PAID',
  'FAILED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
];
const POLL_INTERVAL_SECONDS = 20;

const statusUi: Record<
  PublicOrderStatus,
  { label: string; className: string; description: string }
> = {
  PENDING: {
    label: 'Создан',
    className:
      'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    description: 'Заказ создан, ожидаем переход к оплате.',
  },
  WAITING_PAYMENT: {
    label: 'Ожидание оплаты',
    className:
      'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    description: 'Платеж еще не подтвержден. Статус обновляется автоматически.',
  },
  PENDING_REVIEW: {
    label: 'На проверке',
    className: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
    description: 'Платеж отправлен на ручную проверку администратору.',
  },
  PAID: {
    label: 'Оплачено',
    className: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
    description: 'Оплата подтверждена. Товар должен быть выдан автоматически.',
  },
  REJECTED: {
    label: 'Отклонено',
    className: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
    description: 'Платеж отклонен. Обратитесь в поддержку.',
  },
  FAILED: {
    label: 'Ошибка оплаты',
    className: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
    description: 'Платеж не прошел. Попробуйте повторить оплату.',
  },
  CANCELLED: {
    label: 'Отменено',
    className: 'border-zinc-500/40 text-zinc-300 bg-zinc-500/10',
    description: 'Заказ был отменен.',
  },
  EXPIRED: {
    label: 'Истек',
    className: 'border-zinc-500/40 text-zinc-300 bg-zinc-500/10',
    description: 'Время на оплату истекло.',
  },
};

export default function Invoice() {
  const {order, getOrderStatus, orderStatus} = useCheckoutStore();
  const {id} = useParams();
  const [isPolling, setIsPolling] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [hasRequestedStatus, setHasRequestedStatus] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(POLL_INTERVAL_SECONDS);
  const autoOpenDoneRef = useRef(false);

  const statusView = useMemo(() => {
    if (!orderStatus) return statusUi.WAITING_PAYMENT;
    return statusUi[orderStatus.status] ?? statusUi.WAITING_PAYMENT;
  }, [orderStatus]);

  const runStatusCheck = async () => {
    const ok = await getOrderStatus(id as string);
    setHasRequestedStatus(true);
    setStatusError(ok ? null : 'Не удалось получить статус оплаты');
    setSecondsLeft(POLL_INTERVAL_SECONDS);
  };

  useEffect(() => {
    if (!id) return;
    if (!order?.payment_url || autoOpenDoneRef.current) return;
    window.open(order.payment_url, '_blank', 'noopener,noreferrer');
    autoOpenDoneRef.current = true;
  }, [order?.payment_url, id]);

  useEffect(() => {
    if (!id) return;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let countdownTimer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const runCheck = async () => {
      if (cancelled) return;
      await runStatusCheck();
    };

    void runCheck();
    pollTimer = setInterval(() => {
      if (!isPolling) return;
      void runCheck();
    }, POLL_INTERVAL_SECONDS * 1000);

    countdownTimer = setInterval(() => {
      if (!isPolling) return;
      setSecondsLeft((prev) => (prev <= 1 ? POLL_INTERVAL_SECONDS : prev - 1));
    }, 1000);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [id, isPolling]);

  useEffect(() => {
    if (!orderStatus) return;
    if (FINAL_STATUSES.includes(orderStatus.status)) {
      setIsPolling(false);
    }
  }, [orderStatus]);

  if (!hasRequestedStatus && !orderStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-white/70">
        Проверяем статус заказа...
      </div>
    );
  }

  if (hasRequestedStatus && !orderStatus) {
    return <NotFound />;
  }
  const currentOrder = orderStatus;
  if (!currentOrder) {
    return <NotFound />;
  }
  const isPaid = currentOrder.status === 'PAID';

  return (
    <div className="site-shell flex items-center justify-center p-4">

      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0f14] shadow-2xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-white">
            Оплата заказа
          </h1>

          <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${statusView.className}`}>
            <span className={isPolling ? 'animate-pulse' : ''}>●</span>
            {statusView.label}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4 space-y-4 bg-white/5">

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">ID заказа</span>
            <span className="text-white font-medium">{currentOrder.publicId}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Товар</span>
            <span className="text-white font-medium">{currentOrder.product}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Подписка</span>
            <span className="text-white font-medium">{currentOrder.duration}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Дата заказа</span>
            <span className="text-white font-medium">
              {(new Date(currentOrder.createdAt).toLocaleString())}
            </span>
          </div>

          <div className="text-sm text-gray-300">
            {statusView.description}
          </div>
          {isPolling && !isPaid && (
            <div className="text-xs text-white/60">
              Следующая проверка оплаты через: <span className="text-white">{secondsLeft} сек</span>
            </div>
          )}

          {currentOrder.status === 'PAID' && currentOrder.deliveredKey && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-200/80 mb-1">Ваш ключ:</p>
              <code className="text-emerald-100 break-all">{currentOrder.deliveredKey}</code>
            </div>
          )}

          {statusError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {statusError}
            </div>
          )}
        </div>

        {isPaid ? (
          <Link
            href="/purchases"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-black bg-white hover:bg-zinc-100 transition"
          >
            Перейти к покупкам
          </Link>
        ) : (
          <button
            onClick={() => {
              if (order?.payment_url) {
                window.open(order.payment_url, '_blank', 'noopener,noreferrer');
              }
            }}
            disabled={!order?.payment_url}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>↗</span>
            {order?.payment_url ? 'Перейти к оплате' : 'Ожидайте подтверждения администратора'}
          </button>
        )}

      </div>
    </div>
  );
}