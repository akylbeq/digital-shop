'use client';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKeysStore } from '@/app/store/keys/keys.store';
import { useProductsStore } from '@/app/store/products/products.store';
import { KeyUpdating } from '@/app/types';

export default function EditKey() {
  const [keyData, setKeyData] = useState<KeyUpdating>({
    key: '',
    status: '',
    productId: null,
    id: 0
  });
  const [text, setText] = useState('');
  const {
    updateKey,
    selectedKey,
    setSelectKey
  } = useKeysStore();
  const [isOpen, setIsOpen] = useState(false);
  const {
    products: products,
    getProducts
  } = useProductsStore();

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setKeyData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  if (selectedKey && (!keyData || keyData.id !== selectedKey.id)) {
    setKeyData({
      key: selectedKey.key,
      status: selectedKey.status,
      productId: selectedKey.product.id,
      id: selectedKey.id
    });
  }


  useEffect(() => {
    void getProducts(1, 10, text);
  }, [getProducts, text]);

  if (!selectedKey) {
    return;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!keyData.productId) return alert('Select a products');

    const success = await updateKey(selectedKey.id, keyData);
    if (!success) return;

    setIsOpen(false);
  };

  const close = () => setSelectKey(null);

  return (
    <Dialog
      open={!!selectedKey} onOpenChange={() => !isOpen && close()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Key</DialogTitle>
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
              onValueChange={(v) => setKeyData(prev => ({
                ...prev,
                productId: Number(v)
              }))}
              value={keyData.productId?.toString() ?? ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select product"/>
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

          <div className="space-y-2">
            <Label htmlFor="product">Status</Label>
            <Select
              onOpenChange={(open) => !open && setText('')}
              onValueChange={(v) => setKeyData(prev => ({
                ...prev,
                status: v
              }))}
              value={keyData.status ?? ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status"/>
              </SelectTrigger>
              <SelectContent className="bg-black">
                <SelectGroup>
                  <Input
                    value={text}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                    placeholder="Search product..."
                  />
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="w-full" variant="outline">Update Key</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}