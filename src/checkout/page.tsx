'use client';

import { useCart } from '@/context/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useForm, Controller } from 'react-hook-form';
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
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, QrCode, Wallet, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/firebase/actions/order';
import { useState, useEffect } from 'react';

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
    // If the cart is empty and we are on the client, redirect to the cart page.
    // This prevents rendering the checkout page when there's nothing to check out.
    if (cart.length === 0) {
      router.replace('/cart');
    }
  }, [cart, router]);

  async function onSubmit(data: z.infer<typeof checkoutSchema>) {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to place an order.',
        });
        return;
    }
    setIsProcessing(true);
    try {
        const { name, address1, city, state, pincode, paymentMethod } = data;
        const shippingAddress = { name, address1, city, state, pincode };

        await createOrder(firestore, user, cart, total, shippingAddress, paymentMethod);
        
        clearCart();
        router.push('/order-placed');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: error.message || 'There was an issue placing your order.',
        });
    } finally {
        setIsProcessing(false);
    }
  }

  // If the cart is empty, render nothing or a loading state until the redirect happens.
  if (cart.length === 0) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your order by providing the details below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
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
                            <FormLabel htmlFor="cod" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary">
                                <Wallet className="mb-3 h-6 w-6" />
                                Cash on Delivery
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                                <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="upi" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary">
                                <QrCode className="mb-3 h-6 w-6" />
                                UPI / QR Code
                            </FormLabel>
                          </FormItem>
                           <FormItem>
                            <FormControl>
                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary">
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
                                    <Input placeholder="0000 0000 0000 0000" {...field} />
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
                                        <Input placeholder="MM/YY" {...field} />
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
                                        <Input placeholder="123" {...field} />
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
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover border" />
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
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
  );
}
