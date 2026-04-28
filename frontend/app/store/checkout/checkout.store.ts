import { create } from 'zustand';
import $api from '@/app/axiosApi';
import { CreateOrder, IOrderPublicResponse, UnopayResponse } from '@/app/types';
import { toast } from 'sonner';

interface CheckoutStore {
  order: UnopayResponse | null;
  orderStatus: IOrderPublicResponse | null;
  loading: boolean;
  modal: boolean;
  changeModalStatus: () => void;
  createOrder: (order: CreateOrder) => Promise<boolean>;
  getOrderStatus: (id: string) => Promise<boolean>;
}

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  modal: false,
  order: null,
  orderStatus: null,
  loading: false,
  changeModalStatus: () => set((state) => ({ modal: !state.modal })),
  async createOrder(order: CreateOrder) {
    try {
      if (!order.duration && !order.productId) {
        toast.error('Возникла ошибка при создании заказа');
        return false;
      }
      set({loading: true})
      const {data} = await $api.post<UnopayResponse>('/unopay', order);
      set({order: data, loading: false})
      return true;
    } catch {
      set({loading: false})
      return false;
    }
  },
  async getOrderStatus(id: string) {
    try {
      const {data} = await $api.get<IOrderPublicResponse>('/admin/orders/public/' + id)
      set({orderStatus: data});
      return true;
    } catch {
      return false;
    }
  }
}));