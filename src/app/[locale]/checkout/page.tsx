
'use client';

import { useCart } from '@/context/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from '@/i18n/routing';
import { CreditCard, QrCode, Wallet, Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/actions/order';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const baseCheckoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
});

const checkoutSchema = z.discriminatedUnion('paymentMethod', [
  z.object({
    paymentMethod: z.literal('cod'),
    ...baseCheckoutSchema.shape,
  }),
  z.object({
    paymentMethod: z.literal('upi'),
    upiId: z.string().min(3, 'A valid UPI ID is required.'),
    ...baseCheckoutSchema.shape,
  }),
  z.object({
    paymentMethod: z.literal('card'),
    cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits.'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format.'),
    cvv: z.string().regex(/^\d{3}$/, 'CVV must be 3 digits.'),
    ...baseCheckoutSchema.shape,
  }),
]);

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulator States
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationMethod, setSimulationMethod] = useState<'cod' | 'card' | 'upi' | null>(null);
  const [simulationState, setSimulationState] = useState<'loading' | 'otp_entry' | 'upi_qr' | 'cod_slide' | 'success' | 'failure'>('loading');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [upiTimer, setUpiTimer] = useState(180);
  const [otpTimer, setOtpTimer] = useState(59);
  const [slideConfirmed, setSlideConfirmed] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      address1: '',
      city: '',
      state: '',
      pincode: '',
      paymentMethod: 'cod',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/cart');
    }
  }, [cart, router]);

  // Timers for simulator
  useEffect(() => {
    let interval: any;
    if (showSimulator && simulationMethod === 'upi' && simulationState === 'upi_qr') {
      interval = setInterval(() => {
        setUpiTimer((prev) => {
          if (prev <= 1) {
            setSimulationState('failure');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSimulator, simulationMethod, simulationState]);

  useEffect(() => {
    let interval: any;
    if (showSimulator && simulationMethod === 'card' && simulationState === 'otp_entry') {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setOtpError('OTP expired. Please click resend.');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSimulator, simulationMethod, simulationState]);

  async function onSubmit(data: z.infer<typeof checkoutSchema>) {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to place an order.',
        });
        return;
    }

    setFormData(data);
    setOtpValue('');
    setOtpError('');
    setUpiTimer(180);
    setOtpTimer(59);
    setSlideConfirmed(false);
    setSlideProgress(0);
    setSimulationMethod(data.paymentMethod);
    setShowSimulator(true);

    if (data.paymentMethod === 'card') {
      setSimulationState('loading');
      setTimeout(() => {
        setSimulationState('otp_entry');
      }, 1500);
    } else if (data.paymentMethod === 'upi') {
      setSimulationState('upi_qr');
    } else if (data.paymentMethod === 'cod') {
      setSimulationState('cod_slide');
    }
  }

  async function completeOrderPayment() {
    if (!user || !firestore || !formData) return;

    setIsProcessing(true);
    setSimulationState('loading');

    try {
        const { name, address1, city, state, pincode, paymentMethod } = formData;
        const shippingAddress = { name, address1, city, state, pincode };

        await createOrder(firestore, user, cart, total, shippingAddress, paymentMethod);
        
        clearCart();
        setSimulationState('success');
        setTimeout(() => {
          setShowSimulator(false);
          router.push('/order-placed');
        }, 2000);
    } catch (error: any) {
        setSimulationState('failure');
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: error.message || 'There was an issue placing your order.',
        });
    } finally {
        setIsProcessing(false);
    }
  }

  const handleVerifyOtp = () => {
    if (otpTimer === 0) {
      setOtpError('OTP has expired. Please click resend.');
      return;
    }
    if (otpValue === '000000') {
      setSimulationState('failure');
    } else if (otpValue.length === 6) {
      completeOrderPayment();
    } else {
      setOtpError('Please enter a valid 6-digit OTP code.');
    }
  };

  const handleResendOtp = () => {
    setOtpValue('');
    setOtpError('');
    setOtpTimer(59);
    setSimulationState('loading');
    setTimeout(() => {
      setSimulationState('otp_entry');
    }, 1000);
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your order by providing the details below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                    <h3 className="font-medium">Shipping Address</h3>
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Input placeholder="1234 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Maharashtra" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 400001" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                                <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="cod" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <Wallet className="mb-3 h-6 w-6" />
                                Cash on Delivery
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                                <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="upi" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <QrCode className="mb-3 h-6 w-6" />
                                UPI / QR Code
                            </FormLabel>
                          </FormItem>
                           <FormItem>
                            <FormControl>
                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <CreditCard className="mb-3 h-6 w-6" />
                                Credit / Debit Card
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {paymentMethod === 'card' && (
                    <div className="space-y-4 p-4 border rounded-md animate-in fade-in-50">
                         <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="0000 0000 0000 0000" maxLength={16} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Expiry Date</FormLabel>
                                    <FormControl>
                                        <Input placeholder="MM/YY" maxLength={5} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="cvv"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>CVV</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123" maxLength={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}
                 {paymentMethod === 'upi' && (
                     <div className="space-y-4 p-4 border rounded-md animate-in fade-in-50">
                        <FormField
                            control={form.control}
                            name="upiId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>UPI ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="yourname@bank" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="relative h-10 w-10 flex-shrink-0">
                                    <Image src={item.imageUrl} alt={item.name} fill className="rounded-md object-cover border" />
                                </div>
                                <div>
                                    <p className="font-medium truncate max-w-[120px]">{item.name}</p>
                                    <p className="text-muted-foreground">Qty: {item.quantity} {item.unit || 'kg'}</p>
                                </div>
                            </div>
                            <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">Subtotal</p>
                        <p>₹{subtotal.toFixed(2)}</p>
                    </div>
                        <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">Taxes (5%)</p>
                        <p>₹{tax.toFixed(2)}</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>₹{total.toFixed(2)}</p>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>

    <Dialog 
        open={showSimulator} 
        onOpenChange={(open) => {
          if (!open && !isProcessing && simulationState !== 'success') {
            setShowSimulator(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Secure Payment Gateway</span>
            </DialogTitle>
            <DialogDescription>
              {simulationMethod === 'card' ? '3D Secure Card Verification' :
               simulationMethod === 'upi' ? 'UPI Unified Payments Interface' :
               simulationMethod === 'cod' ? 'Cash on Delivery Confirmation' :
               'Secure checkout processing'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center text-center">
            {simulationState === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-sm font-medium text-foreground">Processing secure transaction...</p>
                <p className="text-xs text-muted-foreground">Please do not refresh this page or close the window.</p>
              </div>
            )}

            {simulationState === 'success' && (
              <div className="space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-in zoom-in" />
                <h3 className="text-lg font-bold text-emerald-500">Payment Authorized!</h3>
                <p className="text-sm text-muted-foreground">Your order is being registered in our system.</p>
              </div>
            )}

            {simulationState === 'failure' && (
              <div className="space-y-4 w-full">
                <XCircle className="h-16 w-16 text-destructive mx-auto animate-in zoom-in" />
                <h3 className="text-lg font-bold text-destructive">Transaction Declined</h3>
                <p className="text-sm text-muted-foreground">The simulated transaction could not be processed.</p>
                <div className="flex justify-center gap-4 pt-4">
                  <Button variant="outline" onClick={() => setShowSimulator(false)}>
                    Back to Checkout
                  </Button>
                  {simulationMethod === 'card' && (
                    <Button onClick={handleResendOtp}>Retry Payment</Button>
                  )}
                  {simulationMethod === 'upi' && (
                    <Button onClick={() => { setSimulationState('upi_qr'); setUpiTimer(180); }}>Retry UPI</Button>
                  )}
                </div>
              </div>
            )}

            {simulationState === 'otp_entry' && simulationMethod === 'card' && (
              <div className="space-y-6 w-full text-left">
                <div className="bg-muted p-4 rounded-md text-sm space-y-2 border border-muted-foreground/15">
                  <div className="flex justify-between font-semibold">
                    <span>Merchant:</span>
                    <span>Farmingo India</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Amount:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card Number:</span>
                    <span>XXXX XXXX XXXX {formData?.cardNumber?.slice(-4)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Enter the 6-digit OTP sent to your phone:</p>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg tracking-[0.5em] font-mono h-12"
                  />
                  {otpError && (
                    <p className="text-xs text-destructive font-medium">{otpError}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Time remaining: <span className="font-semibold text-foreground">0:{otpTimer.toString().padStart(2, '0')}</span>
                  </p>
                </div>

                <div className="bg-accent/40 border border-accent rounded-md p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Simulation Tips:</p>
                  <p>• Enter any 6 digits (e.g. 123456) to simulate a <span className="text-emerald-500 font-semibold">Successful Checkout</span>.</p>
                  <p>• Enter <span className="text-destructive font-mono font-semibold">000000</span> to simulate a <span className="text-destructive font-semibold">Failed / Declined Transaction</span>.</p>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setShowSimulator(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="w-1/2" 
                    onClick={handleVerifyOtp} 
                    disabled={otpValue.length !== 6 || otpTimer === 0}
                  >
                    Verify OTP
                  </Button>
                </div>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    className="text-xs text-primary hover:underline"
                    onClick={handleResendOtp}
                  >
                    Didn't receive the OTP? Resend Code
                  </button>
                </div>
              </div>
            )}

            {simulationState === 'upi_qr' && simulationMethod === 'upi' && (
              <div className="space-y-6 w-full">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scan QR code using Google Pay, PhonePe, or BHIM</p>
                  <p className="text-lg font-bold mt-1 text-primary">Amount: ₹{total.toFixed(2)}</p>
                </div>

                {/* SVG QR Code */}
                <div className="relative p-2 bg-white rounded-lg inline-block border shadow-inner">
                  <svg className="w-44 h-44" viewBox="0 0 100 100">
                    <rect x="10" y="10" width="25" height="25" fill="#000" />
                    <rect x="15" y="15" width="15" height="15" fill="#fff" />
                    <rect x="18" y="18" width="9" height="9" fill="#000" />
                    
                    <rect x="65" y="10" width="25" height="25" fill="#000" />
                    <rect x="70" y="15" width="15" height="15" fill="#fff" />
                    <rect x="73" y="18" width="9" height="9" fill="#000" />
                    
                    <rect x="10" y="65" width="25" height="25" fill="#000" />
                    <rect x="15" y="70" width="15" height="15" fill="#fff" />
                    <rect x="18" y="73" width="9" height="9" fill="#000" />
                    
                    <rect x="40" y="10" width="5" height="5" fill="#000" />
                    <rect x="50" y="15" width="5" height="5" fill="#000" />
                    <rect x="45" y="25" width="5" height="5" fill="#000" />
                    <rect x="55" y="20" width="5" height="5" fill="#000" />
                    <rect x="10" y="40" width="5" height="5" fill="#000" />
                    <rect x="25" y="45" width="5" height="5" fill="#000" />
                    <rect x="20" y="50" width="5" height="5" fill="#000" />
                    
                    <rect x="45" y="45" width="10" height="10" fill="#000" />
                    <rect x="65" y="40" width="5" height="5" fill="#000" />
                    <rect x="80" y="45" width="5" height="5" fill="#000" />
                    
                    <rect x="40" y="65" width="5" height="5" fill="#000" />
                    <rect x="50" y="75" width="5" height="5" fill="#000" />
                    <rect x="55" y="70" width="5" height="5" fill="#000" />
                    
                    <rect x="70" y="65" width="5" height="5" fill="#000" />
                    <rect x="75" y="80" width="5" height="5" fill="#000" />
                    <rect x="85" y="70" width="5" height="5" fill="#000" />
                    <rect x="80" y="85" width="5" height="5" fill="#000" />
                    
                    <rect x="42.5" y="42.5" width="15" height="15" fill="#fff" />
                    <circle cx="50" cy="50" r="5" fill="#15803d" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground animate-pulse flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    Awaiting payment confirmation...
                  </p>
                  <p className="text-xs font-semibold text-destructive">
                    QR expires in: {Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                  </p>
                </div>

                <div className="bg-accent/40 border border-accent rounded-md p-3 text-xs text-muted-foreground space-y-1 text-left">
                  <p className="font-semibold text-foreground">Simulation Tips:</p>
                  <p>• Click the "Simulate App Approval" button to mimic authorization inside the UPI App.</p>
                  <p>• Let the countdown run down or click Cancel to simulate checkout expiration.</p>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setShowSimulator(false)}>
                    Cancel
                  </Button>
                  <Button className="w-1/2" onClick={completeOrderPayment}>
                    Simulate App Approval
                  </Button>
                </div>
              </div>
            )}

            {simulationState === 'cod_slide' && simulationMethod === 'cod' && (
              <div className="space-y-6 w-full">
                <div className="bg-muted p-4 rounded-md text-sm space-y-2 border border-muted-foreground/15 text-left">
                  <div className="flex justify-between font-semibold">
                    <span>Payment Mode:</span>
                    <span>Cash on Delivery</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Amount to Pay:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1 border-t mt-1">
                    Pay via cash or UPI directly to the delivery executive upon package arrival.
                  </p>
                </div>

                {/* Tactile confirmation slider */}
                <div className="relative w-full h-14 bg-muted rounded-full border border-muted-foreground/20 overflow-hidden flex items-center justify-center select-none mt-6">
                  <span className="text-sm font-semibold text-muted-foreground animate-pulse px-8">
                    {slideConfirmed ? 'Confirmed!' : 'Slide to Confirm Order'}
                  </span>
                  
                  <div 
                    className="absolute left-1 top-1 bottom-1 bg-primary rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing text-primary-foreground font-bold transition-all w-12 h-12 shadow"
                    style={{ 
                      transform: `translateX(${slideProgress}px)`,
                    }}
                    onMouseDown={(e) => {
                      setIsSliding(true);
                      const startX = e.clientX;
                      const track = e.currentTarget.parentElement;
                      if (!track) return;
                      const maxSlide = track.clientWidth - 56; // 48px size + margin
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = Math.max(0, Math.min(maxSlide, moveEvent.clientX - startX));
                        setSlideProgress(deltaX);
                        if (deltaX >= maxSlide - 5) {
                          setSlideConfirmed(true);
                          setSlideProgress(maxSlide);
                          completeOrderPayment();
                          cleanup();
                        }
                      };
                      
                      const handleMouseUp = () => {
                        setIsSliding(false);
                        if (slideProgress < maxSlide - 5) {
                          setSlideProgress(0);
                        }
                        cleanup();
                      };
                      
                      const cleanup = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onTouchStart={(e) => {
                      setIsSliding(true);
                      const startX = e.touches[0].clientX;
                      const track = e.currentTarget.parentElement;
                      if (!track) return;
                      const maxSlide = track.clientWidth - 56;
                      
                      const handleTouchMove = (moveEvent: TouchEvent) => {
                        const deltaX = Math.max(0, Math.min(maxSlide, moveEvent.touches[0].clientX - startX));
                        setSlideProgress(deltaX);
                        if (deltaX >= maxSlide - 5) {
                          setSlideConfirmed(true);
                          setSlideProgress(maxSlide);
                          completeOrderPayment();
                          cleanup();
                        }
                      };
                      
                      const handleTouchEnd = () => {
                        setIsSliding(false);
                        if (slideProgress < maxSlide - 5) {
                          setSlideProgress(0);
                        }
                        cleanup();
                      };
                      
                      const cleanup = () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      document.addEventListener('touchmove', handleTouchMove);
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  >
                    →
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button variant="outline" className="w-full" onClick={() => setShowSimulator(false)}>
                    Cancel and Change Payment Method
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
