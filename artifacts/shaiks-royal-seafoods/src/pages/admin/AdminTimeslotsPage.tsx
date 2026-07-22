import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { 
  UserRole, 
  useListTimeslots, 
  useUpdateTimeslot 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Users, ArrowRightCircle } from 'lucide-react';

export default function AdminTimeslotsPage() {
  useRequireAuth([UserRole.admin]);
  const queryClient = useQueryClient();
  const { data: timeslots, isLoading } = useListTimeslots();
  const updateTimeslot = useUpdateTimeslot();

  const handleToggle = (id: number, current: boolean) => {
    updateTimeslot.mutate(
      { id, data: { isActive: !current } },
      {
        onSuccess: () => {
          toast.success(!current ? 'Slot Opened' : 'Slot Closed');
          queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
        }
      }
    );
  };

  const handleMaxOrdersChange = (id: number, value: string) => {
    const max = parseInt(value);
    if (isNaN(max) || max < 0) return;
    
    updateTimeslot.mutate(
      { id, data: { maxOrders: max } },
      {
        onSuccess: () => {
          toast.success('Capacity updated');
          queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 flex-1">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold">Delivery Time Slots</h1>
            <p className="text-muted-foreground mt-1">Control order capacity and availability for delivery windows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              timeslots?.map(slot => (
                <Card key={slot.id} className={`bg-card border-border/50 overflow-hidden ${!slot.isActive ? 'opacity-80 grayscale-[20%]' : 'border-primary/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'}`}>
                  <CardHeader className={`border-b border-border/50 ${slot.isActive ? 'bg-primary/5' : 'bg-secondary/10'}`}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-serif text-2xl flex items-center gap-2">
                        <Clock className="h-6 w-6 text-primary" /> {slot.label}
                      </CardTitle>
                      <Switch 
                        checked={slot.isActive} 
                        onCheckedChange={() => handleToggle(slot.id, slot.isActive)} 
                      />
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">Delivery window: {slot.startHour}:00 - {slot.endHour}:00</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-lg">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Today's Utilization</p>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold font-mono text-foreground">{slot.currentOrders}</span>
                            <span className="text-muted-foreground mb-1">/ {slot.maxOrders}</span>
                          </div>
                        </div>
                        <div className="h-12 w-12 rounded-full border-4 border-border flex items-center justify-center relative">
                          {/* Circular progress approx */}
                          <div 
                            className="absolute inset-0 rounded-full border-4 border-primary transition-all"
                            style={{ 
                              clipPath: `polygon(0 0, 100% 0, 100% ${Math.min(100, (slot.currentOrders/slot.maxOrders)*100)}%, 0 100%)`, 
                              transform: 'rotate(-90deg)' 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" /> Maximum Capacity
                        </label>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            defaultValue={slot.maxOrders} 
                            className="w-24 text-center font-mono bg-background/50 border-primary/20"
                            onBlur={(e) => handleMaxOrdersChange(slot.id, e.target.value)}
                          />
                          <span className="text-sm text-muted-foreground">Orders per slot</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Once capacity is reached, the slot automatically closes for new orders.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
