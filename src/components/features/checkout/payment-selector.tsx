'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { CreditCard, QrCode, Wallet } from 'lucide-react';

export default function PaymentSelector() {
  const { control, watch } = useFormContext();
  const paymentMethod = watch('paymentMethod');

  return (
    <div className="space-y-6">
      <FormField
        control={control}
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
                  <FormLabel
                    htmlFor="cod"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <Wallet className="mb-3 h-6 w-6" />
                    Cash on Delivery
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                  </FormControl>
                  <FormLabel
                    htmlFor="upi"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <QrCode className="mb-3 h-6 w-6" />
                    UPI / QR Code
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                  </FormControl>
                  <FormLabel
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
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
            control={control}
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
              control={control}
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
              control={control}
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
            control={control}
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
    </div>
  );
}
