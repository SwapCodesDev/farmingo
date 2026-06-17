'use client';

import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-provider';

export default function OrderSummary() {
  const { cart } = useCart();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="rounded-md object-cover border"
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate max-w-[150px]">{item.name}</p>
                <p className="text-muted-foreground text-xs">
                  Qty: {item.quantity} {item.unit || 'kg'}
                </p>
              </div>
            </div>
            <p className="flex-shrink-0 font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <Separator />
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
        <div className="flex justify-between font-bold text-lg text-primary">
          <p>Total</p>
          <p>₹{total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
