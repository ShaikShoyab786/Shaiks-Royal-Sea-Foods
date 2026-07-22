import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useGetOrder } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, PackageCheck, MapPin, ReceiptText, Calendar } from 'lucide-react';

export default function OrderTrackingPage() {
  const { user } = useRequireAuth();
  const { id } = useParams();
  
  const { data: order, isLoading } = useGetOrder(Number(id), { 
    query: { enabled: !!id, queryKey: ['getOrder', id] } 
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'assigned': return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30';
      case 'out_for_delivery': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const steps = [
    { id: 'pending', icon: Clock, label: 'Order Placed' },
    { id: 'confirmed', icon: CheckCircle2, label: 'Confirmed' },
    { id: 'assigned', icon: Package, label: 'Packed' },
    { id: 'out_for_delivery', icon: Truck, label: 'Out for Delivery' },
    { id: 'delivered', icon: PackageCheck, label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order?.status);
  
  // Handling special status 'cancelled'
  const isCancelled = order?.status === 'cancelled';

  if (isLoading) return <div className="min-h-screen bg-background pt-20 text-center text-muted-foreground">Loading...</div>;
  if (!order) return <div className="min-h-screen bg-background pt-20 text-center text-muted-foreground">Order not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Link href="/orders" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Order #{order.id}</h1>
            <p className="text-muted-foreground mt-1">Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy - hh:mm a')}</p>
          </div>
          <Badge variant="outline" className={`${getStatusColor(order.status)} text-sm px-4 py-1.5 uppercase tracking-wider`}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Tracking & Items */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tracking Timeline */}
            <Card className="bg-card border-primary/20">
              <CardHeader className="border-b border-border/50 bg-secondary/10">
                <CardTitle className="font-serif">Delivery Status</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {isCancelled ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-destructive">Order Cancelled</h3>
                    <p className="text-muted-foreground">This order has been cancelled.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border/50"></div>
                    
                    <div className="space-y-8 relative">
                      {steps.map((step, index) => {
                        const isCompleted = currentStepIndex >= index;
                        const isCurrent = currentStepIndex === index;
                        
                        return (
                          <div key={step.id} className="flex items-start gap-6">
                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                              isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'
                            } ${isCurrent ? 'shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-4 ring-primary/20' : ''}`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                            <div className="pt-3 flex-1">
                              <h4 className={`text-lg font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                              </h4>
                              {isCurrent && order.executiveName && order.status === 'out_for_delivery' && (
                                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                                  <Truck className="h-3.5 w-3.5" /> 
                                  Out for delivery by {order.executiveName}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-serif flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-6">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{item.productName}</h4>
                        <p className="text-muted-foreground mt-1">₹{item.pricePerKg} / KG</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm bg-secondary/50 px-3 py-1 rounded text-muted-foreground mb-1 inline-block">
                          {item.weightKg} KG
                        </div>
                        <p className="font-bold text-lg text-primary">₹{item.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar - Details */}
          <div className="space-y-8">
            
            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50 bg-secondary/10">
                <CardTitle className="font-serif flex items-center gap-2 text-lg">
                  <ReceiptText className="h-4 w-4 text-primary" /> Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charge ({order.distanceKm} km)</span>
                  <span>₹{order.deliveryCharge}</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between items-center">
                  <span className="font-bold font-serif">Total</span>
                  <span className="font-bold font-serif text-xl text-primary">₹{order.total}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-border/50 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                    <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}>
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-serif text-lg">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</p>
                  <p className="font-medium text-sm leading-relaxed">{order.deliveryAddress}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</p>
                    <p className="font-medium text-sm">{format(new Date(order.deliveryDate), 'MMM dd')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Slot</p>
                    <p className="font-medium text-sm">{order.timeslotLabel}</p>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Instructions</p>
                    <p className="text-sm bg-secondary/30 p-3 rounded border border-border/50 italic text-muted-foreground">
                      "{order.notes}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
