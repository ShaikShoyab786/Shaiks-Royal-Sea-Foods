import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, Snowflake, Truck, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.jpg" 
            alt="Luxury Seafood Platter" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>

        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium tracking-widest text-primary uppercase">Vijayawada's First Premium Delivery</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif leading-[1.1]">
              Fresh from the Sea to <span className="text-primary italic">Your Door.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground font-light max-w-xl leading-relaxed">
              Experience the finest export-quality seafood, hygienically cleaned, flash-frozen at -18°C, and delivered with uncompromising luxury.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all">
                  Shop Premium Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-primary/50 text-primary hover:bg-primary/10">
                  Discover Our Process
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section id="quality" className="py-20 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The Royal Standard</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: ShieldCheck, title: "Export Quality", desc: "Sourced from the finest catch, meeting strict export standards." },
              { icon: Droplets, title: "Hygienically Cleaned", desc: "Prepared in sterile environments, ready to cook instantly." },
              { icon: Snowflake, title: "Flash Frozen -18°C", desc: "Locked-in freshness and nutrients using advanced freezing technology." },
              { icon: Truck, title: "Temperature Controlled", desc: "Delivered in insulated boxes to ensure zero thawing." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="h-20 w-20 rounded-full border-2 border-primary/20 flex items-center justify-center bg-card mb-6 group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <feature.icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Teaser */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Curated Catch</h2>
              <p className="text-muted-foreground text-lg max-w-md">Our signature products, prepared and packaged for the ultimate culinary experience.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-2">
                View Full Collection <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Prawns Teaser */}
            <Link href="/products" className="group block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 bg-card group-hover:border-primary/50 transition-colors duration-500">
                <img 
                  src="/images/white-prawns.jpg" 
                  alt="Premium Frozen Prawns" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="font-serif text-3xl font-bold mb-2">White Prawns</h3>
                  <p className="text-primary font-medium tracking-wide">Peeled & Deveined • 1KG</p>
                </div>
              </div>
            </Link>
            
            {/* Fish Teaser */}
            <Link href="/products" className="group block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 bg-card group-hover:border-primary/50 transition-colors duration-500">
                <img 
                  src="/images/apollo-fish.jpg" 
                  alt="Premium Apollo Fish Steak" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="font-serif text-3xl font-bold mb-2">Apollo Fish Steaks</h3>
                  <p className="text-primary font-medium tracking-wide">Premium Cut • 1KG</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-card/50 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The Journey to Your Table</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-border/50 z-0"></div>
            
            {[
              { step: "01", title: "Select Your Catch", desc: "Choose from our curated selection of premium frozen seafood, available in 1KG packs." },
              { step: "02", title: "Choose Delivery Slot", desc: "Pick a morning (7AM-11AM) or afternoon (3PM-6PM) slot that suits your schedule." },
              { step: "03", title: "Royal Delivery", desc: "Our field executives deliver your order in temperature-controlled bags directly to your door." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-card shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center mb-8 relative">
                  <span className="font-serif text-2xl font-bold text-primary">{item.step}</span>
                  <div className="absolute -inset-2 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]"></div>
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Order CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl border border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Hosting an Event?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              We supply premium seafood for weddings, banquets, and high-end restaurants across Vijayawada. 
              Contact us for exclusive bulk pricing.
            </p>
            <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg" onClick={() => window.open('https://wa.me/919999999999', '_blank')}>
              Message on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <span className="font-serif text-xl font-bold">
              Shaik's <span className="text-primary italic">Royal</span> Sea Foods
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shaik's Royal Sea Foods. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
