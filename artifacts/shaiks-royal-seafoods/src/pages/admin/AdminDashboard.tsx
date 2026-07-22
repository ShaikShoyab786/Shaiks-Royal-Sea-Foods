import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { UserRole, useGetOrderSummary, useListOrders } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Users, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  useRequireAuth([UserRole.admin]);
  
  const { data: summary, isLoading: loadingSummary } = useGetOrderSummary();
  const { data: recentOrders, isLoading: loadingOrders } = useListOrders({ date: format(new Date(), 'yyyy-MM-dd') });

  const stats = [
    { title: "Today's Orders", value: summary?.todayOrders || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Today's Revenue", value: `₹${summary?.todayRevenue || 0}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Pending Orders", value: summary?.pendingOrders || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Total Customers", value: summary?.totalCustomers || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Overview of your royal empire.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg} border border-border/50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold font-serif">{loadingSummary ? '-' : stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Card className="xl:col-span-2 bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <CardTitle className="font-serif text-xl">Today's Orders</CardTitle>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrders ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : recentOrders?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No orders today yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/20 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="p-4 font-medium">Order ID</th>
                        <th className="p-4 font-medium">Customer</th>
                        <th className="p-4 font-medium">Slot</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentOrders?.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4">
                            <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                              #{order.id}
                            </Link>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                          </td>
                          <td className="p-4 text-sm">{order.timeslotLabel}</td>
                          <td className="p-4 font-medium text-primary">₹{order.total}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-serif text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Link href="/admin/products" className="flex items-center p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="p-2 bg-secondary rounded mr-3 group-hover:bg-primary/20"><ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary" /></div>
                <div>
                  <p className="font-medium">Manage Inventory</p>
                  <p className="text-xs text-muted-foreground">Update prices and stock</p>
                </div>
              </Link>
              <Link href="/admin/timeslots" className="flex items-center p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="p-2 bg-secondary rounded mr-3 group-hover:bg-primary/20"><Clock className="h-5 w-5 text-muted-foreground group-hover:text-primary" /></div>
                <div>
                  <p className="font-medium">Adjust Time Slots</p>
                  <p className="text-xs text-muted-foreground">Control order capacity</p>
                </div>
              </Link>
              <Link href="/admin/executives" className="flex items-center p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="p-2 bg-secondary rounded mr-3 group-hover:bg-primary/20"><Users className="h-5 w-5 text-muted-foreground group-hover:text-primary" /></div>
                <div>
                  <p className="font-medium">Field Team</p>
                  <p className="text-xs text-muted-foreground">Manage delivery executives</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
