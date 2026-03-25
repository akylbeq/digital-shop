'use client';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKeysStore } from '@/app/store/keys/keys.store';
import { useProductsStore } from '@/app/store/products/products.store';
import { KeyMutation } from '@/app/types';

export default function AddKey() {
  const [isOpen, setIsOpen] = useState(false);
  const [keyData, setKeyData] = useState<KeyMutation>({
    key: '',
    productId: null,
  });
  const [text, setText] = useState('');
  const { createKey } = useKeysStore();
  const {products: products, getProducts} = useProductsStore();

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeyData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!keyData.productId) return alert('Select a products');

    const success = await createKey(keyData);
    if (!success) return;

    setKeyData({ key: '', productId: null });
    setIsOpen(false);
  };

  useEffect(() => {
    void getProducts(1, 10, text);
  }, [getProducts, text]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Key</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Key</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              name="key"
              value={keyData.key}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select
              onOpenChange={(open) => !open && setText('')}
              onValueChange={(v) => setKeyData(prev => ({ ...prev, productId: Number(v) }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="bg-black">
                <SelectGroup>
                  <Input
                    value={text}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                    placeholder="Search product..."
                  />
                  {products
                    .map((product) => (
                      <SelectItem value={product.id.toString()} key={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="w-full" variant="outline">Create Key</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}