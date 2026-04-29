'use client';

import { useEffect, useState } from 'react';
import { Edit3, Image as ImageIcon, Search, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCategoriesStore } from '@/app/store/categories/categories.store';
import AddCategory from '@/app/dashboard/categories/AddCategory';
import EditCategoryModal from '@/app/dashboard/categories/EditCategory';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import Pagination from '@/app/components/Pagination';
import { getImageUrl } from '@/lib/api';

export default function CategoriesPage() {
  const {
    categories,
    getCategories,
    setSelectedCategory,
    deleteCategory,
    total
  } = useCategoriesStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.ceil(total / limit);

  const categoryDeleting = async (id: number) => {
    try {
      await deleteCategory(id);
      await getCategories(page, limit, search);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    void getCategories(page, limit, search);
  }, [page, limit, search, getCategories]);

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold uppercase tracking-tighter">Categories</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Total: {total}
          </p>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14}/>
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 bg-zinc-900 border-white/10 text-[11px] font-mono focus:ring-1 focus:ring-white/20"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={12}/>
                </button>
              )}
            </div>
            <AddCategory/>
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
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950/50 overflow-hidden">
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
          {categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category.id}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div
                    className="relative w-10 h-10 rounded border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <Image src={getImageUrl(category.image)} alt={category.name} fill sizes="100vw"
                             className="object-cover" unoptimized/>
                    ) : (
                      <ImageIcon size={14} className="text-zinc-800"/>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-zinc-200 uppercase font-bold tracking-tight">{category.name}</span>
                    <span className="text-[9px] text-zinc-600">/{category.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase ${
                      category.isActive
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-zinc-800/50 text-zinc-500 border border-white/5'
                    }`}>
                      {category.isActive ? 'Active' : 'Hidden'}
                    </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setSelectedCategory(category)}
                            className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Edit3 size={14}/>
                    </button>
                    <button onClick={() => categoryDeleting(category.id)}
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
                    <button onClick={() => {
                      setSearch('');
                      setPage(1);
                    }} className="text-[9px] text-zinc-400 underline underline-offset-4 hover:text-white">
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

      <EditCategoryModal/>
    </div>
  );
}