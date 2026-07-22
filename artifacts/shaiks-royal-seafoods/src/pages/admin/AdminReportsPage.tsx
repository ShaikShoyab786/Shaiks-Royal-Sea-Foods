import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { UserRole, useGetDailyReport } from '@workspace/api-client-react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, Package, PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

const COLORS = ['#D4AF37', '#10243A', '#081826', '#A8A8A8', '#FFFFFF'];

export default function AdminReportsPage() {
  useRequireAuth([UserRole.admin]);
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const { data: report, isLoading } = useGetDailyReport({ date });

  const slotData = [
    { name: 'Morning', value: report?.morningSlotOrders || 0 },
    { name: 'Afternoon', value: report?.afternoonSlotOrders || 0 },
  ];

  const paymentData = [
    { name: 'COD', value: report?.codRevenue || 0 },
    { name: 'Online', value: report?.onlineRevenue || 0 },
  ];

  return (
    <AdminLayout>
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" /> Daily Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">Financials and performance metrics.</p>
          </div>
          <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border/50">
            <span className="text-sm font-medium px-2">Report Date:</span>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="bg-background/50 border-primary/20 w-40"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Analyzing data...</div>
        ) : !report ? (
          <div className="text-center py-20 text-muted-foreground">No data available for this date.</div>
        ) : (
          <div className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-primary/20 border-t-4 border-t-primary shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-bold font-serif text-primary">₹{report.totalRevenue}</h3>
                  <div className="flex items-center gap-2 mt-4 text-xs">
                    <span className="bg-secondary/50 px-2 py-1 rounded text-muted-foreground flex gap-1 items-center">
                      <IndianRupee className="h-3 w-3" /> COD: ₹{report.codRevenue}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 border-t-4 border-t-border">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold font-serif">{report.totalOrders}</h3>
                  <div className="flex items-center gap-2 mt-4 text-xs">
                    <span className="text-green-500">{report.deliveredOrders} Delivered</span>
                    <span className="text-muted-foreground border-l border-border/50 pl-2">{report.pendingOrders} Pending</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 border-t-4 border-t-border">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Delivery Fee Collected</p>
                  <h3 className="text-3xl font-bold font-serif">₹{report.totalDeliveryCharges}</h3>
                  <p className="text-xs text-muted-foreground mt-4">100% passed to executives for fuel</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 border-t-4 border-t-destructive">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Cancellations</p>
                  <h3 className="text-3xl font-bold font-serif text-destructive">{report.cancelledOrders}</h3>
                  <p className="text-xs text-muted-foreground mt-4">Orders cancelled today</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <Card className="bg-card border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Top Products (By Revenue)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[300px]">
                  {report.topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.topProducts} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3C54" horizontal={false} />
                        <XAxis type="number" stroke="#A8A8A8" tickFormatter={(value) => `₹${value}`} />
                        <YAxis dataKey="productName" type="category" stroke="#A8A8A8" width={100} tick={{fill: '#FFFFFF', fontSize: 12}} />
                        <Tooltip 
                          cursor={{fill: '#10243A'}}
                          contentStyle={{ backgroundColor: '#081826', borderColor: '#D4AF37', color: '#FFF' }} 
                          formatter={(value) => [`₹${value}`, 'Revenue']}
                        />
                        <Bar dataKey="totalRevenue" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No sales data</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-primary" /> Order Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[300px] flex">
                  <div className="flex-1">
                    <h4 className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-2">By Time Slot</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={slotData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                          {slotData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#081826', borderColor: '#D4AF37' }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-2">By Payment</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                          {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+1) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#081826', borderColor: '#D4AF37' }} formatter={(value) => `₹${value}`} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Product KG breakdown */}
            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Volume Moved (KG)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/20 text-xs uppercase text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium text-right">Total Weight Moved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {report.topProducts.map((p, i) => (
                      <tr key={i} className="hover:bg-secondary/10">
                        <td className="px-6 py-4 font-medium">{p.productName}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono bg-secondary/50 px-3 py-1 rounded text-primary font-bold">{p.totalKg} KG</span>
                        </td>
                      </tr>
                    ))}
                    {report.topProducts.length === 0 && (
                      <tr><td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">No volume data</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
