import { Timestamp } from "firebase/firestore";

export type UserProfile = {
    id: string;
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL?: string;
    createdAt: Timestamp;
    role: 'admin' | 'moderator' | 'farmer' | 'user';
    region: string;
    isVerified: boolean;
}
