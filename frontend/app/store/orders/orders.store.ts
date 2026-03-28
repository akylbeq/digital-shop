import { create } from 'zustand';
import $api from '@/app/axiosApi';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

export type OrderStatus =
  | 'PENDING'
  | 'WAITING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'PAID'
  | 'REJECTED'
  | 'FAILED';

export interface IOrderListItem {
  id: number;
  publicId: string;
  userId: number;
  itemId: number;
  amount: number | string;
  status: OrderStatus;
  paymentSource: string | null;
  paymentProofTelegramFileId: string | null;
  adminReviewComment: string | null;
  deliveredKey: string | null;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string | null;
    telegramId: string | null;
    telegramUsername: string | null;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface IOrderDetail extends IOrderListItem {
  paymentProofUrl?: string | null;
}

interface OrdersStore {
  orders: IOrderListItem[];
  total: number;
  loading: boolean;
  fetchOrders: (page: number, limit: number, status?: OrderStatus) => Promise<void>;
  fetchOrder: (id: number) => Promise<IOrderDetail | null>;
  approve: (id: number) => Promise<void>;
  reject: (id: number, comment?: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>()((set) => ({
  orders: [],
  total: 0,
  loading: false,

  async fetchOrder(id) {
    try {
      const res = await $api.get<IOrderDetail>(`/admin/orders/${id}`);
      return res.data;
    } catch (e) {
      if (isAxiosError(e)) {
        const msg = e.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Ошибка');
      }
      return null;
    }
  },

  async fetchOrders(page, limit, status) {
    set({ loading: true });
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) params.set('status', status);
      const res = await $api.get<{ data: IOrderListItem[]; total: number }>(
        `/admin/orders?${params.toString()}`,
      );
      set({ orders: res.data.data, total: res.data.total });
    } catch (e) {
      if (isAxiosError(e)) {
        const msg = e.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Ошибка загрузки');
      }
    } finally {
      set({ loading: false });
    }
  },

  async approve(id) {
    try {
      await $api.post(`/admin/orders/${id}/approve`);
      toast.success('Заказ подтверждён, ключ выдан (если есть в наличии)');
    } catch (e) {
      if (isAxiosError(e)) {
        const msg = e.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Ошибка');
      }
      throw e;
    }
  },

  async reject(id, comment) {
    try {
      await $api.post(`/admin/orders/${id}/reject`, { comment });
      toast.success('Заказ отклонён');
    } catch (e) {
      if (isAxiosError(e)) {
        const msg = e.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Ошибка');
      }
      throw e;
    }
  },
}));
