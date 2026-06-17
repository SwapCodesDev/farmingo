import { Timestamp } from "firebase/firestore";

export type NotificationType = 'message' | 'order' | 'alert' | 'community';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Timestamp;
  link?: string;
  senderId?: string;
  senderName?: string;
};
