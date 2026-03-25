import { ICategory, ICategoryWithProducts, IProduct } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchData<T>(patch: string, fallback: T): Promise<T> {
  try {
  const res = await fetch(API_URL + patch, {
    next: {revalidate: 3600},
    cache: 'no-store',
  })
  if (!res.ok) {
    return fallback;
  }
  return await (res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getCategories(): Promise<ICategory[]> {
  return await fetchData<ICategory[]>('/categories/root', [])
}
export async function getCategoryWithProducts(s: string): Promise<ICategoryWithProducts | null> {
  return await fetchData<ICategoryWithProducts | null>(`/categories/${s}/products`, null)
}
export async function getProductBySlug(s: string): Promise<IProduct | null> {
  return await fetchData<IProduct | null>(`/products/${s}`, null)
}
export function getImageUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (!API_URL) console.error('API URL is missing');
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}