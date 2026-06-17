'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/routing';
import { useUser, useFirestore } from '@/firebase';
import { useCart } from '@/context/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/actions/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkoutSchema, type CheckoutFormValues } from '@/components/features/checkout/schema';
import ShippingForm from '@/components/features/checkout/shipping-form';
import PaymentSelector from '@/components/features/checkout/payment-selector';
import OrderSummary from '@/components/features/checkout/order-summary';
import SimulatorDialog from '@/components/features/checkout/simulator-dialog';
import { Link } from '@/i18n/routing';
import { CheckCircle2 } from 'lucide-react';

const steps = ['Shipping', 'Payment', 'Review', 'Success'] as const;

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormValues>({
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

  useEffect(() => {
    if (cart.length === 0 && currentStep !== 3) {
      router.replace('/cart');
    }
  }, [cart, currentStep, router]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal * 1.05;
  const values = form.getValues();

  const handleNext = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger(['name', 'address1', 'city', 'state', 'pincode']);
      if (isValid) setCurrentStep(1);
    } else if (currentStep === 1) {
      const method = form.getValues('paymentMethod');
      const fields = method === 'card' ? ['paymentMethod', 'cardNumber', 'expiryDate', 'cvv'] : method === 'upi' ? ['paymentMethod', 'upiId'] : ['paymentMethod'];
      const isValid = await form.trigger(fields as any);
      if (isValid) setCurrentStep(2);
    }
  };

  const handleOrderCreation = async () => {
    if (!user || !firestore) throw new Error('Auth or DB not available');
    setIsProcessing(true);
    try {
      const { name, address1, city, state, pincode, paymentMethod } = values;
      await createOrder(firestore, user, cart, total, { name, address1, city, state, pincode }, paymentMethod);
      clearCart();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.message || 'There was an issue placing your order.',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && currentStep !== 3) return null;

  return (
    <FormProvider {...form}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center max-w-xl mx-auto">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2 ${
                  currentStep === index ? 'bg-primary border-primary text-primary-foreground' :
                  currentStep > index ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-muted text-muted-foreground'
                }`}>
                  {currentStep > index ? '✓' : index + 1}
                </div>
                <span className="text-xs mt-1 font-medium hidden sm:inline">{label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-[2px] flex-1 mx-2 ${currentStep > index ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 3 ? (
          <Card className="max-w-md mx-auto text-center shadow-xl border-primary/20 p-6 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-3xl font-headline font-bold">Order Confirmed!</h2>
            <p className="text-muted-foreground text-sm">Thank you for shopping with Farmingo. Your fresh produce will be delivered soon.</p>
            <Button asChild className="w-full mt-4"><Link href="/marketplace">Continue Shopping</Link></Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>{steps[currentStep]}</CardTitle></CardHeader>
                <CardContent>
                  {currentStep === 0 && <ShippingForm />}
                  {currentStep === 1 && <PaymentSelector />}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4 space-y-2 bg-muted/40">
                        <h4 className="font-bold text-sm">Shipping Address</h4>
                        <p className="text-sm">{values.name}</p>
                        <p className="text-sm text-muted-foreground">{values.address1}, {values.city}, {values.state} - {values.pincode}</p>
                      </div>
                      <div className="border rounded-lg p-4 space-y-2 bg-muted/40">
                        <h4 className="font-bold text-sm">Payment Details</h4>
                        <p className="text-sm capitalize">{values.paymentMethod === 'cod' ? 'Cash on Delivery' : values.paymentMethod === 'upi' ? `UPI ID: ${values.upiId}` : `Card Ending in ${values.cardNumber?.slice(-4)}`}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between mt-8">
                    {currentStep > 0 && <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>Back</Button>}
                    {currentStep < 2 ? (
                      <Button type="button" onClick={handleNext} className="ml-auto">Next</Button>
                    ) : (
                      <Button type="button" onClick={() => setShowSimulator(true)} disabled={isProcessing} className="ml-auto">Confirm and Pay</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                <CardContent><OrderSummary /></CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <SimulatorDialog
        open={showSimulator}
        onOpenChange={setShowSimulator}
        paymentMethod={values.paymentMethod || null}
        total={total}
        formData={values}
        onCompletePayment={handleOrderCreation}
        onSuccessStep={() => setCurrentStep(3)}
      />
    </FormProvider>
  );
}
