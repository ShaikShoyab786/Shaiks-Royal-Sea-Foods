import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { UserRole, useListOrders, OrderStatus } from '@workspace/api-client-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOrdersPage() {
  useRequireAuth([UserRole.admin]);
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: orders, isLoading } = useListOrders({
    date: dateFilter,
    status: statusFilter === 'all' ? undefined : statusFilter as any,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'assigned': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'out_for_delivery': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="font-serif text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage all deliveries.</p>
          </div>
        </div>

        <Card className="bg-card border-border/50 mb-6 shrink-0">
          <CardContent className="p-4 flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
                <Filter className="h-3 w-3" /> Filter by Date
              </label>
              <Input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)} 
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(OrderStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={() => {
              setDateFilter(format(new Date(), 'yyyy-MM-dd'));
              setStatusFilter('all');
            }}>Reset</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-secondary/80 backdrop-blur z-10 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Slot & Time</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : orders?.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No orders found for selected filters.</td></tr>
                ) : (
                  orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{order.timeslotLabel}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.deliveryDate), 'MMM dd, yyyy')}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">₹{order.total}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`${getStatusColor(order.status)} uppercase text-[10px] tracking-wider px-2 py-0.5`}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
