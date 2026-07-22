import React, { useState, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import {
  UserRole,
  useListProducts,
  useUpdateProduct,
  useCreateProduct,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Package, IndianRupee, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  pricePerKg: z.coerce.number().min(1, 'Price is required'),
  weightKg: z.coerce.number().min(0.1, 'Weight is required'),
  imageUrl: z.string().optional(),
  inStock: z.boolean().default(true),
});

export default function AdminProductsPage() {
  useRequireAuth([UserRole.admin]);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useListProducts();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', category: 'Premium Catch',
      pricePerKg: 0, weightKg: 1, imageUrl: '', inStock: true,
    },
  });

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setPreviewUrl(product.imageUrl || '');
    form.reset({
      name: product.name, description: product.description,
      category: product.category, pricePerKg: product.pricePerKg,
      weightKg: product.weightKg, imageUrl: product.imageUrl || '', inStock: product.inStock,
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setPreviewUrl('');
    form.reset({ name: '', description: '', category: 'Premium Catch', pricePerKg: 0, weightKg: 1, imageUrl: '', inStock: true });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      form.setValue('imageUrl', data.url);
      setPreviewUrl(data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: values },
        {
          onSuccess: () => {
            toast.success('Product updated');
            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
            setIsDialogOpen(false);
          },
          onError: () => toast.error('Failed to update product'),
        }
      );
    } else {
      createProduct.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast.success('Product created');
            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
            setIsDialogOpen(false);
          },
          onError: () => toast.error('Failed to create product'),
        }
      );
    }
  };

  const toggleStock = (id: number, currentStatus: boolean) => {
    updateProduct.mutate(
      { id, data: { inStock: !currentStatus } },
      {
        onSuccess: () => {
          toast.success(currentStatus ? 'Marked out of stock' : 'Marked in stock');
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-1">Product Inventory</h1>
            <p className="text-muted-foreground">Manage your premium seafood catalog.</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>

        {/* Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                {/* Image upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Image</label>
                  <div
                    className="relative w-full aspect-[16/9] rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-sm">Click to upload image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Upload className="h-7 w-7" />
                          <span className="text-sm font-medium">Upload from device</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Max 10 MB.</p>
                </div>

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Frozen White Prawns" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe the product..." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl><Input placeholder="e.g. Prawns" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weightKg" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (KG)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="pricePerKg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per KG (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-8" placeholder="450" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="inStock" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div>
                      <FormLabel className="text-base">In Stock</FormLabel>
                      <p className="text-sm text-muted-foreground">Toggle product availability</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={updateProduct.isPending || createProduct.isPending || uploading}>
                    {(updateProduct.isPending || createProduct.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-8">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : (
            products?.map(product => (
              <Card key={product.id} className={`bg-card border-border/50 overflow-hidden flex flex-col ${!product.inStock ? 'opacity-70' : ''}`}>
                <div className="aspect-[4/3] bg-secondary/30 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                      <Badge variant="destructive" className="uppercase tracking-widest text-xs">Out of Stock</Badge>
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur border-border/50 uppercase text-[10px] tracking-wider font-semibold">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-bold mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                  <div className="mt-auto flex justify-between items-center border-t border-border/50 pt-4">
                    <div className="flex items-center gap-1 font-bold text-primary text-lg">
                      <IndianRupee className="h-4 w-4" />{product.pricePerKg}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ KG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.inStock}
                        onCheckedChange={() => toggleStock(product.id, product.inStock)}
                        className="scale-75"
                      />
                      <Button variant="outline" size="sm" onClick={() => openEdit(product)} className="border-primary/30 text-primary hover:bg-primary/10">
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
