import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useListProducts } from '@workspace/api-client-react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Minus, ShoppingBag, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { data: products, isLoading } = useListProducts();
  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  const getQuantity = (productId: number) => {
    return items.find((i) => i.product.id === productId)?.weightKg || 0;
  };

  const handleAdd = (product: any) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrement = (product: any) => {
    const current = getQuantity(product.id);
    updateQuantity(product.id, current + 1);
  };

  const handleDecrement = (product: any) => {
    const current = getQuantity(product.id);
    if (current <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, current - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-card/50 border-b border-border/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Premium Selection</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hygienically cleaned, export-quality catch delivered flash-frozen to preserve nutrients and taste.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border/50 overflow-hidden">
                <Skeleton className="h-64 w-full rounded-none" />
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-between items-center">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-10 w-32 rounded-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl font-bold mb-2">No products available</h3>
            <p className="text-muted-foreground">Check back soon for fresh catch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.filter(p => p.inStock).map((product) => (
              <Card key={product.id} className="bg-card border-primary/20 overflow-hidden flex flex-col group hover:border-primary/50 transition-colors duration-500 shadow-xl">
                <div className="relative aspect-square overflow-hidden bg-background">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/80 backdrop-blur-md border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-2xl font-bold text-foreground leading-tight">{product.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 p-3 bg-background/50 rounded-lg border border-border/50">
                    <Info className="h-4 w-4 text-primary" />
                    <span>Pack size: 1 KG (Net weight after cleaning)</span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 flex justify-between items-end border-t border-border/50 mt-auto bg-card">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Price per KG</p>
                    <p className="font-serif text-3xl font-bold text-primary">₹{product.pricePerKg}</p>
                  </div>
                  
                  {getQuantity(product.id) > 0 ? (
                    <div className="flex items-center gap-3 bg-background border border-primary/30 rounded-full p-1 shadow-inner">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleDecrement(product)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center font-bold font-mono">{getQuantity(product.id)}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleIncrement(product)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                      onClick={() => handleAdd(product)}
                    >
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
