import { IKey, KeyMutation, KeyUpdating } from '@/app/types';
import { create } from 'zustand';
import $api from '@/app/axiosApi';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface KeysStore {
  keys: IKey[];
  total: number;
  page: number;
  limit: number;
  fetchKeys: (p: number, l: number, k?: string) => Promise<void>;
  fetchKeysLoading: boolean;
  createKey: (key: KeyMutation) => Promise<boolean>;
  selectedKey: IKey | null;
  setSelectKey: (key: IKey | null) => void;
  updateKey: (id: number, key: KeyUpdating) => Promise<boolean>;
  deleteKey: (id: number) => Promise<boolean>;
}

export const useKeysStore = create<KeysStore>((set, get) => ({
  keys: [],
  total: 0,
  page: 1,
  limit: 10,
  selectedKey: null,
  setSelectKey: (k: IKey | null) => set({selectedKey: k}),
  fetchKeysLoading: false,

  async fetchKeys(p = 1, l = 10, key?: string) {
    try {
      if (get().fetchKeysLoading) return;
      set({fetchKeysLoading: true});
      const {data} = await $api.get<{ data: IKey[], total: number, page: number, limit: number }>(`/keys`, {
        params: {
          page: p,
          limit: l,
          key: key,
        }
      });
      set({
        keys: data.data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        fetchKeysLoading: false
      });
    } catch {
      toast.error('Unknown error');
    }
  },
  async createKey(key) {
    try {
      await $api.post('/keys', key);
      get().fetchKeys(1, 10);
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      }
      return false;
    }
  },
  async updateKey(id, key) {
    try {
      await $api.patch('/keys/' + id, key);
      get().fetchKeys(1, 10);
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      }
      return false;
    }
  },
  async deleteKey(id: number) {
    try {
      const {fetchKeys, page, limit} = get();
      await $api.delete(`/keys/${id}`);
      toast.success('Key deleted successfully.');
      await fetchKeys(page, limit);
      return true;
    } catch {
      toast.error('Unable to delete key.');
      return false;
    }
  }
}));