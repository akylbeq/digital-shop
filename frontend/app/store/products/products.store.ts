import { create } from 'zustand';
import { GetProducts, IProduct, ProductEditing, ProductMutation } from '@/app/types';
import $api from '@/app/axiosApi';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

interface ProductsStore {
  products: IProduct[];
  product: IProduct | null;
  productLoading: boolean;
  total: number;
  page: number;
  limit: number;

  fetchProductBySlug: (id: string) => Promise<void>;
  create: (p: ProductMutation) => Promise<boolean>
  update: (p: ProductEditing) => Promise<boolean>
  getProducts: (p?: number, l?: number, name?: string) => Promise<void>
  fetchAdminProductsLoading: boolean;
  selectedProduct: IProduct | null,
  setSelectProduct: (p: IProduct | null) => void
  deleteProduct: (id: number) => Promise<void>
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  product: null,
  total: 0,
  page: 1,
  limit: 10,
  productLoading: false,
  fetchAdminProductsLoading: false,
  selectedProduct: null,
  setSelectProduct: (p) => set({selectedProduct: p}),

  async create(p: ProductMutation) {
    try {
      await $api.post('/products', p);
      await get().getProducts();
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
        return false;
      }
      return false;
    }
  },

  async update(p: ProductEditing) {
    try {
      await $api.patch(`/products/${p.id}`, p);
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
        return false;
      }
      return false;
    }
  },

  async getProducts(p = 1, l = 10, name?: string) {
    try {
      const {fetchAdminProductsLoading} = get();
      if (fetchAdminProductsLoading) return;
      set({fetchAdminProductsLoading: true});
      const {data} = await $api.get<GetProducts>('/products', {
        params: {
          page: p,
          limit: l,
          name: name,
        }
      });
      set({
        products: data.data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        fetchAdminProductsLoading: false
      });
    } catch (e) {
      set({fetchAdminProductsLoading: false});
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
      }
    }
  },

  async fetchProductBySlug(slug: string) {
    if (get().productLoading) return;
    set({productLoading: true});
    try {
      const {data} = await $api.get<IProduct>(`/products/${slug}`);
      set({
        product: data,
        productLoading: false
      });
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
      }
    }
  },

  async deleteProduct(id: number) {
    try {
      const {getProducts, page, limit} = get();
      await $api.delete(`/products/${id}`);
      await getProducts(page, limit);
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
      }
    }
  }
}));