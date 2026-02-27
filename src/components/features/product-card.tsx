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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Product } from './marketplace-client';
import { ShoppingCart, Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
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

  const handleAddToCart = () => {
    addToCart(product);
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
    });
  }

  const truncatedDescription = product.description.length > DESCRIPTION_TRUNCATE_LENGTH
    ? `${product.description.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`
    : product.description;

  return (
    <>
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square w-full">
        <Image
          src={product.imageUrl || findImage(`product-${product.id}`)}
          alt={product.name}
          fill
          className="object-cover"
        />
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
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
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
            <Avatar className="h-5 w-5 cursor-pointer" onClick={() => showProfile(product.sellerName)}>
                <AvatarImage src={product.sellerPhotoURL} alt={product.sellerName} />
                <AvatarFallback>{getInitials(product.sellerName)}</AvatarFallback>
            </Avatar>
            <button onClick={() => showProfile(product.sellerName)} className="truncate hover:underline">
              {formatUsername(product.sellerName, product.sellerRole)}
            </button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <CardDescription className="text-sm">{truncatedDescription}</CardDescription>
        <p className="font-bold text-2xl text-primary pt-2">
          ₹{product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 p-4 mt-auto">
        <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4"/>
            Add to Cart
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
    </>
  );
}
