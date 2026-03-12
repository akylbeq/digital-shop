'use client';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductMutation } from '@/app/types';
import { useCategoryStore } from '@/app/store/category/category.store';
import { uploadImage } from '@/lib/utils';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductStore } from '@/app/store/product/product.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const EMPTY_PRODUCT: ProductMutation = {
  name: '', description: '', slug: '', isActive: true,
  image: '', imagesAlbum: [], prices: [], categoryId: null, features: [], badges: [],
};
const EMPTY_PRICE    = { duration: '', price: '' };
const EMPTY_FEATURE  = { title: '', icon: '', items: '' };
const EMPTY_BADGE    = { icon: '', title: '', color: '' };

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest text-white/40">{label}</Label>
      {children}
    </div>
  );
}

function SvgPreview({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 shrink-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function AddProduct() {
  const [isOpen, setIsOpen]           = useState(false);
  const [product, setProduct]         = useState<ProductMutation>(EMPTY_PRODUCT);
  const [categorySearch, setCategorySearch] = useState('');
  const [priceDraft, setPriceDraft]   = useState(EMPTY_PRICE);
  const [featureDraft, setFeatureDraft] = useState(EMPTY_FEATURE);
  const [badgesDraft, setBadgesDraft] = useState(EMPTY_BADGE);

  const { categories, fetchAll } = useCategoryStore();
  const { create }               = useProductStore();

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setProduct(EMPTY_PRODUCT);
      setCategorySearch('');
      setPriceDraft(EMPTY_PRICE);
      setFeatureDraft(EMPTY_FEATURE);
      setBadgesDraft(EMPTY_BADGE);
    }
  }, [isOpen]);

  const onField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProduct(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFile = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'imagesAlbum') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await uploadImage(file);
    if (!img) return;
    setProduct(p => type === 'image'
      ? { ...p, image: img }
      : { ...p, imagesAlbum: [...p.imagesAlbum, img] }
    );
  };

  const addPrice = () => {
    const duration = priceDraft.duration.trim();
    const price    = Number(priceDraft.price);
    if (!duration || !Number.isFinite(price) || price <= 0) return;
    setProduct(p => {
      const idx = p.prices.findIndex(x => x.duration === duration);
      const next = idx >= 0
        ? p.prices.map((x, i) => i === idx ? { duration, price } : x)
        : [...p.prices, { duration, price }];
      return { ...p, prices: next };
    });
    setPriceDraft(EMPTY_PRICE);
  };

  const addFeature = () => {
    if (!featureDraft.title || !featureDraft.items.trim())
      return toast.error('Enter title and at least one item');
    const items = featureDraft.items.split('\n').map(s => s.trim()).filter(Boolean);
    setProduct(p => ({ ...p, features: [...p.features, { title: featureDraft.title, icon: featureDraft.icon, items }] }));
    setFeatureDraft(EMPTY_FEATURE);
  };

  const addBadge = () => {
    if (!badgesDraft.title || !badgesDraft.icon || !badgesDraft.color)
      return toast.error('All badge fields are required');
    setProduct(p => ({ ...p, badges: [...p.badges, badgesDraft] }));
    setBadgesDraft(EMPTY_BADGE);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await create(product);
    if (!ok) return;
    await fetchAll();
    setIsOpen(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Product</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-1">
          <form onSubmit={onSubmit} className="space-y-5 pt-4 pb-2">

            {/* ── Basic fields ── */}
            <Section label="Name">
              <Input name="name" value={product.name} onChange={onField} required />
            </Section>

            <Section label="Slug">
              <Input name="slug" value={product.slug} onChange={onField} />
            </Section>

            <Section label="Category">
              <Select onOpenChange={open => !open && setCategorySearch('')}
                      onValueChange={v => setProduct(p => ({ ...p, categoryId: Number(v) }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black">
                  <SelectGroup>
                    <Input
                      placeholder="Search..."
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      className="mb-1"
                    />
                    {categories
                      .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Section>

            <Section label="Description">
              <Textarea name="description" value={product.description} onChange={onField} rows={3} />
            </Section>

            <div className="flex items-center gap-2 py-1">
              <Checkbox id="isActive" checked={product.isActive}
                        onCheckedChange={v => setProduct(p => ({ ...p, isActive: Boolean(v) }))} />
              <Label htmlFor="isActive" className="cursor-pointer text-sm text-white/60">
                {product.isActive ? 'Active' : 'Hidden'}
              </Label>
            </div>

            {/* ── Prices ── */}
            <Section label="Prices">
              <div className="flex gap-2">
                <Input placeholder="Duration" value={priceDraft.duration}
                       onChange={e => setPriceDraft(p => ({ ...p, duration: e.target.value }))} />
                <Input placeholder="Price" inputMode="numeric" value={priceDraft.price}
                       onChange={e => setPriceDraft(p => ({ ...p, price: e.target.value }))} />
                <Button type="button" variant="outline" onClick={addPrice}>Add</Button>
              </div>

              {product.prices.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {product.prices
                    .slice().sort((a, b) => a.duration.localeCompare(b.duration))
                    .map(p => (
                      <div key={p.duration} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm">
                        <span>
                          <span className="text-white/60">{p.duration}</span>
                          <span className="mx-2 text-white/20">—</span>
                          <span className="font-medium">${p.price}</span>
                        </span>
                        <button type="button" onClick={() => setProduct(prev => ({ ...prev, prices: prev.prices.filter(x => x.duration !== p.duration) }))}
                                className="text-white/30 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </Section>

            <Section label="Features">
              <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-4 space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="SVG icon" value={featureDraft.icon}
                         onChange={e => setFeatureDraft(p => ({ ...p, icon: e.target.value }))} className="flex-1" />
                  <SvgPreview html={featureDraft.icon} />
                </div>
                <Input placeholder="Section title (e.g. Recoil)" value={featureDraft.title}
                       onChange={e => setFeatureDraft(p => ({ ...p, title: e.target.value }))} />
                <Textarea
                  placeholder={"Each item on a new line:\nDisable Recoil (ON/OFF)\nMode - Toggle / Hold"}
                  value={featureDraft.items}
                  onChange={e => setFeatureDraft(p => ({ ...p, items: e.target.value }))}
                  rows={4}
                />
                <Button className="w-full" variant="outline" type="button" onClick={addFeature}>
                  + Add section
                </Button>
              </div>

              {product.features.map((f, fi) => (
                <div key={fi} className="rounded-xl border border-white/10 bg-[#0b0b0b] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {f.icon && <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: f.icon }} />}
                      <span className="text-sm font-medium">{f.title}</span>
                      <span className="text-[10px] text-white/30 border border-white/10 rounded-full px-2 py-0.5">{f.items.length} items</span>
                    </div>
                    <button type="button" onClick={() => setProduct(p => ({ ...p, features: p.features.filter((_, i) => i !== fi) }))}
                            className="text-white/25 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {f.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-2 text-xs text-white/40">
                        <span className="text-white/20 shrink-0 mt-0.5">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Section>

            <Section label="Badges">
              <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-4 space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="SVG icon" value={badgesDraft.icon}
                         onChange={e => setBadgesDraft(p => ({ ...p, icon: e.target.value }))} className="flex-1" />
                  <SvgPreview html={badgesDraft.icon} />
                </div>
                <Input placeholder="Title (e.g. Undetected)" value={badgesDraft.title}
                       onChange={e => setBadgesDraft(p => ({ ...p, title: e.target.value }))} />
                <div className="flex gap-2">
                  <Input placeholder="Color (#02E083)" value={badgesDraft.color}
                         onChange={e => setBadgesDraft(p => ({ ...p, color: e.target.value }))} className="flex-1" />
                  {badgesDraft.color && (
                    <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0" style={{ background: badgesDraft.color }} />
                  )}
                </div>
                {(badgesDraft.title || badgesDraft.icon) && (
                  <div className="flex items-center gap-1.5 text-sm w-fit" style={{ color: badgesDraft.color || 'rgba(255,255,255,0.6)' }}>
                    {badgesDraft.icon && <span dangerouslySetInnerHTML={{ __html: badgesDraft.icon }} />}
                    <span>{badgesDraft.title}</span>
                  </div>
                )}
                <Button variant="outline" type="button" className="w-full" onClick={addBadge}>
                  + Add badge
                </Button>
              </div>

              {product.badges.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {product.badges.map((b, i) => (
                    <div key={b.title + i} className="flex items-center gap-1.5 text-sm group cursor-pointer"
                         style={{ color: b.color }}
                         onClick={() => setProduct(p => ({ ...p, badges: p.badges.filter((_, bi) => bi !== i) }))}>
                      <span dangerouslySetInnerHTML={{ __html: b.icon }} />
                      <span>{b.title}</span>
                      <X size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Images ── */}
            <Section label="Cover image">
              <Input type="file" accept="image/*" onChange={e => onFile(e, 'image')} />
              {product.image && (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={`http://localhost:8000${product.image}`} alt="preview" className="h-40 w-full object-cover" />
                  <button type="button" onClick={() => setProduct(p => ({ ...p, image: '' }))}
                          className="absolute top-2 right-2 bg-black/60 rounded-lg p-1 hover:bg-black/80 transition">
                    <X size={14} />
                  </button>
                </div>
              )}
            </Section>

            <Section label="Image album">
              <Input type="file" accept="image/*" onChange={e => onFile(e, 'imagesAlbum')} />
              {product.imagesAlbum.length > 0 && (
                <div className="space-y-2">
                  {product.imagesAlbum.map(img => (
                    <div key={img} className="relative rounded-xl overflow-hidden border border-white/10">
                      <img src={`http://localhost:8000${img}`} alt="album" className="h-32 w-full object-cover" />
                      <button type="button" onClick={() => setProduct(p => ({ ...p, imagesAlbum: p.imagesAlbum.filter(x => x !== img) }))}
                              className="absolute top-2 right-2 bg-black/60 rounded-lg p-1 hover:bg-black/80 transition">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Button type="submit" className="w-full" variant="outline">Create Product</Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}