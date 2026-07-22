import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { 
  UserRole, 
  useListExecutives, 
  useCreateExecutive,
  useDeleteExecutive
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, MapPin, IndianRupee, Phone, ShieldCheck, Truck } from 'lucide-react';

const executiveSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number'),
});

export default function AdminExecutivesPage() {
  useRequireAuth([UserRole.admin]);
  const queryClient = useQueryClient();
  const { data: executives, isLoading } = useListExecutives();
  const createExecutive = useCreateExecutive();
  const deleteExecutive = useDeleteExecutive();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof executiveSchema>>({
    resolver: zodResolver(executiveSchema),
    defaultValues: { name: '', phone: '' }
  });

  const onSubmit = (values: z.infer<typeof executiveSchema>) => {
    createExecutive.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success('Executive onboarded');
          queryClient.invalidateQueries({ queryKey: ['/api/executives'] });
          setIsDialogOpen(false);
          form.reset();
        },
        onError: (err: any) => toast.error(err.error || 'Failed to create')
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Remove this executive? They will lose access.')) {
      deleteExecutive.mutate(
        { id },
        {
          onSuccess: () => {
            toast.success('Executive removed');
            queryClient.invalidateQueries({ queryKey: ['/api/executives'] });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="font-serif text-3xl font-bold">Field Team</h1>
            <p className="text-muted-foreground mt-1">Manage delivery executives and their performance.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Onboard Executive
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-border bg-card">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">New Executive</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number (Used for login)</FormLabel><FormControl><Input placeholder="+91 99999 99999" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 text-sm text-muted-foreground flex gap-3 mt-4">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <p>The executive will log in using this phone number and an OTP. No password required.</p>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createExecutive.isPending}>
                    Register Executive
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 custom-scrollbar">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-muted-foreground">Loading team data...</div>
          ) : (
            executives?.map(ex => (
              <Card key={ex.id} className="bg-card border-border/50 overflow-hidden relative group">
                <div className="absolute top-0 w-full h-1 bg-primary/40"></div>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center border border-border">
                        <span className="font-serif text-xl font-bold text-primary">{ex.name.charAt(0)}</span>
                      </div>
                      <div>
                        <CardTitle className="font-serif text-xl">{ex.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" /> {ex.phone}
                        </p>
                      </div>
                    </div>
                    <Badge variant={ex.isActive ? 'outline' : 'secondary'} className={ex.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}>
                      {ex.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/50">
                    <div className="text-center space-y-1">
                      <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xl font-bold text-foreground">{ex.todayDeliveries}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trips Today</p>
                    </div>
                    <div className="text-center space-y-1 border-x border-border/50">
                      <IndianRupee className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xl font-bold text-primary">₹{ex.todayCashCollected}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">COD Collected</p>
                    </div>
                    <div className="text-center space-y-1">
                      {/* Motorbike lucide icon is replaced by Truck since Motorbike doesn't exist */}
                      <Truck className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xl font-bold text-green-500">₹{ex.todayFuelEarned}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fuel Earned</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(ex.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-2" /> Revoke Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
