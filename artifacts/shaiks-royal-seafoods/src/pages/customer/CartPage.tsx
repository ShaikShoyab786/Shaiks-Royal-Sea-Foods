import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useCartStore } from '@/store/useCartStore';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const subtotal = getTotal();
  const estimatedDelivery = items.length > 0 ? "Calculated at checkout" : "₹0";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <h1 className="font-serif text-4xl font-bold mb-8 text-center md:text-left">Your Royal Cart</h1>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center border border-border/50 mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Explore our premium collection and add your favorite catches to the cart.
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8">
                Explore Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <Card key={item.product.id} className="bg-card border-primary/10 overflow-hidden">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-40 h-40 bg-secondary/30 relative">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold mb-1">{item.product.name}</h3>
                          <p className="text-muted-foreground text-sm">₹{item.product.pricePerKg} / KG</p>
                        </div>
                        <p className="font-serif text-xl font-bold text-primary">
                          ₹{item.product.pricePerKg * item.weightKg}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-1 bg-background border border-border/50 rounded-lg p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md hover:bg-muted"
                            onClick={() => item.weightKg > 1 ? updateQuantity(item.product.id, item.weightKg - 1) : removeItem(item.product.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-mono font-medium">{item.weightKg}kg</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md hover:bg-muted"
                            onClick={() => updateQuantity(item.product.id, item.weightKg + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <Card className="bg-card/50 border-primary/20 sticky top-28">
                <CardContent className="p-6">
                  <h3 className="font-serif text-2xl font-bold mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Charge</span>
                      <span className="font-medium">{estimatedDelivery}</span>
                    </div>
                    
                    <Separator className="bg-border/50 my-4" />
                    
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold font-serif">Estimated Total</span>
                      <span className="font-bold font-serif text-primary text-2xl">₹{subtotal}</span>
                    </div>
                  </div>
                  
                  <Link href="/checkout">
                    <Button size="lg" className="w-full mt-8 h-14 rounded-xl text-lg shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <p className="text-xs text-center text-muted-foreground mt-6 leading-relaxed">
                    Delivery charge is free within 5km of our Kanuru hub. ₹5/km thereafter. Calculated on next step.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
