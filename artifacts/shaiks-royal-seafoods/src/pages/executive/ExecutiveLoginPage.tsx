import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSendOtp, useVerifyOtp } from '@workspace/api-client-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Truck, Navigation } from 'lucide-react';
import { useRequireNoAuth } from '@/hooks/useAuthGuard';

const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number (e.g. +919999999999)'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export default function ExecutiveLoginPage() {
  useRequireNoAuth('/executive');
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onPhoneSubmit = (values: z.infer<typeof phoneSchema>) => {
    // Usually the API checks if user exists and sends OTP.
    sendOtpMutation.mutate(
      { data: { phone: values.phone } },
      {
        onSuccess: (res) => {
          setPhoneNumber(values.phone);
          setStep('otp');
          toast.success(res.message || 'OTP sent successfully');
        },
        onError: (err: any) => toast.error(err?.error || 'Failed to send OTP'),
      }
    );
  };

  const onOtpSubmit = (values: z.infer<typeof otpSchema>) => {
    verifyOtpMutation.mutate(
      { data: { phone: phoneNumber, otp: values.otp } },
      {
        onSuccess: (res) => {
          if (res.user.role !== 'executive') {
            toast.error('Access denied. You are not registered as an executive.');
            return;
          }
          setAuth(res.token, res.user);
          toast.success('Logged in successfully');
          setLocation('/executive');
        },
        onError: (err: any) => toast.error(err?.error || 'Invalid OTP'),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/5 pointer-events-none"></div>
      
      {/* Executive branding line */}
      <div className="absolute top-0 w-full h-1 bg-green-500"></div>

      <Card className="w-full max-w-md border-primary/20 bg-card/90 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.05)] relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 mb-2">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-3xl font-bold">Field Executive Portal</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {step === 'phone' ? 'Enter registered mobile number' : 'Verify login code'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 99999 99999" className="h-12 text-lg bg-background/50 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg rounded-xl" 
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Navigation className="mr-2 h-5 w-5" />}
                  Request OTP
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="• • • • • •" 
                          className="h-14 text-center text-2xl tracking-[0.5em] bg-background/50 focus-visible:ring-primary font-mono" 
                          maxLength={6}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Login to Portal
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => setStep('phone')}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
