import { Timestamp } from "firebase/firestore";
import type { UserProfile } from "./user";

export type Post = {
  id: string;
  uid: string;
  author: string;
  authorPhotoURL: string;
  authorRole?: UserProfile['role'];
  title: string;
  text: string;
  communityId: string;
  createdAt: Timestamp | Date | any;
  imageUrl?: string;
  commentCount?: number;
  upvotes?: string[];
  downvotes?: string[];
  pinnedCommentId?: string;
};

export type Comment = {
  id: string;
  uid: string;
  author: string;
  authorPhotoURL: string;
  authorRole?: UserProfile['role'];
  text: string;
  createdAt: Timestamp | Date | any;
  parentId: string | null;
  upvotes?: string[];
  downvotes?: string[];
};

export type PostData = {
  title: string;
  text: string;
  communityId: string;
  imageUrl?: string;
};
