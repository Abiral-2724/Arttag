'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Folder, Tag, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface SearchResult {
  type: 'category' | 'subcategory' | 'product';
  id: string;
  name: string;
  categoryId?: string;
  subcategoryId?: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
}

interface Subcategory {
  id: string;
  name: string;
  imageUrl: string;
  parentId: string;
  createdAt: string;
}

interface SubcategoriesResponse {
  success: boolean;
  message: string;
  subcategories: Subcategory[];
}

const trendingSearches = [
  'Loop Powerbank',
  'Phone Wallet',
  'Apple Phone Cases',
  'Pop Adapter',
  'Wireless Charger',
  'Watch Straps',
  'Charging Cable',
  'Laptop Bags',
  'Tote Bags'
];

export default function EnhancedSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Load recent searches from memory
  useEffect(() => {
    const saved = sessionStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch subcategories for top categories
  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE}/category/get/all/subcategory`);
      const data: SubcategoriesResponse = await response.json();
      if (data.success) {
        setSubcategories(data.subcategories);
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/product/search/product?q=${encodeURIComponent(searchQuery)}`);
      const data: SearchResponse = await response.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    sessionStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);
    sessionStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'category':
        return <Folder className="w-4 h-4 text-green-500" />;
      case 'subcategory':
        return <Tag className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Product';
      case 'category':
        return 'Category';
      case 'subcategory':
        return 'Subcategory';
      default:
        return '';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(result.name);
    window.location.href = result.url;
    setShowResults(false);
    setQuery('');
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    inputRef.current?.focus();
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleCategoryClick = (subcategory: Subcategory) => {
    const categoryId = subcategory.parentId;
    const subcategoryId = subcategory.id;
    const subcategoryName = subcategory.name.toLowerCase().replace(/\s+/g, '-');
    
    window.location.href = `/product/category/${categoryId}/subcategory/${subcategoryId}/${subcategoryName}`;
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const groupedResults = {
    categories: results.filter(r => r.type === 'category'),
    subcategories: results.filter(r => r.type === 'subcategory'),
    products: results.filter(r => r.type === 'product'),
  };

  return (
    <div>
<Navbar></Navbar>
<div className="min-h-screen bg-gray-50">
      {/* Search Bar Section */}
      <div className="bg-white py-6 border-0">
        <div className="max-w-4xl mx-auto px-4">
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim()) {
                    setShowResults(true);
                  }
                }}
                placeholder="Search for products, categories..."
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-base"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && query.trim() && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {groupedResults.categories.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Categories
                        </div>
                        {groupedResults.categories.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                          >
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{result.name}</p>
                              <p className="text-xs text-gray-500">{getTypeLabel(result.type)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {groupedResults.subcategories.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Subcategories
                        </div>
                        {groupedResults.subcategories.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                          >
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{result.name}</p>
                              <p className="text-xs text-gray-500">{getTypeLabel(result.type)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {groupedResults.products.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Products
                        </div>
                        {groupedResults.products.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                          >
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{result.name}</p>
                              <p className="text-xs text-gray-500">{getTypeLabel(result.type)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Searched & Trending Search - Always visible */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Recently Searched */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Recently Searched</h3>
              <div className="space-y-2">
                {recentSearches.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2"
                    onClick={() => handleRecentClick(term)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{term}</span>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Search */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Trending Search</h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(term)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories Slider Section - Always visible */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">TOP CATEGORIES</h2>
        
        {isLoadingCategories ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scrollSlider('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Slider Container */}
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {subcategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="flex-shrink-0 w-32 flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-3 group-hover/item:shadow-xl transition-shadow">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center leading-tight">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollSlider('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 translate-x-4 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
    <Footer></Footer>
    </div>
    
  );
}