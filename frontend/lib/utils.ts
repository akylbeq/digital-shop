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

export function formatPrice(n: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(n);
}

export const applyColor = (svg: string, color: string) => {
  return svg
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`)
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
};

export const icons = [
  {
    name: 'signal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14l1.42 1.42a12 12 0 0 0 0-16.97l-1.42 1.41z"/><path d="M4.93 4.93L3.51 3.51a12 12 0 0 0 0 16.97l1.42-1.42a10 10 0 0 1 0-14.13z"/></svg>`,
  },
  {
    name: 'star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  {
    name: 'heart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  },
  {
    name: 'shield',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    name: 'zap',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  },
  {
    name: 'globe',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  },
  {
    name: 'lock',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
  },
  {
    name: 'eye',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  },
  {
    name: 'crosshair',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V18c0-.55.45-1 1-1s1 .45 1 1v1.93C10.06 19.75 8 17.04 8 14h1c.55 0 1 .45 1 1s-.45 1-1 1H8c0-1.66.67-3.16 1.76-4.24A5.99 5.99 0 0 1 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6zm1-9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm7.93 2H19c-.55 0-1-.45-1-1s.45-1 1-1h1.93C20.75 13.94 18.04 16 15 16v-1c0-.55.45-1 1-1s1 .45 1 1v1c1.66 0 3.16-.67 4.24-1.76z"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1-9v2h2V7h-2zm0 10v2h2v-2h-2zm-5-5H4v2h2v-2zm12 0h-2v2h2v-2z"/></svg>`,
  },
  {
    name: 'crosshair-dot',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-9H9v2h2v2h2v-2h2v-2h-2V9h-2v2zm1-1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1-3V5h2v2h-2zm0 12v-2h2v2h-2zm-5-7H4v2h2v-2zm12 0h-2v2h2v-2z"/></svg>`,
  },
  {
    name: 'scope',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-1-9V4h2v2h-2zm0 12v-2h2v2h-2zm-5-7H4v2h2v-2zm12 0h-2v2h2v-2z"/></svg>`,
  },
  {
    name: 'target',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-1 0v2h2v-2h-2zm0-8V5h2v2h-2zm5 4h2v2h-2v-2zM5 11h2v2H5v-2z"/></svg>`,
  },
  {
    name: 'bullet',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 2 4 8v6H8v-6c0-6 4-8 4-8z"/><rect x="8" y="16" width="8" height="4" rx="1"/><rect x="9" y="20" width="2" height="2"/><rect x="13" y="20" width="2" height="2"/></svg>`,
  },
  {
    name: 'sniper',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-1-6V1h2v2h-2zm0 18v-2h2v2h-2zm-7-9H2v2h2v-2zm18 0h-2v2h2v-2zM5.64 5.64L4.22 4.22l1.42-1.42 1.42 1.42-1.42 1.42zm12.72 12.72l-1.42-1.42 1.42-1.42 1.42 1.42-1.42 1.42zM4.22 19.78l1.42-1.42 1.42 1.42-1.42 1.42-1.42-1.42zM18.36 5.64l-1.42 1.42-1.42-1.42 1.42-1.42 1.42 1.42z"/></svg>`,
  },
] as const;

export type IconName = typeof icons[number]['name'];