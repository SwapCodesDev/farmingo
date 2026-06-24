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
  format?: 'short' | 'full' | 'date';
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

  if (formatType === 'date') {
    return format(date, 'PPP');
  }

  return formatDistanceToNowStrict(date, { addSuffix });
}

export function getApiEndpoint(
  envUrlVar: string | undefined,
  baseVar: string | undefined,
  fallbackBase: string,
  path: string
): string {
  if (!envUrlVar || envUrlVar.includes('$')) {
    const base = baseVar || fallbackBase;
    return `${base}${path}`;
  }
  return envUrlVar;
}

export function generateHashId(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash1 = 5381;
  let hash2 = 8904;
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = ((hash2 << 7) + hash2) ^ char;
  }
  
  let result = '';
  let val1 = Math.abs(hash1);
  let val2 = Math.abs(hash2);
  
  for (let i = 0; i < 4; i++) {
    result += chars[val1 % 62];
    val1 = Math.floor(val1 / 62);
    
    result += chars[val2 % 62];
    val2 = Math.floor(val2 / 62);
  }
  
  return result;
}


