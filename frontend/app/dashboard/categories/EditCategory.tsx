'use client';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCategoryStore } from '@/app/store/category/category.store';
import { CategoryMutation } from '@/app/types';
import { uploadImage } from '@/lib/utils';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditCategoryModal() {
  const { selectedCategory, setSelectedCategory, updateCategory, categories } = useCategoryStore();
  const [formData, setFormData] = useState<CategoryMutation | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name,
        description: selectedCategory.description || '',
        slug: selectedCategory.slug,
        isActive: selectedCategory.isActive,
        image: selectedCategory.image,
        parentCategoryId: selectedCategory.parentCategoryId
      });
    } else {
      setFormData(null);
    }
  }, [selectedCategory]);

  if (!formData || !selectedCategory) return null;

  const close = () => setSelectedCategory(null);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const img = await uploadImage(e.target.files[0]);
      if (img) {
        setFormData((prev) => prev ? ({ ...prev, image: img }) : null);
      }
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await updateCategory(selectedCategory.id, formData);
    if (success) close();
  };

  return (
    <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white font-mono">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-tighter text-sm">
            Edit Category: <span className="text-zinc-500">{selectedCategory.name}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4 text-[11px]">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-500 uppercase text-[9px]">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name} // Используем formData, а не category
              onChange={onInputChange}
              className="bg-zinc-900 border-white/5 h-9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-zinc-500 uppercase text-[9px]">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={onInputChange}
              className="bg-zinc-900 border-white/5 h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Parent category</Label>
            <Select
              onOpenChange={(open) => {
                if (!open) setText('');
              }}
              onValueChange={(v) => setFormData(prev => prev ? ({...prev, parentCategoryId: Number(v)}) : null)}
              value={formData.parentCategoryId?.toString() ?? 'Select category'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selelct category" />
              </SelectTrigger>
              <SelectContent className="bg-black">
                <SelectGroup>
                  <Input placeholder="Search" value={text} onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)} />
                  {categories
                    .filter((c) => c.name.toLowerCase().includes(text.toLowerCase()))
                    .map((category) => (
                      <SelectItem value={category.id.toString()} key={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-500 uppercase text-[9px]">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              className="bg-zinc-900 border-white/5 h-9"
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData(prev => prev ? ({ ...prev, isActive: !!checked }) : null)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer uppercase text-zinc-400">
              {formData.isActive ? "Category is Active" : "Category is Hidden"}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
            {formData.image && (
              <div className="w-full overflow-hidden rounded-lg border bg-gray-50 relative">
                <img
                  src={`http://localhost:8000${formData.image}`}
                  alt="preview"
                  className="h-40 w-full object-cover"
                />
                <X className="absolute top-1 right-1" onClick={() => setFormData(prev => prev ? ({...prev, image: ''}) : null)} />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-[10px]"
            >
              Update Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}