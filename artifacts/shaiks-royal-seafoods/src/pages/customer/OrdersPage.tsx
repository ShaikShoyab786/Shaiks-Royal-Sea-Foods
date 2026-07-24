import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useListOrders, useCancelOrder } from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PackageOpen, MapPin, Calendar, Clock, ChevronRight, XCircle, Lock, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found better price',
  'Delivery taking too long',
  'Need different product',
  'Other',
];

// Slot start hours: id 1 = morning (7am), id 2 = afternoon (3pm)
const SLOT_START_HOURS: Record<number, number> = { 1: 7, 2: 15 };

function canCancelOrder(order: { deliveryDate: string; timeslotId: number }): boolean {
  const startHour = SLOT_START_HOURS[order.timeslotId] ?? 7;
  const slotStart = new Date(`${order.deliveryDate}T${String(startHour).padStart(2, '0')}:00:00`);
  return new Date() < slotStart;
}

export default function OrdersPage() {
  useRequireAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListOrders();
  const cancelOrderMutation = useCancelOrder();

  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: number | null; paymentMethod?: string }>({
    open: false, orderId: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const openCancelDialog = (e: React.MouseEvent, orderId: number, paymentMethod?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCancelReason('');
    setOtherReason('');
    setCancelDialog({ open: true, orderId, paymentMethod });
  };

  const handleConfirmCancel = () => {
    if (!cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }
    if (cancelReason === 'Other' && !otherReason.trim()) {
      toast.error('Please describe your reason');
      return;
    }
    cancelOrderMutation.mutate(
      { id: cancelDialog.orderId! },
      {
        onSuccess: () => {
          toast.success('Order cancelled successfully');
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
          setCancelDialog({ open: false, orderId: null });
        },
        onError: () => toast.error('Failed to cancel order. Please try again.'),
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':          return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'confirmed':        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'assigned':         return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30';
      case 'out_for_delivery': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'delivered':        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'cancelled':        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:                 return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) =>
    status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
            {orders?.map((order) => {
              const cancellable = canCancelOrder({ deliveryDate: order.deliveryDate, timeslotId: order.timeslotId });
              const isCancelled = order.status === 'cancelled' || order.status === 'delivered';

              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                  <Card className="bg-card border-primary/10 hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
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
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              {order.deliveryAddress}
                            </p>
                          </div>

                          {/* Cancel button */}
                          {!isCancelled && (
                            <div className="mt-5 pt-4 border-t border-border/40">
                              {cancellable ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60 transition-all duration-200 gap-2"
                                  onClick={(e) => openCancelDialog(e, order.id, order.paymentMethod)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Cancel Order
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                                  <span className="italic">Cancellation unavailable — preparation has begun</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Schedule */}
                        <div className="p-6 md:w-60 flex flex-col justify-between bg-secondary/10">
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
                            View details <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, orderId: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              Cancel Order
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please let us know why you're cancelling. This helps us improve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for cancellation</label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {CANCEL_REASONS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cancelReason === 'Other' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Please describe</label>
                <Textarea
                  value={otherReason}
                  onChange={e => setOtherReason(e.target.value)}
                  placeholder="Tell us more…"
                  rows={3}
                  className="resize-none bg-secondary/20"
                />
              </div>
            )}

            {/* Refund note — shown if payment was online */}
            {cancelDialog.paymentMethod === 'online' && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If your payment has already been processed, the refunded amount will be credited back to your original payment method <span className="font-medium text-foreground">within 24 hours</span>.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, orderId: null })}
              className="flex-1"
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelOrderMutation.isPending || !cancelReason || (cancelReason === 'Other' && !otherReason.trim())}
              className="flex-1"
            >
              {cancelOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
