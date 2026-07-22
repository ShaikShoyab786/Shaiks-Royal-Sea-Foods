import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useListOrders } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageOpen, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useRequireAuth();
  
  // Custom hook usage for Orval needs the user ID context if possible, but list orders on customer side usually just returns their own based on token
  const { data: orders, isLoading } = useListOrders();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl flex-1">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto border border-border mb-6">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">You haven't placed any royal orders yet.</p>
            <Link href="/products">
              <Button className="rounded-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <Card className="bg-card border-primary/10 hover:border-primary/40 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Info */}
                      <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-border/50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order #{order.id}</p>
                            <h3 className="font-serif text-xl font-bold text-foreground">
                              {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} • ₹{order.total}
                            </h3>
                          </div>
                          <Badge variant="outline" className={`${getStatusColor(order.status)} font-semibold uppercase tracking-wide px-3 py-1`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p className="truncate max-w-sm">
                            <span className="font-medium text-foreground mr-2">Items:</span> 
                            {order.items.map(i => i.productName).join(', ')}
                          </p>
                          <p className="flex items-center gap-2 truncate">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                      
                      {/* Right: Schedule & Action */}
                      <div className="p-6 md:w-64 flex flex-col justify-between bg-secondary/10">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded border border-border">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground text-xs">Delivery Date</p>
                              <p className="font-medium">{format(new Date(order.deliveryDate), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded border border-border">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground text-xs">Time Slot</p>
                              <p className="font-medium">{order.timeslotLabel}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-primary text-sm font-medium group-hover:underline mt-auto">
                          View details <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
