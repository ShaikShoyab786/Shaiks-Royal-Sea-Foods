import React, { useRef, useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useListProducts } from '@workspace/api-client-react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Minus, ShoppingBag, Info } from 'lucide-react';
import { showCartToast } from '@/components/CartToast';
import { useLocation } from 'wouter';

export default function ProductsPage() {
  const [, navigate] = useLocation();
  const { data: products, isLoading } = useListProducts();
  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  const [heroIn, setHeroIn] = useState(false);
  const heroImgRef = useRef<HTMLImageElement>(null);

  const getQuantity = (productId: number) =>
    items.find(i => i.product.id === productId)?.weightKg || 0;

  const handleAdd = (product: any) => {
    addItem(product, 1);
    showCartToast({ productName: product.name, navigate });
  };
  const handleIncrement = (product: any) =>
    updateQuantity(product.id, getQuantity(product.id) + 1);
  const handleDecrement = (product: any) => {
    const q = getQuantity(product.id);
    if (q <= 1) removeItem(product.id);
    else updateQuantity(product.id, q - 1);
  };

  /* Hero fade-in on mount */
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setHeroIn(true)));
  }, []);

  /* Subtle parallax on scroll */
  useEffect(() => {
    const onScroll = () => {
      if (heroImgRef.current) {
        const y = Math.min(window.scrollY * 0.22, 70);
        heroImgRef.current.style.transform = `scale(1.12) translateY(${y}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Cinematic hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 'clamp(260px, 36vw, 420px)' }}
      >
        {/* Parallax image */}
        <img
          ref={heroImgRef}
          src="/images/products-hero.png"
          alt="Premium seafood selection"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.12) translateY(0px)' }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/25 to-background/88 pointer-events-none" />

        {/* Floating gold glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div
            className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full bg-primary/[0.04] blur-[70px]"
            style={{ animation: 'float-particle 12s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-[10%] right-[12%] w-56 h-56 rounded-full bg-primary/[0.03] blur-[60px]"
            style={{ animation: 'float-particle 15s ease-in-out infinite 2s' }}
          />
        </div>

        {/* Hero text content */}
        <div
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4
            transition-[opacity,transform] duration-700"
          style={{
            opacity:   heroIn ? 1 : 0,
            transform: heroIn ? 'translateY(0)' : 'translateY(22px)',
          }}
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl mb-4">
            Premium Selection
          </h1>

          {/* Gold ornament divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-primary/75" />
            <div className="h-2 w-2 rotate-45 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.7)]" />
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-primary/75" />
          </div>

          <p className="text-foreground/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed drop-shadow">
            Hygienically cleaned, export-quality seafood delivered flash-frozen
            to preserve nutrients and taste.
          </p>
        </div>
      </div>

      {/* ── Products grid ── */}
      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-card border-border/50 overflow-hidden">
                <Skeleton className="h-52 w-full rounded-none" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-9 w-28 rounded-full" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products?.filter(p => p.inStock).map(product => (
              <Card
                key={product.id}
                className="bg-card border-primary/20 overflow-hidden flex flex-col group
                  hover:border-primary/55 transition-all duration-300
                  shadow-lg hover:shadow-[0_10px_36px_rgba(212,175,55,0.16)] hover:-translate-y-1"
              >
                {/* Product image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-background">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <ShoppingBag className="h-14 w-14 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-background/80 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Card content */}
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-bold text-foreground leading-tight mb-2">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2.5 py-2 bg-background/50 rounded-lg border border-border/50">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Pack size: 1 KG (Net weight after cleaning)</span>
                  </div>
                </CardContent>

                {/* Footer */}
                <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/50 mt-auto bg-card">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Per KG</p>
                    <p className="font-serif text-2xl font-bold text-primary">₹{product.pricePerKg}</p>
                  </div>

                  {getQuantity(product.id) > 0 ? (
                    <div className="flex items-center gap-2 bg-background border border-primary/30 rounded-full p-0.5">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                        onClick={() => handleDecrement(product)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-5 text-center font-bold font-mono text-sm">
                        {getQuantity(product.id)}
                      </span>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                        onClick={() => handleIncrement(product)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="rounded-full px-5 h-9 text-sm shadow-md shadow-primary/20
                        hover:shadow-primary/40 hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
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
