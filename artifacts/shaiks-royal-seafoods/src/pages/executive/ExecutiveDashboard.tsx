import React from 'react';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { UserRole, useGetMyDeliveries } from '@workspace/api-client-react';
import { User as UserIcon2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, IndianRupee, LogOut, PackageCheck, Phone } from 'lucide-react';

export default function ExecutiveDashboard() {
  const { user } = useRequireAuth([UserRole.executive]);
  const { logout } = useAuthStore();
  
  // Use the specific executive hook
  const { data: deliveries, isLoading } = useGetMyDeliveries({ 
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const activeDeliveries = deliveries?.filter(d => ['assigned', 'out_for_delivery'].includes(d.status)) || [];
  const completedDeliveries = deliveries?.filter(d => d.status === 'delivered') || [];
  
  // Calculate earnings from completed only, or all assigned if that's the metric.
  // The API executive stats usually aggregate this, but we can do it here.
  const cashToCollect = activeDeliveries.filter(d => d.paymentMethod === 'cod').reduce((sum, d) => sum + d.total, 0);
  const cashCollected = completedDeliveries.filter(d => d.paymentMethod === 'cod').reduce((sum, d) => sum + d.total, 0);
  const fuelEarned = completedDeliveries.reduce((sum, d) => sum + d.deliveryCharge, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile-friendly header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-xl font-bold text-primary">Field Portal</h1>
          <p className="text-xs text-muted-foreground">Hi, {user?.name}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 flex-1 space-y-6">
        {/* Earnings Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <PackageCheck className="h-5 w-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold font-serif">{completedDeliveries.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <Navigation className="h-5 w-5 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold font-serif">{activeDeliveries.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 col-span-2">
            <CardContent className="p-4 flex justify-around items-center">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Cash to Drop</p>
                <p className="text-xl font-bold text-primary flex items-center justify-center gap-1">
                  <IndianRupee className="h-4 w-4" />{cashCollected}
                </p>
              </div>
              <div className="h-8 w-px bg-border/50"></div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Fuel Earned</p>
                <p className="text-xl font-bold text-green-500 flex items-center justify-center gap-1">
                  <IndianRupee className="h-4 w-4" />{fuelEarned}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries List */}
        <div>
          <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            Today's Missions
            <Badge variant="secondary" className="ml-auto">{activeDeliveries.length} Active</Badge>
          </h2>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading trips...</div>
            ) : activeDeliveries.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                <Navigation className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No active deliveries.</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            ) : (
              activeDeliveries.map(delivery => (
                <Link key={delivery.id} href={`/executive/orders/${delivery.id}`} className="block">
                  <Card className="bg-card border-primary/20 hover:border-primary/50 transition-colors shadow-lg shadow-black/20">
                    <CardHeader className="p-4 border-b border-border/50 bg-secondary/10 flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">Order #{delivery.id}</CardTitle>
                        <p className="text-xs font-medium text-primary mt-1">Collect: ₹{delivery.paymentMethod === 'cod' ? delivery.total : '0 (Paid)'}</p>
                      </div>
                      <Badge variant="outline" className={`uppercase text-[10px] ${delivery.status === 'out_for_delivery' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30'}`}>
                        {delivery.status.replace(/_/g, ' ')}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                        <span className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center shrink-0">
                          <UserIcon2 className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div>
                          <p>{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {delivery.customerPhone}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-background border border-border/50 rounded p-3 flex gap-2 items-start">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {delivery.deliveryAddress}
                        </p>
                      </div>

                      <Button variant="ghost" className="w-full bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary h-10 text-sm">
                        Open Delivery Details <ArrowRightCircle className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
          
          {completedDeliveries.length > 0 && (
            <div className="mt-8">
              <h3 className="font-serif text-md font-bold mb-4 text-muted-foreground">Completed Today</h3>
              <div className="space-y-3">
                {completedDeliveries.map(delivery => (
                  <Card key={delivery.id} className="bg-card border-border/50 opacity-70">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">#{delivery.id} - {delivery.customerName}</p>
                        <p className="text-xs text-muted-foreground">Earned: ₹{delivery.deliveryCharge}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase">
                        Delivered
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dummy import to make the compiler happy until next file
import { ArrowRightCircle } from 'lucide-react';
