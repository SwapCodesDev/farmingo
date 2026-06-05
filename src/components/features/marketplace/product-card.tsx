'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import type { Product } from '@/types';
import { ShoppingCart, Star, MoreVertical, Edit, Trash2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { placeholderImages } from '@/lib/placeholder-images';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { useUser, useFirestore } from '@/firebase';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteProduct } from '@/lib/actions/marketplace';
import { EditProductDialog } from './edit-product-dialog';
import Link from 'next/link';
import { useCart } from '@/context/cart-provider';
import { formatUsername } from '@/lib/utils';
import { ProductDetailsDialog } from './product-details-dialog';


interface ProductCardProps {
  product: Product;
}

const DESCRIPTION_TRUNCATE_LENGTH = 100;

export function ProductCard({ product }: ProductCardProps) {
  const { showProfile } = useUserProfileDialog();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { addToCart } = useCart();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);


  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const findImage = (id: string) => placeholderImages.find(p => p.id === id)?.imageUrl || "https://picsum.photos/seed/product/400/300";
  const isOwner = user?.uid === product.uid;

  const handleDelete = async () => {
    if (!firestore) return;
    try {
        await deleteProduct(firestore, product.id);
        toast({ title: "Product Deleted", description: "Your product has been removed from the marketplace."});
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error deleting product', description: error.message });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qty = product.moq || 1;
    addToCart(product, qty);
    toast({
        title: "Added to Cart",
        description: `${product.name} (Qty: ${qty} ${product.unit || 'kg'}) has been added to your cart.`,
    });
  }

  const truncatedDescription = product.description.length > DESCRIPTION_TRUNCATE_LENGTH
    ? `${product.description.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`
    : product.description;

  return (
    <>
    <Card 
      onClick={() => setIsDetailsOpen(true)}
      className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={product.imageUrl || findImage(`product-${product.id}`)}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.category && (
          <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 hover:bg-background/95 backdrop-blur-sm shadow-sm font-semibold capitalize text-xs">
            {product.category}
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {product.rating !== undefined && (
            <div className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.reviewCount || 0})</span>
            </div>
            )}
            {isOwner && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsEditDialogOpen(true); }}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
                        className="text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="truncate font-headline text-lg">{product.name}</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Avatar className="h-5 w-5 cursor-pointer" onClick={(e) => { e.stopPropagation(); showProfile(product.sellerName); }}>
                <AvatarImage src={product.sellerPhotoURL} alt={product.sellerName} />
                <AvatarFallback>{getInitials(product.sellerName)}</AvatarFallback>
            </Avatar>
            <button onClick={(e) => { e.stopPropagation(); showProfile(product.sellerName); }} className="truncate hover:underline text-left">
              {formatUsername(product.sellerName, product.sellerRole)}
            </button>
        </div>
        {product.origin && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 flex-shrink-0" />
            <span className="truncate">{product.origin}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <CardDescription className="text-sm line-clamp-2">{truncatedDescription}</CardDescription>
        
        <div className="grid grid-cols-2 gap-2 text-xs border-t border-b py-2 my-1 border-muted">
          <div>
            <span className="text-muted-foreground block font-medium">Min. Order (MOQ)</span>
            <span className="font-semibold text-foreground">{product.moq || 1} {product.unit || 'kg'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Availability</span>
            {product.stock === 0 ? (
              <span className="font-semibold text-destructive">Out of Stock</span>
            ) : product.stock <= (product.moq || 1) ? (
              <span className="font-semibold text-amber-500">Low Stock ({product.stock})</span>
            ) : (
              <span className="font-semibold text-emerald-500">{product.stock} {product.unit || 'kg'}</span>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="font-bold text-2xl text-primary">₹{product.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">/ {product.unit || 'kg'}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
            <ShoppingCart className="mr-2 h-4 w-4"/>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product "{product.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isOwner && (
        <EditProductDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            product={product}
        />
      )}

      <ProductDetailsDialog
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          product={product}
      />
    </>
  );
}
