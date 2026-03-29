export interface CategoryMutation {
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  image: string;
  parentCategoryId: number | null;
}

export interface CategoryEditing extends CategoryMutation {
  id: number;
}

export interface GetCategories {
  data: ICategory[];
  total: number;
  page: number;
  limit: number;
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

export interface GetProducts {
  data: IProduct[];
  total: number;
  page: number;
  limit: number;
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

export interface IKey {
  id: number;
  key: string;
  status: string;
  duration: number;
  product: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface KeyMutation {
  key: string;
  duration: number;
  productId: number | null;
}

export interface KeyUpdating {
  key: string;
  status: string;
  productId: number | null;
  id: number;
}