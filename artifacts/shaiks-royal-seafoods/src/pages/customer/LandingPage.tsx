import React, { useRef, useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, Snowflake, Truck, Droplets, Star, Package, Phone, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useListProducts } from '@workspace/api-client-react';
import { RoyalStandardSection } from '@/components/RoyalStandardSection';
import { JourneySection } from '@/components/JourneySection';

export default function LandingPage() {
  const { data: products } = useListProducts();
  const ctaRef = useRef<HTMLElement>(null);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCtaVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Hero content — tighter vertical padding, content pushed up */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0 lg:pt-14 lg:pb-0">
          <div className="max-w-xl space-y-5">
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">Vijayawada's First Premium Delivery</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl font-bold leading-[1.05] text-foreground">
              Premium Seafood<br />
              <span className="text-primary">Delivered Fresh</span>
            </h1>

            {/* Gold ornament line */}
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/60" />
              <span className="text-primary/80 text-sm font-medium italic tracking-wide">Fresh from the Sea to Your Door</span>
              <div className="h-px w-8 bg-primary/60" />
            </div>

            <p className="text-base text-muted-foreground font-light leading-relaxed">
              Handpicked. Hygienically cleaned. Expertly packed.<br />
              Enjoy the finest seafood, delivered to your doorstep.
            </p>

            {/* Mini feature badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { icon: ShieldCheck, label: 'Premium Quality' },
                { icon: Droplets,   label: 'Hygienically Cleaned' },
                { icon: Snowflake,  label: 'Keep Frozen' },
                { icon: Package,    label: 'Ready to Cook' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-3 text-center hover:border-primary/40 transition-colors duration-200">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto px-8 rounded-full shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:shadow-[0_0_36px_rgba(212,175,55,0.55)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  🛒 Shop Now
                </Button>
              </Link>
              <a href="#products">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-200">
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="relative z-10 mt-10 border-t border-border/30 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
              {[
                { icon: Truck,       label: 'Fast & Reliable', sub: 'Delivery' },
                { icon: ShieldCheck, label: 'Safe & Secure',   sub: 'Packaging' },
                { icon: Snowflake,   label: '100% Natural',    sub: 'No Preservatives' },
                { icon: Star,        label: 'Customer Care',   sub: 'Support' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                  <Icon className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS PREVIEW ── */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-2">Our Products</h2>
              <p className="text-muted-foreground">Export-quality frozen seafood, ready to cook.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-2 hover:scale-105 transition-all duration-200">
                Shop All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products?.filter(p => p.inStock).map(product => (
              <Link key={product.id} href="/products" className="block group">
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden
                  hover:border-primary/50 transition-all duration-300
                  hover:shadow-[0_8px_32px_rgba(212,175,55,0.15)] hover:-translate-y-1 flex flex-col cursor-pointer">
                  {/* Image — compact aspect ratio */}
                  <div className="relative aspect-[2/1] overflow-hidden bg-secondary/20">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <Badge className="product-card-badge absolute top-2 left-2 backdrop-blur uppercase text-[9px] tracking-wider font-bold">
                      {product.category}
                    </Badge>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        Order Now →
                      </span>
                    </div>
                  </div>

                  {/* Info — tighter padding */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="product-card-title text-base font-bold mb-1 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>

                    <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                      <div>
                        <span className="text-lg font-bold text-primary">₹{product.pricePerKg}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">/ kg</span>
                      </div>
                      <span className="text-[10px] text-primary/70 font-medium group-hover:text-primary transition-colors duration-200">
                        Click to order →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROYAL STANDARD — premium interactive section ── */}
      <RoyalStandardSection />

      {/* ── HOW IT WORKS — premium journey section ── */}
      <JourneySection />

      {/* ── HOSTING AN EVENT CTA ── */}
      <section ref={ctaRef} className="relative overflow-hidden py-20 md:py-28">
        {/* Cinematic background */}
        <img
          src="/images/event-hero.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Left-to-right gradient overlay — keeps text readable, reveals image on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/82 to-background/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />

        {/* Animated content */}
        <div
          className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 transition-[opacity,transform] duration-700"
          style={{
            opacity:   ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(32px)',
          }}
        >
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Hosting an Event?
            </h2>

            {/* Gold divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-14 bg-gradient-to-r from-primary/80 to-transparent" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
            </div>

            <p className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-widest">
              Premium seafood catering for:
            </p>

            {/* Event type badges */}
            <div className="flex flex-wrap gap-2 mb-7">
              {[
                '💍 Weddings',
                '🎉 Parties',
                '🏨 Hotels',
                '🍽️ Restaurants',
                '🏢 Corporate Events',
              ].map(ev => (
                <span
                  key={ev}
                  className="text-xs font-semibold text-foreground/90 bg-card/75 backdrop-blur-sm
                    border border-primary/25 px-3 py-1.5 rounded-full
                    hover:border-primary/60 hover:bg-card transition-colors duration-200 cursor-default"
                >
                  {ev}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href="https://wa.me/919908352959"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white rounded-full px-7 gap-2.5
                    shadow-lg shadow-green-900/30 hover:shadow-green-800/50
                    hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order on WhatsApp
                </Button>
              </a>
              <a href="tel:+919908352959">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 rounded-full px-7 gap-2.5
                    shadow-lg shadow-primary/10 hover:shadow-primary/25
                    hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Phone className="h-5 w-5" />
                  Call: +91 99083 52959
                </Button>
              </a>
            </div>

            {/* Bulk order note */}
            <div className="flex items-start gap-3 p-4 bg-card/65 backdrop-blur-sm border border-border/40 rounded-xl max-w-sm">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Need a bulk order?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Call us directly for custom pricing, manual bookings and catering requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-background border-t border-border/50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-80">
            <div className="h-8 w-8 rounded-full border border-primary/50 overflow-hidden p-0.5">
              <img src="/images/logo.png" alt="Logo" className="h-full w-full object-contain rounded-full" />
            </div>
            <span className="font-serif text-xl font-bold">
              Shaik's <span className="text-primary italic">Royal</span> Sea Foods
            </span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Shaik's Royal Sea Foods. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
