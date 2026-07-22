import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCartStore } from '@/store/useCartStore';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListTimeslots, useCreateOrder, OrderInputPaymentMethod } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, 'Please provide a complete address'),
  latitude: z.number(),
  longitude: z.number(),
  timeslotId: z.coerce.number().min(1, 'Please select a delivery timeslot'),
  deliveryDate: z.string(),
  paymentMethod: z.enum([OrderInputPaymentMethod.cod, OrderInputPaymentMethod.online]),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const { user } = useRequireAuth();
  const [, setLocation] = useLocation();
  const { items, getTotal, clearCart } = useCartStore();
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isLocating, setIsLocating] = useState(false);
  
  const { data: timeslots, isLoading: loadingTimeslots } = useListTimeslots();
  const createOrderMutation = useCreateOrder();

  const subtotal = getTotal();
  const deliveryCharge = distanceKm > 5 ? Math.ceil(distanceKm - 5) * 5 : 0;
  const total = subtotal + deliveryCharge;

  // Available dates: Today and Tomorrow
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: '',
      latitude: 16.5062, // Default to Vijayawada center
      longitude: 80.6480,
      deliveryDate: today,
      paymentMethod: OrderInputPaymentMethod.cod,
      notes: '',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      setLocation('/cart');
    }
  }, [items, setLocation]);

  const getLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('latitude', position.coords.latitude);
          form.setValue('longitude', position.coords.longitude);
          
          // Mock distance calculation based on lat/lng (for demo purposes)
          // Assume Kanuru hub is 16.4950, 80.6850
          const dist = Math.sqrt(
            Math.pow(position.coords.latitude - 16.4950, 2) + 
            Math.pow(position.coords.longitude - 80.6850, 2)
          ) * 111; // rough conversion to km
          
          setDistanceKm(dist);
          setIsLocating(false);
          toast.success('Location acquired');
        },
        (error) => {
          setIsLocating(false);
          toast.error('Could not get location. Please allow location access.');
        }
      );
    } else {
      setIsLocating(false);
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    if (!values.timeslotId) {
      toast.error('Please select a timeslot');
      return;
    }

    const orderData = {
      ...values,
      items: items.map(item => ({
        productId: item.product.id,
        weightKg: item.weightKg
      }))
    };

    createOrderMutation.mutate({ data: orderData }, {
      onSuccess: (res) => {
        clearCart();
        toast.success('Order placed successfully!');
        setLocation(`/orders/${res.id}`);
      },
      onError: (err: any) => {
        toast.error(err?.error || 'Failed to place order');
      }
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Secure Checkout</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Location & Address */}
                <Card className="bg-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">1</span>
                      Delivery Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full sm:w-auto gap-2 border-primary/50 text-primary hover:bg-primary/10"
                        onClick={getLocation}
                        disabled={isLocating}
                      >
                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                        {isLocating ? 'Locating...' : 'Use Current Location'}
                      </Button>
                      <div className="flex items-center text-sm text-muted-foreground bg-secondary/30 px-4 py-2 rounded-lg border border-border flex-1">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        {distanceKm > 0 
                          ? `Distance from Hub: ${distanceKm.toFixed(1)} km` 
                          : 'Detect location to calculate exact delivery fee'}
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address (House No, Building, Street, Area)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g. Flat 201, Royal Apartments, MG Road, Vijayawada" 
                              className="resize-none h-24 bg-background/50 focus-visible:ring-primary" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Call upon arrival, leave at security" className="bg-background/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 2. Schedule */}
                <Card className="bg-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">2</span>
                      Delivery Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Date</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 h-12">
                                <SelectValue placeholder="Select a date" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={today}>Today ({format(new Date(), 'MMM dd')})</SelectItem>
                              <SelectItem value={tomorrow}>Tomorrow ({format(addDays(new Date(), 1), 'MMM dd')})</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeslotId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Select Time Slot</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) => field.onChange(parseInt(val))}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              {loadingTimeslots ? (
                                <div className="col-span-2 py-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                              ) : (
                                timeslots?.filter(t => t.isActive).map((slot) => (
                                  <FormItem key={slot.id} className="relative">
                                    <FormControl>
                                      <RadioGroupItem value={slot.id.toString()} className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-border/50 bg-background p-4 hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                      <span className="font-serif text-lg font-bold mb-1">{slot.label}</span>
                                      <span className="text-sm text-muted-foreground">{slot.startHour}:00 - {slot.endHour}:00</span>
                                      <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                                    </FormLabel>
                                  </FormItem>
                                ))
                              )}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 3. Payment */}
                <Card className="bg-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">3</span>
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-background">
                                <FormControl>
                                  <RadioGroupItem value={OrderInputPaymentMethod.cod} />
                                </FormControl>
                                <FormLabel className="flex-1 font-medium cursor-pointer">
                                  Cash on Delivery
                                  <p className="text-xs text-muted-foreground mt-1 font-normal">Pay when you receive your order</p>
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-background opacity-60 cursor-not-allowed">
                                <FormControl>
                                  <RadioGroupItem value={OrderInputPaymentMethod.online} disabled />
                                </FormControl>
                                <FormLabel className="flex-1 font-medium">
                                  Online Payment
                                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">Coming Soon</span>
                                  <p className="text-xs text-muted-foreground mt-1 font-normal">UPI, Cards, Netbanking</p>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-card/50 border-primary/20 sticky top-28">
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center text-sm">
                          <div className="flex gap-3 items-center">
                            <span className="font-mono bg-secondary/50 px-2 py-1 rounded text-xs">{item.weightKg}x</span>
                            <span className="truncate max-w-[150px]">{item.product.name}</span>
                          </div>
                          <span className="font-medium text-right min-w-[60px]">₹{item.product.pricePerKg * item.weightKg}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-border/50 my-4" />

                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          Delivery Charge
                        </span>
                        <span className="font-medium">
                          {distanceKm === 0 ? 'Pending' : deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-border/50 my-4" />
                    
                    <div className="flex justify-between items-center mb-8">
                      <span className="font-bold font-serif text-lg">Total</span>
                      <span className="font-bold font-serif text-primary text-3xl">
                        ₹{distanceKm === 0 ? subtotal : total}
                      </span>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 rounded-xl text-lg shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      Place Royal Order
                    </Button>
                  </CardContent>
                </Card>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
