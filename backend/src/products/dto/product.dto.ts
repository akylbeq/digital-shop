export class ProductDto {
  id: number;
  name: string;
  description: string;
  image: string | null;
  categoryId: number | null;
  prices: { duration: string; price: number }[];
}