import { create } from 'zustand';
import { IUser, UserLogin, UserRegister } from '@/app/store/user/types';
import $api from '@/app/axiosApi';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface UserStore {
  user: IUser | null;
  userLoading: boolean;
  token: {
    accessToken: string;
    refreshToken: string;
  }
  register: (user: UserRegister) => void;
  login: (user: UserLogin) => void;
  getMe: () => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  // persist(
    (set) => ({
      user: null,
      token: {
        accessToken: '',
        refreshToken: ''
      },
      userLoading: true,

      async register(user) {
        try {
          // set({userLoading: true});
          const response = await $api.post<IUser>('/auth/register', {
            email: user.email,
            password: user.password
          });
          set({ user: response.data, userLoading: false });
          toast.success("Регистрация успешна!");
        } catch (e) {
          if (isAxiosError(e)) {
            const msg = e.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg[0] : msg);
          }
          set({userLoading: false});
        }
      },

      async login(user) {
        try {
          // set({ userLoading: true });
          const response = await $api.post<IUser>('/auth/login', {
            email: user.email,
            password: user.password
          });
          set({ user: response.data, userLoading: false });
          toast.success("С возвращением!");
        } catch (e) {
          if (isAxiosError(e)) {
            const msg = e.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg[0] : msg);
          }
          set({ userLoading: false });
        }
      },

      async getMe() {
        try {
          set({ userLoading: true });
          const response = await $api.get<IUser>('/auth/me');
          set({ user: response.data, userLoading: false });
        } catch (e) {
          if (isAxiosError(e)) {
            const msg = e.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg[0] : msg);
          }
          set({ userLoading: false });
        }
      },

      async logout(){
        await $api.delete('/auth/logout');
        set({ user: null });
      },
    }),
    // {
    //   name: 'user-storage', // уникальное имя ключа в LocalStorage
    //   storage: createJSONStorage(() => localStorage), // (опционально) по умолчанию и так localStorage
    // }
  // )
);