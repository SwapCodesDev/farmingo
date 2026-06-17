import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10 pb-10 w-full animate-in fade-in duration-500">
      {/* Hero Header Section Skeleton */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-muted/20 border border-muted/50 p-8 md:p-12 shadow-xs">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            {/* Weather Widget Placeholder */}
            <Skeleton className="h-10 w-48 rounded-xl" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-64 md:w-96 rounded-lg" />
            <Skeleton className="h-6 w-full max-w-xl rounded-md" />
            <Skeleton className="h-6 w-5/6 max-w-lg rounded-md" />
          </div>
        </div>
      </div>

      {/* Live Data Feed Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <Skeleton className="h-6 w-28 rounded-md" />
                <Skeleton className="h-3 w-full rounded-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Insights Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-44 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Main featured tools (longer cards) */}
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="lg:col-span-6 border-muted/50 flex flex-col justify-between overflow-hidden rounded-[2rem]">
              <CardHeader className="flex flex-row items-start gap-5 pb-4">
                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-6 w-40 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </CardContent>
              <CardFooter className="border-t bg-muted/5 py-4">
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardFooter>
            </Card>
          ))}

          {/* Smaller secondary tools */}
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="lg:col-span-4 border-muted/50 flex flex-col justify-between overflow-hidden rounded-[2rem]">
              <CardHeader className="flex flex-row items-start gap-5 pb-4">
                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-6 w-32 rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
              </CardContent>
              <CardFooter className="border-t bg-muted/5 py-4">
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
