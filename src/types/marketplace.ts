import { Timestamp } from "firebase/firestore";
import type { UserProfile } from "./user";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  uid: string;
  sellerName: string;
  sellerPhotoURL: string;
  sellerRole?: UserProfile['role'];
  rating?: number;
  reviewCount?: number;
  category: string;
  stock: number;
  unit: string;
  moq: number;
  origin: string;
  createdAt: Timestamp | Date | any;
};

export type MarketplacePost = {
  id: string;
  uid: string;
  author: string;
  authorPhotoURL: string;
  authorRole?: UserProfile['role'];
  itemName: string;
  description: string;
  price: number;
  quantity: string;
  condition: "New" | "Used" | "For Hire";
  imageUrl: string;
  contactInfo: string;
  address: string;
  createdAt: Timestamp;
  commentCount?: number;
  upvotes?: string[];
  downvotes?: string[];
  tags?: string[];
};

export type ProductReview = {
  id: string;
  uid: string;
  username: string;
  userPhotoURL: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Timestamp | Date | any;
};

