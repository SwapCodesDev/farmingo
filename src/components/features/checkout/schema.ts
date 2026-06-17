import { z } from 'zod';

export const baseCheckoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
});

export const checkoutSchema = z.discriminatedUnion('paymentMethod', [
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

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
