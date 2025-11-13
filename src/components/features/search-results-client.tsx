
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface SearchResultsClientProps {
  query: string;
  sort: string;
  time: string;
}

export function SearchResultsClient({
  query: initialQuery,
  sort: initialSort,
  time: initialTime,
}: SearchResultsClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState(initialSort);
  const [timeOption, setTimeOption] = useState(initialTime);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setSearchQuery(initialQuery);
    setSortOption(initialSort);
    setTimeOption(initialTime);
  }, [initialQuery, initialSort, initialTime]);

  const updateSearch = () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchQuery);
    params.set('sort', sortOption);
    params.set('t', timeOption);
    
    router.push(`${pathname}?${params.toString()}`);
    
    // Simulate loading for demonstration
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSearch();
  };
  
  useEffect(() => {
    if (initialQuery || initialSort || initialTime) {
      updateSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption, timeOption]);


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">
        Search Results {initialQuery && `for "${initialQuery}"`}
      </h1>

      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities, posts, comments..."
            className="pl-9"
          />
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </form>
      
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="flex items-center gap-2 w-full">
            <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="comment_count">Comment Count</SelectItem>
                </SelectContent>
            </Select>
            <Select value={timeOption} onValueChange={setTimeOption}>
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="hour">Past Hour</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Search results will appear here.</p>
              <p className="text-xs">(Search logic is not yet implemented.)</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
