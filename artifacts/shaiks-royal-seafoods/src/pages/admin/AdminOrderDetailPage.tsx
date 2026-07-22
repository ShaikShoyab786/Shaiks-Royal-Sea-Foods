import React, { useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useParams, Link } from 'wouter';
import { 
  UserRole, 
  useGetOrder, 
  useUpdateOrderStatus, 
  useAssignOrder, 
  useListExecutives,
  OrderStatusUpdateStatus
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, MapPin, Truck, Calendar, Clock, CreditCard, Box } from 'lucide-react';

export default function AdminOrderDetailPage() {
  useRequireAuth([UserRole.admin]);
  const { id } = useParams();
  const orderId = Number(id);
  const queryClient = useQueryClient();
  
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ['getOrder', orderId] }
  });
  
  const { data: executives } = useListExecutives();
  const updateStatusMutation = useUpdateOrderStatus();
  const assignMutation = useAssignOrder();

  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate(
      { id: orderId, data: { status: newStatus as OrderStatusUpdateStatus } },
      {
        onSuccess: (updated) => {
          toast.success(`Order marked as ${newStatus.replace('_', ' ')}`);
          queryClient.setQueryData(['getOrder', orderId], updated);
        },
        onError: (err: any) => toast.error(err.error || 'Failed to update status')
      }
    );
  };

  const handleAssignExecutive = (executiveId: string) => {
    assignMutation.mutate(
      { id: orderId, data: { executiveId: Number(executiveId) } },
      {
        onSuccess: (updated) => {
          toast.success('Executive assigned successfully');
          queryClient.setQueryData(['getOrder', orderId], updated);
        },
        onError: (err: any) => toast.error(err.error || 'Failed to assign executive')
      }
    );
  };

  if (isLoading || !order) {
    return <AdminLayout><div className="p-8 text-muted-foreground">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-8 flex-1 overflow-y-auto">
        <Link href="/admin/orders" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-4">
              Order #{order.id}
              <Badge variant="outline" className="uppercase text-xs tracking-wider bg-primary/10 text-primary border-primary/20">
                {order.status.replace(/_/g, ' ')}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">Placed {format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a')}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Update Status:</span>
            <Select value={order.status} onValueChange={handleStatusUpdate}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Customer & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                    <p className="font-bold text-lg">{order.customerName}</p>
                    <p className="text-muted-foreground">{order.customerPhone}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Schedule</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{format(new Date(order.deliveryDate), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{order.timeslotLabel}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-border/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Address ({order.distanceKm} km)
                    </p>
                    <p className="bg-secondary/20 p-4 rounded-lg border border-border/50 leading-relaxed">
                      {order.deliveryAddress}
                    </p>
                    {order.notes && (
                      <p className="mt-3 text-sm italic text-muted-foreground bg-yellow-500/5 p-3 rounded border border-yellow-500/10">
                        <span className="font-bold not-italic">Note:</span> {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" /> Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/20 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium">Qty</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 font-bold">{item.productName}</td>
                        <td className="px-6 py-4 text-muted-foreground">₹{item.pricePerKg}</td>
                        <td className="px-6 py-4"><span className="bg-secondary/50 px-2 py-1 rounded font-mono">{item.weightKg}</span></td>
                        <td className="px-6 py-4 text-right font-bold text-primary">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            
            <Card className="bg-card border-primary/20">
              <CardHeader className="border-b border-border/50 bg-primary/5 pb-4">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" /> Field Executive
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {order.executiveId ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-3">
                      <Truck className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg">{order.executiveName}</h4>
                    <p className="text-sm text-muted-foreground mb-4">Currently assigned</p>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Assigned successfully
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Assign an executive for delivery to notify them on their app.</p>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Select Executive</label>
                      <Select onValueChange={handleAssignExecutive}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Choose someone..." />
                        </SelectTrigger>
                        <SelectContent>
                          {executives?.filter(e => e.isActive).map(ex => (
                            <SelectItem key={ex.id} value={ex.id.toString()}>{ex.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}>
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-serif font-bold text-lg">Total</span>
                  <span className="font-serif font-bold text-2xl text-primary">₹{order.total}</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
