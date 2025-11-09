import { ProfileClient } from '@/components/features/profile-client';
import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Public Profile
        </h1>
        <p className="text-muted-foreground">
          This is how other users see your profile.
        </p>
      </div>
      <Suspense fallback={<p>Loading profile...</p>}>
        <ProfileClient />
      </Suspense>
    </div>
  );
}
