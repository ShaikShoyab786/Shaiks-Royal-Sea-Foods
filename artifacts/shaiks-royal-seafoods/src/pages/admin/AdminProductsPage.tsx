import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { 
  UserRole, 
  useListProducts, 
  useUpdateProduct, 
  useCreateProduct 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Package, IndianRupee } from 'lucide-react';

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
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useListProducts();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', category: 'Premium Catch', pricePerKg: 0, weightKg: 1, imageUrl: '', inStock: true
    }
  });

  const openEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      category: product.category,
      pricePerKg: product.pricePerKg,
      weightKg: product.weightKg,
      imageUrl: product.imageUrl || '',
      inStock: product.inStock
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    form.reset({
      name: '', description: '', category: 'Premium Catch', pricePerKg: 0, weightKg: 1, imageUrl: '', inStock: true
    });
    setIsDialogOpen(true);
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
          }
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
          }
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
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="font-serif text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage your premium catalog.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-border bg-card">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerKg" render={({ field }) => (
                      <FormItem><FormLabel>Price / KG (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Description</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="inStock" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 col-span-2">
                        <div className="space-y-0.5"><FormLabel className="text-base">In Stock</FormLabel><p className="text-xs text-muted-foreground">Allow customers to order this item.</p></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={updateProduct.isPending || createProduct.isPending}>
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-8 custom-scrollbar">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : (
            products?.map(product => (
              <Card key={product.id} className={`bg-card border-border/50 overflow-hidden flex flex-col ${!product.inStock ? 'opacity-70' : ''}`}>
                <div className="aspect-[4/3] bg-secondary/30 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="h-10 w-10 text-muted-foreground/30" /></div>
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
                      <IndianRupee className="h-4 w-4" />{product.pricePerKg} <span className="text-xs font-normal text-muted-foreground ml-1">/ KG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toggleStock(product.id, product.inStock)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title={product.inStock ? "Mark Out of Stock" : "Mark In Stock"}>
                        <Switch checked={product.inStock} className="scale-75" />
                      </Button>
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
