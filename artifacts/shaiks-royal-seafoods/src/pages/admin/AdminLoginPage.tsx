import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminLogin } from '@workspace/api-client-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useRequireNoAuth } from '@/hooks/useAuthGuard';

const adminSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminLoginPage() {
  useRequireNoAuth('/admin');
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();
  
  const loginMutation = useAdminLogin();

  const form = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (values: z.infer<typeof adminSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          toast.success('Admin access granted');
          setLocation('/admin');
        },
        onError: (err: any) => {
          toast.error(err?.error || 'Invalid credentials');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Admin strict vibe */}
      <div className="absolute top-0 w-full h-1 bg-destructive"></div>

      <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center border border-border mb-2">
            <ShieldAlert className="h-8 w-8 text-foreground opacity-80" />
          </div>
          <CardTitle className="font-serif text-3xl font-bold tracking-wider uppercase">Command Center</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Restricted Access. Authorized personnel only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" className="h-12 bg-background/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12 bg-background/50 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-12 text-lg rounded-md mt-4 bg-foreground text-background hover:bg-foreground/90" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Authenticate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
