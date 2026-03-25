'use client';
import { useEffect, useState } from 'react';
import { Edit3, Image as ImageIcon, Search, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AddProduct from '@/app/dashboard/products/AddProduct';
import { useProductsStore } from '@/app/store/products/products.store';
import EditProduct from '@/app/dashboard/products/EditProduct';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import Pagination from '@/app/components/Pagination';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';

export default function ProductsPage() {
  const {
    getProducts,
    products,
    setSelectProduct,
    total,
    deleteProduct
  } = useProductsStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.ceil(total / limit);

  const productDeleting = async (id: number) => {
    await deleteProduct(id);
  };

  useEffect(() => {
    void getProducts(page, limit, search);
  }, [getProducts, page, limit, search]);


  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold uppercase tracking-tighter">Products</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Total: {total}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14}/>
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-zinc-900 border-white/10 text-[11px] font-mono focus:ring-1 focus:ring-white/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={12}/>
              </button>
            )}
          </div>
          <AddProduct/>
          <Select
            value={limit.toString()}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="w-15">{limit}</SelectTrigger>
            <SelectContent className="w-15">
              {[10, 20, 30, 40, 50].map((item) => (
                <SelectItem value={item.toString()} key={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-sm border border-white/5 bg-zinc-950/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
          <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-white/[0.01]">
            <th className="px-6 py-4 font-medium">Image</th>
            <th className="px-6 py-4 font-medium">Title / Slug</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Created</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
          </thead>
          <tbody className="font-mono text-[11px]">
          {products.length > 0 ? (
            products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
              >
                {/* Изображение */}
                <td className="px-6 py-4">
                  <div
                    className="relative w-10 h-10 rounded border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {p.image ? (
                      <Image
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon size={14} className="text-zinc-800"/>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                      <span className="text-zinc-200 uppercase font-bold tracking-tight">
                        {p.name}
                      </span>
                    <span className="text-[9px] text-zinc-600">
                        /{p.slug}
                      </span>
                  </div>
                </td>

                {/* Статус */}
                <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase ${
                      p.isActive
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-zinc-800/50 text-zinc-500 border border-white/5'
                    }`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                </td>

                <td className="px-6 py-4 text-zinc-500">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('ru-RU')
                    : '—'}
                </td>

                {/* Действия */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelectProduct(p)}
                      className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <Edit3 size={14}/>
                    </button>
                    <button
                      onClick={() => productDeleting(p.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded transition-all">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-zinc-600 uppercase tracking-[0.2em] text-[10px]">
                      {search ? `No matches for "${search}"` : 'Database is empty'}
                    </span>
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="text-[9px] text-zinc-400 underline underline-offset-4 hover:text-white"
                    >
                      Reset search
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>
        <Pagination totalPages={totalPages} page={page} setPage={setPage} />
      </div>
      <EditProduct/>
    </div>
  );
}