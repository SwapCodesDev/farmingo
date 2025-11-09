import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserProfile } from "@/types";

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
