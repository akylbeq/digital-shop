export class CategoryDto {
  id: number;
  name: string;
  description: string;
  parentCategoryId: number | null;
  slug: string;
  isActive: boolean;
  image: string | null;
}
