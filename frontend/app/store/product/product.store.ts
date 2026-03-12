import {create} from 'zustand'
import { IProduct, ProductEditing, ProductMutation } from '@/app/types';
import $api from '@/app/axiosApi';
import { toast } from 'sonner';

interface ProductStore {
  adminProducts: IProduct[];
  product: IProduct | null;
  productLoading: boolean;
  fetchProductBySlug: (id: string) => Promise<void>;
  create: (p: ProductMutation) => Promise<boolean>
  update: (p: ProductEditing) => Promise<boolean>
  fetchAdminProducts: () => Promise<boolean>
  selectedProduct: IProduct | null,
  setSelectProduct: (p: IProduct | null) => void
}

export const useProductStore = create<ProductStore>((set, get) => ({
  adminProducts: [],
  product: null,
  productLoading: false,
  selectedProduct: null,
  setSelectProduct: (p) => set({selectedProduct: p}),

  async create(p: ProductMutation) {
    try {
      const response = await $api.post('/products', p)
      await get().fetchAdminProducts();
      return true;
    } catch (e) {
      return false;
    }
  },

  async update(p: ProductEditing) {
    try {
      const response = await $api.patch(`/products/${p.id}`, p)
      return true
    } catch (e) {
      return false;
    }
  },

  async fetchAdminProducts() {
    try {
      const { data } = await $api.get<IProduct[]>('/products/admin');
      set({adminProducts: data});
      return true;
    } catch (e) {
      return false;
    }
  },

  async fetchProductBySlug(slug: string) {
    if (get().productLoading) return;
    set({productLoading: true});
    try {
      const { data } = await $api.get<IProduct>(`/products/${slug}`);
      set({product: data, productLoading: false});
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message)
        set({productLoading: false});
      }
    }
  }
}))