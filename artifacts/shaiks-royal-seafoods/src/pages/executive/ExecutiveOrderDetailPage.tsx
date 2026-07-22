import React from 'react';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useParams, Link } from 'wouter';
import { 
  UserRole, 
  useGetOrder, 
  useUpdateOrderStatus,
  useMarkCashCollected,
  OrderStatusUpdateStatus
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, IndianRupee, Navigation, CheckCircle2, Box } from 'lucide-react';

export default function ExecutiveOrderDetailPage() {
  useRequireAuth([UserRole.executive]);
  const { id } = useParams();
  const orderId = Number(id);
  const queryClient = useQueryClient();
  
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ['getOrder', orderId] }
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const markCashMutation = useMarkCashCollected();

  const handleUpdateStatus = (newStatus: OrderStatusUpdateStatus) => {
    updateStatusMutation.mutate(
      { id: orderId, data: { status: newStatus } },
      {
        onSuccess: (updated) => {
          toast.success(`Marked as ${newStatus.replace('_', ' ')}`);
          queryClient.setQueryData(['getOrder', orderId], updated);
          // Invalidate list
          queryClient.invalidateQueries({ queryKey: ['/api/deliveries/me'] });
        },
        onError: (err: any) => toast.error(err.error || 'Failed to update')
      }
    );
  };

  const handleMarkCash = () => {
    markCashMutation.mutate(
      { id: orderId },
      {
        onSuccess: (updated) => {
          toast.success('Cash collection recorded');
          queryClient.setQueryData(['getOrder', orderId], updated);
        },
        onError: (err: any) => toast.error(err.error || 'Failed to record cash')
      }
    );
  };

  const openMaps = () => {
    if (order) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`, '_blank');
    }
  };

  if (isLoading || !order) return <div className="p-8 text-center text-muted-foreground">Loading details...</div>;

  const isCOD = order.paymentMethod === 'cod';
  const needsCollection = isCOD && !order.cashCollected;
  const isDelivered = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 px-4 py-4 flex items-center gap-3">
        <Link href="/executive">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-serif text-lg font-bold">Order #{order.id}</h1>
        <Badge variant="outline" className={`ml-auto uppercase text-[10px] ${order.status === 'out_for_delivery' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : order.status === 'delivered' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30'}`}>
          {order.status.replace(/_/g, ' ')}
        </Badge>
      </header>

      <div className="p-4 space-y-4">
        
        {/* Customer & Location */}
        <Card className="bg-card border-primary/20 shadow-lg">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                <h2 className="text-xl font-bold">{order.customerName}</h2>
              </div>
              <Button size="icon" variant="outline" className="rounded-full border-primary/50 text-primary bg-primary/5" onClick={() => window.open(`tel:${order.customerPhone}`)}>
                <Phone className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-secondary/20 p-4 rounded-xl border border-border/50 relative overflow-hidden">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed z-10 relative">{order.deliveryAddress}</p>
              </div>
              
              <Button className="w-full mt-4 bg-background border border-border text-foreground hover:bg-secondary/50 shadow-sm" onClick={openMaps}>
                <Navigation className="h-4 w-4 mr-2 text-blue-400" /> Get Directions ({order.distanceKm} km)
              </Button>
            </div>

            {order.notes && (
              <div className="bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                <p className="text-xs font-bold text-yellow-500 mb-1 uppercase">Delivery Note</p>
                <p className="text-sm text-muted-foreground italic">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Required Card */}
        <Card className={`bg-card border-2 shadow-lg ${needsCollection && !isDelivered ? 'border-primary shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-border/50'}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">To Collect</p>
              <h3 className={`text-2xl font-bold font-serif flex items-center ${isCOD && !order.cashCollected ? 'text-primary' : 'text-foreground'}`}>
                <IndianRupee className="h-5 w-5" />{isCOD ? order.total : '0 (Paid)'}
              </h3>
            </div>
            
            {isCOD && (
              order.cashCollected ? (
                <div className="flex items-center text-green-500 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Collected
                </div>
              ) : isDelivered ? (
                <Button size="sm" onClick={handleMarkCash} disabled={markCashMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  Mark Collected
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground text-right w-24">Deliver first to collect</div>
              )
            )}
          </CardContent>
        </Card>

        {/* Package Contents */}
        <Card className="bg-card border-border/50">
          <CardHeader className="p-4 border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" /> Package Contents ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {order.items.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center text-sm">
                  <span className="font-medium">{item.productName}</span>
                  <span className="font-mono bg-secondary/50 px-2 py-1 rounded text-muted-foreground">{item.weightKg} KG</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Action Bar */}
      {!isDelivered && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-20">
          {order.status === 'assigned' && (
            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl text-lg shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
              onClick={() => handleUpdateStatus('out_for_delivery')}
              disabled={updateStatusMutation.isPending}
            >
              Start Trip
            </Button>
          )}
          {order.status === 'out_for_delivery' && (
            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl text-lg bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.2)]" 
              onClick={() => handleUpdateStatus('delivered')}
              disabled={updateStatusMutation.isPending}
            >
              Mark Delivered
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
