import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, Snowflake, Truck, Droplets, ShoppingCart, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useListProducts } from '@workspace/api-client-react';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

export default function LandingPage() {
  const { data: products } = useListProducts();
  const { items, addItem, updateQuantity } = useCartStore();

  const handleAddToCart = (product: any) => {
    const inCart = items.find(i => i.product.id === product.id);
    if (inCart) {
      updateQuantity(product.id, inCart.weightKg + 1);
    } else {
      addItem(product, 1);
    }
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-background">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.jpg"
            alt="Premium Seafood"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">Vijayawada's First Premium Delivery</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-foreground">
              Premium Seafood<br />
              <span className="text-primary">Delivered Fresh</span>
            </h1>

            {/* Gold ornament line */}
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-primary/60" />
              <span className="text-primary/80 text-sm font-medium italic tracking-wide">Fresh from the Sea to Your Door</span>
              <div className="h-[1px] w-8 bg-primary/60" />
            </div>

            <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-lg">
              Handpicked. Hygienically cleaned. Expertly packed.<br />
              Enjoy the finest seafood, delivered to your doorstep.
            </p>

            {/* Mini feature badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              {[
                { icon: ShieldCheck, label: 'Premium Quality' },
                { icon: Droplets,   label: 'Hygienically Cleaned' },
                { icon: Snowflake,  label: 'Keep Frozen' },
                { icon: Package,    label: 'Ready to Cook' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-3 text-center">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base rounded-full shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:shadow-[0_0_36px_rgba(212,175,55,0.55)] transition-all">
                  🛒 Shop Now
                </Button>
              </Link>
              <a href="#products">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base rounded-full border-primary/40 text-primary hover:bg-primary/10">
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="relative z-10 border-t border-border/30 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
              {[
                { icon: Truck,       label: 'Fast & Reliable', sub: 'Delivery' },
                { icon: ShieldCheck, label: 'Safe & Secure',   sub: 'Packaging' },
                { icon: Snowflake,   label: '100% Natural',    sub: 'No Preservatives' },
                { icon: Star,        label: 'Customer Care',   sub: 'Support' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-4">
                  <Icon className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-2">Our Products</h2>
              <p className="text-muted-foreground">Export-quality frozen seafood, ready to cook.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.filter(p => p.inStock).map(product => {
              const qty = items.find(i => i.product.id === product.id)?.weightKg ?? 0;
              return (
                <div key={product.id} className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary/20">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur border-border/50 uppercase text-[10px] tracking-wider">
                      {product.category}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif text-xl font-bold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{product.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div>
                        <span className="text-2xl font-bold text-primary">₹{product.pricePerKg}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ kg</span>
                      </div>

                      {qty === 0 ? (
                        <Button
                          size="sm"
                          className="rounded-full px-5 gap-2 shadow-sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{qty} kg in cart</span>
                          <Button size="sm" className="rounded-full px-5 gap-2 shadow-sm" onClick={() => handleAddToCart(product)}>
                            + Add More
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROYAL STANDARD (moved after products) ── */}
      <section id="quality" className="py-20 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The Royal Standard</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: ShieldCheck, title: 'Export Quality',          desc: 'Sourced from the finest catch, meeting strict export standards.' },
              { icon: Droplets,   title: 'Hygienically Cleaned',     desc: 'Prepared in sterile environments, ready to cook instantly.' },
              { icon: Snowflake,  title: 'Flash Frozen -18°C',       desc: 'Locked-in freshness and nutrients using advanced freezing technology.' },
              { icon: Truck,      title: 'Temperature Controlled',   desc: 'Delivered in insulated boxes to ensure zero thawing.' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="h-20 w-20 rounded-full border-2 border-primary/20 flex items-center justify-center bg-card mb-6 group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <f.icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-card/50 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The Journey to Your Table</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-border/50 z-0" />
            {[
              { step: '01', title: 'Select Your Catch',  desc: 'Choose from our curated selection of premium frozen seafood, available in 1 KG packs.' },
              { step: '02', title: 'Choose Delivery Slot', desc: 'Pick a morning (7 AM–11 AM) or afternoon (3 PM–6 PM) slot that suits your schedule.' },
              { step: '03', title: 'Royal Delivery',      desc: 'Our field executives deliver your order in temperature-controlled bags directly to your door.' },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-card shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center mb-8 relative">
                  <span className="font-serif text-2xl font-bold text-primary">{item.step}</span>
                  <div className="absolute -inset-2 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BULK ORDER CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl border border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Hosting an Event?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              We supply premium seafood for weddings, banquets, and high-end restaurants across Vijayawada. Contact us for exclusive bulk pricing.
            </p>
            <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg" onClick={() => window.open('https://wa.me/919999999999', '_blank')}>
              Message on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-background border-t border-border/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-80">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-serif text-xl font-bold">
              Shaik's <span className="text-primary italic">Royal</span> Sea Foods
            </span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Shaik's Royal Sea Foods. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
