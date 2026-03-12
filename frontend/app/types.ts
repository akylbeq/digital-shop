export interface CategoryMutation {
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  image: string;
  parentCategoryId: number | null;
}

export interface ICategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  image: string;
  parentCategoryId: number | null;
  createdAt: string;
}

export interface ICategoryWithProducts {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  image: string;
  parentCategoryId: number | null;
  createdAt: string;
  products: IProduct[];
}

export interface ProductMutation {
  name: string;
  description: string;
  slug: string;
  image: string;
  prices: {duration: string, price: number}[];
  isActive: boolean;
  categoryId: number | null;
  imagesAlbum: string[];
  features: {title: string, icon: string, items: string[]}[];
  badges: {icon: string, title: string, color: string}[];
}
export interface IProduct {
  id: number;
  name: string;
  description: string;
  slug: string;
  image: string;
  prices: {duration: string, price: number}[];
  isActive: boolean;
  categoryId: number | null;
  createdAt: string;
  imagesAlbum: string[];
  features: {title: string, icon: string, items: string[]}[];
  badges: {icon: string, title: string, color: string}[];
  category: {
    id: number;
    name: string;
    slug: string;
  }
}
export interface ProductEditing {
  id: number;
  name: string;
  description: string;
  slug: string;
  image: string;
  prices: {duration: string, price: number}[];
  isActive: boolean;
  categoryId: number | null;
  imagesAlbum: string[];
  features: {title: string, icon: string, items: string[]}[];
  badges: {icon: string, title: string, color: string}[];
}