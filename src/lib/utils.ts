import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserProfile } from "@/types";
import { formatDistanceToNowStrict, format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUsername(username: string, role?: UserProfile['role']) {
  const prefix = {
    admin: 'a',
    moderator: 'm',
    farmer: 'f',
    user: 'u',
  }[role || 'user'];
  return `${prefix}/${username}`;
}

export function formatTimestamp(timestamp: any, options: {
  format?: 'short' | 'full';
  addSuffix?: boolean;
} = {}) {
  const { format: formatType = 'short', addSuffix = true } = options;

  if (!timestamp) return 'just now';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

  if (diffInSeconds < 60 && formatType === 'short') {
    return 'just now';
  }

  if (formatType === 'full') {
    return format(date, 'PPP p');
  }

  return formatDistanceToNowStrict(date, { addSuffix });
}
