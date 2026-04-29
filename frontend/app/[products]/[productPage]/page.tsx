import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { getProductBySlug } from '@/lib/api';
import ProductClient from './ProductClient';
import { Metadata } from 'next';

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ productPage: string }>;
}): Promise<Metadata> {
  const { productPage } = await params;
  const product = await getProductBySlug(productPage);

  if (!product) {
    return {
      title: 'Продукт не найден',
      description: 'Страница продукта не найдена',
    };
  }

  return {
    title: product.name,
    description: product.description || `Продукт ${product.name}`,
  };
}

export default async function ProductPage({
                                            params
                                          }: {
  params: Promise<{ products: string; productPage: string }>;
}) {
  const { productPage } = await params;
  const product = await getProductBySlug(productPage);

  if (!product) notFound();

  return (
    <div className="site-shell selection:bg-white selection:text-black">
      <div className="page-container py-10">
        <Breadcrumb className="mb-10">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${product.category.slug}`}>
                  {product.category.name.toUpperCase()}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${product.category.slug}/${product.slug}`}>
                  {product.name.toUpperCase()}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ProductClient product={product} />
      </div>
    </div>
  );
}