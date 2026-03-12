'use client';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Рекомендую использовать из shadcn
import { CategoryMutation } from '@/app/types';
import { useCategoryStore } from '@/app/store/category/category.store';
import { uploadImage } from '@/lib/utils';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<CategoryMutation>({
    name: '',
    description: '',
    slug: '',
    isActive: true,
    image: '',
    parentCategoryId: null
  });
  const [text, setText] = useState('');
  const {createCategory, adminFetchAll, categories} = useCategoryStore();

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const img = await uploadImage(e.target.files[0]);
      setCategory((prev) => ({ ...prev, image: img || '' }));
    }
  };

  const onActiveChange = (checked: boolean) => {
    setCategory((prev) => ({ ...prev, isActive: checked }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await createCategory(category);

    if (!success) {
      return;
    }
    await adminFetchAll();
    setCategory({
      name: '',
      description: '',
      slug: '',
      isActive: true,
      image: '',
      parentCategoryId: null
    })
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Category</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={category.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={category.slug}
              onChange={onInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Parent category</Label>
            <Select onOpenChange={(open) => !open && setText('')} onValueChange={(v) => setCategory(prev => ({...prev, parentCategoryId: Number(v) }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selelct category" />
              </SelectTrigger>
              <SelectContent className="bg-black">
                  <SelectGroup>
                    <Input value={text} onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)} />
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={category.description}
              onChange={onInputChange}
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="isActive"
              checked={category.isActive}
              onCheckedChange={onActiveChange}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {category.isActive ? "Category is Active" : "Category is Hidden"}
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
            {category.image && (
              <div className="w-full overflow-hidden rounded-lg border bg-gray-50 relative">
                <img
                  src={`http://localhost:8000${category.image}`}
                  alt="preview"
                  className="h-40 w-full object-cover"
                />
                <X className="absolute top-1 right-1" onClick={() => setCategory(prev => ({...prev, image: ''}))} />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="w-full" variant="outline">Create Category</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}