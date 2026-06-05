'use client';
import type { Product } from '@/types';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type CartItem = Product & { quantity: number };

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = window.localStorage.getItem('cart');
            if (item) {
                setCart(JSON.parse(item));
            }
        }
    } catch (error) {
        console.error("Failed to load cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const stockLimit = typeof product.stock === 'number' ? product.stock : 999;
      const minOrder = typeof product.moq === 'number' ? product.moq : 1;

      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, stockLimit);
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const initialQty = Math.min(Math.max(minOrder, quantity), stockLimit);
      return [...prevCart, { ...product, quantity: initialQty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.id === productId) {
            const stockLimit = typeof item.stock === 'number' ? item.stock : 999;
            const minOrder = typeof item.moq === 'number' ? item.moq : 1;
            const clampedQty = Math.min(Math.max(minOrder, quantity), stockLimit);
            return { ...item, quantity: clampedQty };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };


  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
