import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500">
      {/* Hero Header Section Skeleton */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-muted/20 border border-muted/50 p-5 sm:p-8 md:p-10 shadow-xs">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
            {/* Weather Widget Placeholder */}
            <Skeleton className="h-10 w-48 rounded-xl" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <Skeleton className="h-12 w-64 md:w-96 rounded-lg" />
            <Skeleton className="h-5 w-full max-w-xl rounded-md" />
          </div>
        </div>
      </div>

      {/* Quick Stats Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl sm:rounded-2xl border border-muted/50 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl shrink-0" />
              <div className="space-y-2 flex-1 w-full">
                <Skeleton className="h-3 w-12 sm:w-16 rounded-md" />
                <Skeleton className="h-3 sm:h-4 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 sm:overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 sm:h-10 w-28 sm:w-32 rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* Live Data Feed Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-28 bg-muted/30 rounded-2xl" />
            ))}
          </div>
        ))}
      </div>

      {/* AI Insights Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-44 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Main featured tools (longer cards) */}
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="lg:col-span-6 border-muted/50 flex flex-col justify-between overflow-hidden rounded-3xl">
              <div className="h-1 bg-muted/30 w-full" />
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </CardContent>
              <CardFooter className="border-t bg-muted/5 py-3.5">
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardFooter>
            </Card>
          ))}

          {/* Smaller secondary tools */}
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="lg:col-span-4 border-muted/50 flex flex-col justify-between overflow-hidden rounded-3xl">
              <div className="h-1 bg-muted/30 w-full" />
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-32 rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
              </CardContent>
              <CardFooter className="border-t bg-muted/5 py-3.5">
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      {/* Search and filtering bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <Skeleton className="h-10 w-full sm:max-w-md rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Tabs list skeleton */}
      <div className="border-b border-muted/50 pb-1 flex gap-6">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Marketplace grid of items skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-muted/50 flex flex-col h-full rounded-2xl">
            {/* Image Placeholder */}
            <Skeleton className="aspect-video w-full" />
            
            <CardHeader className="p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md" />
            </CardHeader>
            
            <CardContent className="px-4 pb-4 flex-grow space-y-3">
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t border-muted/20">
              <Skeleton className="h-9 w-full rounded-lg mt-3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-in fade-in duration-500">
      {/* Main Content Area: Posts list skeleton */}
      <div className="lg:col-span-8 space-y-6">
        {/* Sorting header skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-muted/40">
          <Skeleton className="h-9 w-44 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        {/* Post cards skeletons */}
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-muted/50 rounded-2xl overflow-hidden">
            <div className="p-5 flex gap-4">
              {/* Vote controls skeleton */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 bg-muted/10 p-2 rounded-xl h-fit">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-6 rounded-md" />
                <Skeleton className="h-5 w-5 rounded-md" />
              </div>

              {/* Post content skeleton */}
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-11/12 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
                {/* Media placeholder (sometimes posts have images) */}
                {i % 2 === 0 && <Skeleton className="h-48 w-full rounded-xl" />}
                
                {/* Footer buttons skeleton */}
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sidebar Area: Community list skeleton */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-muted/50 rounded-2xl">
          <CardHeader className="pb-3 border-b border-muted/30">
            <Skeleton className="h-6 w-44 rounded-md" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-7 w-16 rounded-full shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info card skeleton */}
        <Card className="border-muted/50 rounded-2xl p-5 space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-4/5 rounded-sm" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </Card>
      </div>
    </div>
  );
}

export function PostListSkeleton() {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-muted/50 rounded-2xl overflow-hidden">
          <div className="p-5 flex gap-4">
            <div className="flex flex-col items-center gap-1.5 shrink-0 bg-muted/10 p-2 rounded-xl h-fit">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 w-6 rounded-md" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
            <div className="space-y-4 flex-grow">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-11/12 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 w-full animate-in fade-in duration-500">
      {/* Banner & Profile Details */}
      <Card className="overflow-hidden border-none shadow-md bg-card">
        {/* Banner placeholder */}
        <Skeleton className="h-56 w-full rounded-t-2xl" />

        {/* Profile Card Header overlay */}
        <CardHeader className="relative flex flex-col sm:flex-row items-center sm:items-end justify-between px-6 pb-6 pt-0 gap-4 border-b">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <Skeleton className="-mt-16 h-32 w-32 rounded-full border-4 border-card shadow-lg shrink-0" />
            <div className="mb-2 space-y-2">
              <Skeleton className="h-8 w-48 rounded-md mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-32 rounded-md mx-auto sm:mx-0" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 p-6 bg-muted/20 text-center">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-card/65 border shadow-sm gap-2"
            >
              <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
              <Skeleton className="h-6 w-12 rounded-md animate-pulse" />
              <Skeleton className="h-3 w-16 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs list */}
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <PostListSkeleton />
      </div>
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] w-full animate-in fade-in duration-500">
      {/* Sidebar Skeleton */}
      <div className="col-span-12 lg:col-span-4 h-full">
        <MessagesSidebarSkeleton />
      </div>
      {/* Chat Pane Skeleton */}
      <div className="hidden lg:block lg:col-span-8 h-full">
        <ConversationSkeleton />
      </div>
    </div>
  );
}

export function MessagesSidebarSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col border-muted/50">
      <div className="p-4 border-b space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="flex-1 overflow-hidden">
        <MessagesSidebarListSkeleton />
      </div>
    </Card>
  );
}

export function MessagesSidebarListSkeleton() {
  return (
    <div className="p-4 space-y-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </div>
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <Card className="h-full flex flex-col border-muted/50">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-md" />
      </div>
      {/* Chat Messages */}
      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        {[...Array(4)].map((_, i) => {
          const isRight = i % 2 === 0;
          return (
            <div key={i} className={`flex items-end gap-3 ${isRight ? "flex-row-reverse" : ""}`}>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className={`h-12 w-48 rounded-lg ${isRight ? "bg-primary/25" : "bg-muted"}`} />
                <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                  <Skeleton className="h-3 w-10 rounded-sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer Input */}
      <div className="p-4 border-t flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      </div>
    </Card>
  );
}

export function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-7 w-32 rounded-md mb-2" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="h-px bg-muted" />
      <Card className="border-muted/50">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="w-full max-w-xl h-40 rounded-lg" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
        </CardFooter>
      </Card>
    </div>
  );
}

export function PrivacySettingsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-7 w-32 rounded-md mb-2" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="h-px bg-muted" />
      <Card className="border-muted/50">
        <CardContent className="pt-6 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-4 w-full max-w-sm rounded-sm" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
        </CardFooter>
      </Card>
    </div>
  );
}

export function OrdersSettingsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-7 w-32 rounded-md mb-2" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="h-px bg-muted" />
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-muted/50">
            <CardHeader className="flex flex-row justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-sm" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-md ml-auto" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md shrink-0" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Skeleton className="h-9 w-24 rounded-lg" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function OrderTrackingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 w-full animate-in fade-in duration-500">
      <Skeleton className="h-5 w-32 rounded-md mb-2" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-14 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 border-muted/50">
          <CardHeader className="bg-muted/40 pb-4">
            <Skeleton className="h-5 w-32 rounded-md" />
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto px-4">
              <div className="absolute left-8 right-8 top-1/2 h-1 bg-muted -translate-y-1/2 z-0" />
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="relative flex flex-col items-center z-10 gap-3">
                  <Skeleton className="w-12 h-12 rounded-full border-2" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-muted/50">
            <CardHeader>
              <Skeleton className="h-5 w-32 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-md shrink-0" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <div className="h-px bg-muted" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-4 w-48 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-6 w-32 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/50">
            <CardHeader>
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </CardHeader>
            <CardContent className="pb-8">
              <div className="relative border-l-2 border-muted pl-6 ml-4 space-y-6 pt-2">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="relative space-y-2">
                    <div className="absolute -left-[22px] top-1.5 w-4 h-4 rounded-full border-4 border-background bg-muted" />
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-4 w-64 rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-muted/50">
            <CardHeader>
              <Skeleton className="h-5 w-28 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CropRecommendationSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <Skeleton className="h-5 w-32 rounded-md mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-5 w-96 rounded-md" />
      </div>
      <Card className="border-muted/50">
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-md mb-2" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export function DiseaseDiagnosisSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <Skeleton className="h-5 w-32 rounded-md mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-5 w-96 rounded-md" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-muted/50">
          <CardHeader>
            <Skeleton className="h-6 w-40 rounded-md mb-2" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center bg-muted/50 border-dashed border-2">
          <CardContent className="text-center p-6 space-y-3 w-full">
            <Skeleton className="mx-auto h-12 w-12 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-md mx-auto" />
            <Skeleton className="h-4 w-48 rounded-md mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PricePredictionSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <Skeleton className="h-5 w-32 rounded-md mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-5 w-96 rounded-md" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit border-muted/50">
          <CardHeader>
            <Skeleton className="h-6 w-40 rounded-md mb-2" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed border-2 py-20">
            <CardContent className="text-center space-y-3 w-full">
              <Skeleton className="mx-auto h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-md mx-auto" />
              <Skeleton className="h-4 w-64 rounded-md mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function WeatherPredictionSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <Skeleton className="h-5 w-32 rounded-md mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-5 w-96 rounded-md" />
      </div>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-md mb-2" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-11 w-56 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export function DemandSupplySkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <Skeleton className="h-5 w-32 rounded-md mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-5 w-96 rounded-md" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit border-muted/50">
          <CardHeader>
            <Skeleton className="h-6 w-40 rounded-md mb-2" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed border-2 py-20">
            <CardContent className="text-center space-y-3 w-full">
              <Skeleton className="mx-auto h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-md mx-auto" />
              <Skeleton className="h-4 w-64 rounded-md mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CropRecommendationResultsSkeleton() {
  return (
    <Card className="animate-pulse w-full border-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-64 rounded-md" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-96 rounded-sm" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 rounded-lg bg-muted/20 flex flex-col items-center justify-center gap-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
        <div className="h-px bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiseaseDiagnosisResultsSkeleton() {
  return (
    <Card className="animate-pulse w-full border-muted/50">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48 rounded-sm" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-5/6 rounded-sm" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-md" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4/5 rounded-sm" />
          ))}
        </div>
        <div className="h-px bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PricePredictionResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse w-full">
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64 rounded-md" />
              <Skeleton className="h-4 w-96 rounded-sm" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-24 w-full bg-muted/20 border rounded-2xl p-6" />
            <div className="h-24 w-full bg-muted/20 border rounded-2xl p-6" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-md" />
            <div className="border rounded-md overflow-hidden space-y-3 p-4">
              <Skeleton className="h-8 w-full rounded-sm" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded-sm" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DemandSupplyResultsSkeleton() {
  return (
    <Card className="animate-pulse w-full border-muted/50">
      <CardHeader>
        <Skeleton className="h-7 w-64 rounded-md mb-2" />
        <Skeleton className="h-4 w-96 rounded-sm" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4 h-20 bg-muted/10" />
          ))}
        </div>
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="h-48 w-full bg-muted/20 border rounded-xl" />
        <Skeleton className="h-6 w-40 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-5/6 rounded-sm" />
        </div>
      </CardContent>
    </Card>
  );
}
