'use client';

import { useEffect, useState } from 'react';
import { Edit3, KeyRound, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useKeysStore } from '@/app/store/keys/keys.store';
import AddKey from '@/app/dashboard/keys/AddKey';
import EditKey from '@/app/dashboard/keys/EditKey';
import Pagination from '@/app/components/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export default function KeysPage() {
  const {
    keys,
    total,
    fetchKeys,
    setSelectKey,
    deleteKey,
  } = useKeysStore();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    void fetchKeys(page, limit, search);
  }, [page, limit, fetchKeys, search]);

  const handleDelete = async (id: number) => {
    await deleteKey(id);
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold uppercase tracking-tighter">
            Keys
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Total: {total} | Page: {page}/{totalPages}
          </p>
        </div>

        <div className="relative w-full sm:w-64 ms-auto me-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14}/>
          <Input
            placeholder="Search keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-zinc-900 border-white/10 text-[11px] font-mono"
          />
        </div>
        <AddKey/>
        <Select
          value={limit.toString()}
          onValueChange={(v) => setLimit(Number(v))}
        >
          <SelectTrigger className="w-15 ms-1">{limit}</SelectTrigger>
          <SelectContent className="w-15">
            {[10, 20, 30, 40, 50].map((item) => (
              <SelectItem value={item.toString()} key={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-sm border border-white/5 bg-zinc-950/50 overflow-hidden">

        <table className="w-full text-left border-collapse">

          <thead>
          <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Key</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Duration</th>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Created</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
          </thead>

          <tbody className="font-mono text-[11px]">

          {keys.length > 0 ? (
            keys.map((key) => (

              <tr
                key={key.id}
                className="border-b border-white/[0.02] hover:bg-white/[0.02]"
              >

                <td className="px-6 py-4 text-zinc-500">
                  {key.id}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">

                    <KeyRound size={12} className="text-zinc-600"/>

                    <span className="text-zinc-200">
                        {key.key}
                      </span>

                  </div>
                </td>

                <td className="px-6 py-4">

                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase
                      ${
                      key.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : key.status === 'sold'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-zinc-800 text-zinc-500'
                    }
                    `}>
                      {key.status}
                    </span>

                </td>

                <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase`}>
                      {key.duration}
                    </span>

                </td>

                <td className="px-6 py-4 text-zinc-400">
                  {key.product.name || '—'}
                </td>

                <td className="px-6 py-4 text-zinc-500">
                  {new Date(key.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">

                  <div className="flex justify-end gap-3">

                    <button
                      className="p-2 text-zinc-500 hover:text-white"
                      onClick={() => setSelectKey(key)}
                    >
                      <Edit3 size={14}/>
                    </button>

                    <button
                      onClick={() => handleDelete(key.id)}
                      className="p-2 text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 size={14}/>
                    </button>

                  </div>

                </td>

              </tr>
            ))
          ) : (

            <tr>
              <td colSpan={6} className="text-center py-20 text-zinc-500">
                No keys found
              </td>
            </tr>

          )}

          </tbody>

        </table>

      </div>

      <Pagination totalPages={totalPages} page={page} setPage={setPage} />

      <EditKey />

    </div>
  );
}