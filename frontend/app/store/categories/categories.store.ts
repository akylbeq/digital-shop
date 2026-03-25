import { create } from 'zustand';
import { CategoryEditing, CategoryMutation, GetCategories, ICategory } from '@/app/types';
import $api from '@/app/axiosApi';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface CategoriesStore {
  categoriesLoading: boolean
  createCategory: (c: CategoryMutation) => Promise<boolean>;
  updateCategory: (c: CategoryEditing) => Promise<boolean>;
  selectedCategory: ICategory | null;
  setSelectedCategory: (c: ICategory | null) => void;
  deleteCategory: (id: number) => Promise<void>;

  categories: ICategory[]
  getCategories: (p?: number, l?: number, n?: string) => Promise<void>;
  total: number;
  page: number;
  limit: number;
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categoryWithProductsLoading: false,
  categoriesLoading: false,
  selectedCategory: null,
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  categories: [],
  page: 1,
  limit: 10,
  total: 0,

  async createCategory(c: CategoryMutation) {
    try {
      await $api.post<ICategory>('/categories', c);
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
  async updateCategory(c: CategoryEditing) {
    try {
      await $api.patch(`/categories/${c.id}`, c);
      await get().getCategories();
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
  async getCategories(p = 1, l = 10, n?: string) {
    if (get().categoriesLoading) return;
    set({ categoriesLoading: true });
    try {
      const { data } = await $api.get<GetCategories>('/categories', {
        params: { page: p, limit: l, name: n },
      });
      set({ categories: data.data , page: data.page, limit: data.limit, total: data.total });
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
      }
    } finally {
      set({ categoriesLoading: false });
    }
  },
  async deleteCategory(id: number) {
    try {
      await $api.delete(`/categories/${id}`);
      await get().getCategories();
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        toast.error(error);
      }
    }
  },
}));