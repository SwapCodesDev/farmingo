'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { useState } from 'react';

interface PriceRange {
  min: string;
  max: string;
}

interface MarketplaceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (value: PriceRange) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  activeTab: string;
}

const CATEGORIES = ['Fruits', 'Vegetables', 'Grains', 'Dairy', 'Seeds', 'Equipment', 'Other'];

export function MarketplaceFilters({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  onClearFilters,
  activeTab,
}: MarketplaceFiltersProps) {
  const t = useTranslations('Marketplace');
  const [isOpen, setIsOpen] = useState(false);

  // Calculate active filter count
  const activeFiltersCount = (() => {
    let count = 0;
    if (activeTab === 'verified' && category && category !== 'all') count++;
    if (priceRange.min) count++;
    if (priceRange.max) count++;
    return count;
  })();

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPriceRangeChange({ ...priceRange, min: e.target.value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPriceRangeChange({ ...priceRange, max: e.target.value });
  };

  return (
    <div className="space-y-4 w-full">
      {/* Mobile Layout */}
      <div className="flex md:hidden items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search-placeholder')}
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 px-3 relative border-emerald-500/20 hover:border-emerald-500/40">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold border border-background">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md p-6">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex justify-between items-center text-lg font-bold">
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs text-muted-foreground hover:text-foreground">
                    Clear All
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pt-6">
              {/* Category selector (Verified tab only) */}
              {activeTab === 'verified' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <Select value={category} onValueChange={onCategoryChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Range (₹)</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={handleMinPriceChange}
                    className="h-11"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={handleMaxPriceChange}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort By</label>
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt_desc">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value={activeTab === 'verified' ? 'name_asc' : 'itemName_asc'}>Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t flex gap-4">
                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-row items-center gap-3 w-full p-4 border rounded-2xl bg-card/60 backdrop-blur shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search-placeholder')}
            className="pl-9 h-10 border-muted-foreground/10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Category Selector (Verified tab only) */}
        {activeTab === 'verified' && (
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px] h-10 border-muted-foreground/10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Price Range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min Price"
            value={priceRange.min}
            onChange={handleMinPriceChange}
            className="w-24 h-10 border-muted-foreground/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground text-xs">-</span>
          <Input
            type="number"
            placeholder="Max Price"
            value={priceRange.max}
            onChange={handleMaxPriceChange}
            className="w-24 h-10 border-muted-foreground/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Sort selector */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] h-10 border-muted-foreground/10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value={activeTab === 'verified' ? 'name_asc' : 'itemName_asc'}>Name: A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
          >
            <X className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
