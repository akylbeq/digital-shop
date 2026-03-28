'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/app/components/Pagination';
import {
  IOrderDetail,
  OrderStatus,
  useOrdersStore,
} from '@/app/store/orders/orders.store';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'WAITING_PAYMENT', label: 'WAITING_PAYMENT' },
  { value: 'PENDING_REVIEW', label: 'PENDING_REVIEW' },
  { value: 'PAID', label: 'PAID' },
  { value: 'REJECTED', label: 'REJECTED' },
  { value: 'FAILED', label: 'FAILED' },
];

export default function OrdersPage() {
  const {
    orders,
    total,
    loading,
    fetchOrders,
    fetchOrder,
    approve,
    reject,
  } = useOrdersStore();

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<IOrderDetail | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = useCallback(() => {
    const st =
      statusFilter === 'all' ? undefined : (statusFilter as OrderStatus);
    void fetchOrders(page, limit, st);
  }, [fetchOrders, page, limit, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: number) => {
    const d = await fetchOrder(id);
    setDetail(d);
    setRejectComment('');
    setDetailOpen(true);
  };

  const handleApprove = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      await approve(detail.id);
      setDetailOpen(false);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      await reject(detail.id, rejectComment || undefined);
      setDetailOpen(false);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold uppercase tracking-tighter flex items-center gap-2">
            <ClipboardList size={20} />
            Orders
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Total: {total} | Page: {page}/{totalPages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] h-9 bg-zinc-900 border-white/10 text-[11px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-sm border border-white/5 bg-zinc-950/50 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Public ID</th>
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Покупатель</th>
              <th className="px-4 py-3">Дата</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-zinc-500 text-center">
                  Загрузка…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-zinc-500 text-center">
                  Нет заказов
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => void openDetail(o.id)}
                >
                  <td className="px-4 py-3 text-zinc-500">{o.id}</td>
                  <td className="px-4 py-3">{o.publicId}</td>
                  <td className="px-4 py-3">{o.product?.name ?? '—'}</td>
                  <td className="px-4 py-3">{o.amount}</td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3">
                    {o.user?.telegramUsername
                      ? `@${o.user.telegramUsername}`
                      : o.user?.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg bg-[#0a0a0a] border-white/10 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">
              Заказ #{detail?.publicId ?? ''}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-2 text-zinc-400">
                <span>Статус</span>
                <span className="text-white">{detail.status}</span>
                <span>Товар</span>
                <span className="text-white">{detail.product?.name ?? '—'}</span>
                <span>Сумма</span>
                <span className="text-white">{detail.amount}</span>
                <span>Источник оплаты</span>
                <span className="text-white">{detail.paymentSource ?? '—'}</span>
                <span>Telegram</span>
                <span className="text-white">
                  {detail.user?.telegramId
                    ? `${detail.user.telegramUsername ?? '—'} (${detail.user.telegramId})`
                    : '—'}
                </span>
              </div>

              {detail.paymentProofUrl && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Скрин оплаты
                  </p>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                    <Image
                      src={detail.paymentProofUrl}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {detail.deliveredKey && (
                <div>
                  <p className="text-[10px] uppercase text-zinc-500 mb-1">
                    Выданный ключ
                  </p>
                  <code className="text-xs break-all text-emerald-400">
                    {detail.deliveredKey}
                  </code>
                </div>
              )}

              {detail.adminReviewComment && (
                <p className="text-xs text-amber-200/90">
                  Комментарий: {detail.adminReviewComment}
                </p>
              )}

              {detail.status === 'PENDING_REVIEW' && (
                <div className="space-y-2 pt-2">
                  <Textarea
                    placeholder="Комментарий при отклонении (необязательно)"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    className="bg-zinc-900 border-white/10 text-xs min-h-[72px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/40 text-red-300"
                      disabled={actionLoading}
                      onClick={() => void handleReject()}
                    >
                      Отклонить
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-zinc-200"
                      disabled={actionLoading}
                      onClick={() => void handleApprove()}
                    >
                      Выдать товар
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
