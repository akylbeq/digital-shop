import { create } from 'zustand';
import { CategoryMutation, ICategory, ICategoryWithProducts } from '@/app/types';
import $api from '@/app/axiosApi';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface CategoryStore {
  categories: ICategory[]
  categoryWithProducts: ICategoryWithProducts | null;
  fetchProductsBySlug(slug: string): Promise<boolean>;
  categoryWithProductsLoading: boolean;
  fetchAll: () => Promise<void>;
  categoriesLoading: boolean
  createCategoryError: string | null;
  createCategory: (c: CategoryMutation) => Promise<boolean>;
  updateCategory: (id: number, c: CategoryMutation) => Promise<boolean>;
  selectedCategory: ICategory | null;
  setSelectedCategory: (c: ICategory | null) => void;
  deleteCategory: (id: number) => Promise<boolean>;

  adminFetchAll: () => Promise<void>;
  adminCategories: ICategory[]
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  categoryWithProducts: null,
  categoryWithProductsLoading: false,
  categoriesLoading: false,
  createCategoryError: null,
  selectedCategory: null,
  setSelectedCategory: (c) => set({ selectedCategory: c }),

  adminCategories: [],

  async createCategory(c: CategoryMutation): Promise<boolean> {
    set({ createCategoryError: null });

    try {
      await $api.post<ICategory>('/categories', c);
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        const error: string = e.response?.data.message || 'Unknown error';
        set({ createCategoryError: error });
        toast.error(error);
      }
      return false;
    }
  },
  async updateCategory(id: number, c: CategoryMutation) {
    try {
      await $api.patch(`/categories/${id}`, c);
      await get().adminFetchAll();
      return true;
    } catch (e) {
      if (isAxiosError(e)) toast.error(e.response?.data.message);
      return false;
    }
  },
  async fetchAll() {
    const {categoriesLoading} = get();
    if (categoriesLoading) return;
    try {
      set({categoriesLoading: true})
      const {data} = await $api.get<ICategory[]>('/categories/root')
      set({categories: data})
      set({categoriesLoading: false})
    } catch (e) {
      set({categoriesLoading: false})
    }
  },
  async adminFetchAll() {
    const {categoriesLoading} = get();
    if (categoriesLoading) return;
    try {
      set({categoriesLoading: true})
      const {data} = await $api.get<ICategory[]>('/categories/admin')
      set({adminCategories: data})
      set({categoriesLoading: false})
    } catch (e) {
      set({categoriesLoading: false})
    }
  },
  async deleteCategory(id: number) {
    try {
      await $api.delete(`/categories/${id}`);
      await get().adminFetchAll();
      return true;
    } catch (e) {
      if (isAxiosError(e)) toast.error(e.response?.data.message);
      return false;
    }
  },
  async fetchProductsBySlug(slug: string) {
    if (get().categoryWithProductsLoading) return false;
    try {
      set({categoryWithProductsLoading: true, categoryWithProducts: null})
      const {data} = await $api.get<ICategoryWithProducts>(`/categories/${slug}/products`);
      set({categoryWithProducts: data, categoryWithProductsLoading: false});
      return true;
    } catch (e) {
      set({categoryWithProductsLoading: false})
      return false;
    }
  }
}));