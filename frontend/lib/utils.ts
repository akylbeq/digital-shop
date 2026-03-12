import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import $api from '@/app/axiosApi';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function uploadImage(img: File | null): Promise<string | undefined> {
  try {
    if (!img) {
      toast.error('Please upload a file');
      return;
    }
    const formData = new FormData();
    formData.append('image', img);
    const {data} = await $api.post<{url: string}>('/upload-image', formData);
    return data.url
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      toast.error(e.response.data.message);
    }
  }
}