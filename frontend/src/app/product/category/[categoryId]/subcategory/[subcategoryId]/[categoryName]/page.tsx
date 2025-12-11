'use client'
import React, { useState, useEffect } from 'react';
import { Heart, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FooterPart from '@/components/FooterPart';

const SubcategoryProductsPage = () => {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { subcategoryId, categoryId, categoryName } = useParams();

  const [userId, setUserId] = useState(null); // Changed to null instead of ""
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]: any = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [wishlist, setWishlist] = useState(new Set());
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [subcategoryDetails, setSubcategoryDetails]: any = useState(null);

  // Authentication Check (Non-blocking)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage?.getItem("arttagtoken") : null;
    const storedUserId: any = typeof window !== 'undefined' ? window.localStorage?.getItem("arttagUserId") : null;

    if (storedUserId && token) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUserId(null);
    }
  }, []);

  // Fetch data - works with or without authentication
  useEffect(() => {
    fetchTypesAndDetails();
    fetchProducts();

    // Only fetch wishlist if user is authenticated
    if (isAuthenticated && userId) {
      fetchWishlist();
    }
  }, [subcategoryId, isAuthenticated, userId]);

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedType, selectedSort]);

  const fetchTypesAndDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/product/get/product/subcategory/all/type/${subcategoryId}`
      );

      if (response.data.success) {
        setAvailableTypes(response.data.types || []);
        setSubcategoryDetails(response.data.subcategorydetail);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let sortParam = '';
      if (selectedSort === 'lowToHigh') sortParam = 'lowToHigh';
      if (selectedSort === 'highToLow') sortParam = 'highToLow';

      const typeParam = selectedType !== 'All' ? `type=${selectedType}` : '';
      const sortQuery = sortParam ? `sort=${sortParam}` : '';
      const queryString = [typeParam, sortQuery].filter(Boolean).join('&');

      const response = await axios.get(
        `${API_BASE_URL}/product/get/product/bytype/${subcategoryId}?${queryString}`
      );

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setProducts([]);
      } else {
        console.error('Error fetching products:', error);
        setError(
          error.response?.data?.message ||
          'Failed to load products. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!isAuthenticated || !userId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/wishlist/${userId}/get/all/items/wishlist`);
      if (response.data.success) {
        const wishlistIds = new Set(response.data.wishlist.map(item => item.productId));
        setWishlist(wishlistIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleWishlistToggle = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!isAuthenticated || !userId) {
      router.push('/login');
      return;
    }

    try {
      if (wishlist.has(productId)) {
        await axios.delete(`${API_BASE_URL}/wishlist/delete/item/user/wishlist`, {
          data: { userId, productId }
        });

        setWishlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        const response = await axios.post(`${API_BASE_URL}/wishlist/add/product/user/wishlist`, {
          userId,
          productId
        });

        if (response.data.success) {
          setWishlist(prev => new Set([...prev, productId]));
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setError('Failed to update wishlist. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderSkeletons = () => {
    const count = products.length || 8;
    return Array(count).fill(0).map((_, i) => (
      <Card key={i} className="overflow-hidden border shadow-sm rounded-lg bg-white">
        <div className="aspect-square bg-gray-100">
          <Skeleton className="w-full h-full" />
        </div>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    ));
  };

  const typeIcons = {
    'Paintings': '🎨',
    'Sculptures': '🗿',
    'Prints': '🖼️',
    'Photography': '📷',
    'Digital Art': '💻',
  };

  const filteredProducts = selectedType === 'All'
    ? products
    : products.filter((p: any) => p.type === selectedType);

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Navbar />
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-mono text-center tracking-tight uppercase">
              {subcategoryDetails?.name || 'Products'}
            </h1>
          </div>
        </div>

        {/* Type Filters - Centered */}
        <div className="bg-white border-b py-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <button
                onClick={() => setSelectedType('All')}
                className={`flex flex-col items-center gap-2 transition-all ${selectedType === 'All' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xs font-bold transition-all ${selectedType === 'All'
                    ? 'bg-teal-500 text-white shadow-lg scale-110'
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}>
                  ALL
                </div>
                <span className="text-sm font-medium text-black">All</span>
              </button>

              {availableTypes.map((typeObj: any) => (
                <button
                  key={typeObj.type}
                  onClick={() => setSelectedType(typeObj.type)}
                  className={`flex flex-col items-center gap-2 transition-all ${selectedType === typeObj.type ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                    }`}
                >
                  <div className={`w-18 h-18 rounded-full flex items-center justify-center overflow-hidden transition-all ${selectedType === typeObj.type
                      ? 'bg-teal-500 shadow-lg scale-110 ring-4 ring-teal-200'
                      : 'bg-gray-100 hover:bg-gray-300'
                    }`}>
                    {typeObj.image ? (
                      <img
                        src={typeObj.image}
                        alt={typeObj.type}
                        className="w-14 h-14 object-cover"
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = `<span class="text-2xl">${typeIcons[typeObj.type] || '📦'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{typeIcons[typeObj.type] || '📦'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black">{typeObj.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            {showFilters && (
              <div className="w-64 flex-shrink-0 hidden lg:block">
                <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex items-center gap-2 text-white bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-full mb-6 transition-colors w-full justify-center"
                  >
                    <span className="font-medium text-sm">HIDE FILTERS</span>
                    <X className="h-4 w-4" />
                  </button>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">SORT BY</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            checked={selectedSort === 'newest'}
                            onChange={() => setSelectedSort('newest')}
                            className="w-5 h-5 accent-teal-500 cursor-pointer"
                          />
                          <span className="text-sm group-hover:text-teal-600">Newest</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            checked={selectedSort === 'popularity'}
                            onChange={() => setSelectedSort('popularity')}
                            className="w-5 h-5 accent-teal-500 cursor-pointer"
                          />
                          <span className="text-sm group-hover:text-teal-600">Popularity</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            checked={selectedSort === 'discount'}
                            onChange={() => setSelectedSort('discount')}
                            className="w-5 h-5 accent-teal-500 cursor-pointer"
                          />
                          <span className="text-sm group-hover:text-teal-600">Discount</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            checked={selectedSort === 'lowToHigh'}
                            onChange={() => setSelectedSort('lowToHigh')}
                            className="w-5 h-5 accent-teal-500 cursor-pointer"
                          />
                          <span className="text-sm group-hover:text-teal-600">Price: Low To High</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            checked={selectedSort === 'highToLow'}
                            onChange={() => setSelectedSort('highToLow')}
                            className="w-5 h-5 accent-teal-500 cursor-pointer"
                          />
                          <span className="text-sm group-hover:text-teal-600">Price: High To Low</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="mb-6 text-white bg-teal-500 hover:bg-teal-600 px-6 py-2.5 rounded-full transition-colors font-medium text-sm"
                >
                  SHOW FILTERS
                </button>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                  renderSkeletons()
                ) : (
                  filteredProducts.map((product: any) => (
                    <div key={product.id}>
                      <Link href={`/product/category/${categoryId}/subcategory/${subcategoryId}/${categoryName}/${product.id}`}>
                        <Card
                          className="group overflow-hidden border hover:shadow-xl shadow-sm transition-all duration-300 cursor-pointer bg-white rounded-lg relative"
                          onMouseEnter={() => setHoveredProduct(product.id)}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          {/* Wishlist Button - Only show if authenticated */}
                          {isAuthenticated && (
                            <button
                              onClick={(e) => handleWishlistToggle(product.id, e)}
                              className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all hover:scale-110"
                            >
                              <Heart
                                className={`h-5 w-5 transition-all ${wishlist.has(product.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-600 hover:text-red-500"
                                  }`}
                              />
                            </button>
                          )}

                          {/* New Badge */}
                          {product.isNew && (
                            <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 text-xs shadow-md uppercase">
                              NEW
                            </Badge>
                          )}

                          {/* Product Image */}
                          <div className="relative aspect-square bg-gray-50 overflow-hidden">
                            <img
                              src={
                                hoveredProduct === product.id && product.images?.[1]?.url
                                  ? product.images[1].url
                                  : product.images?.[0]?.url || "/api/placeholder/400/400"
                              }
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "/api/placeholder/400/400";
                              }}
                            />
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Product Content */}
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2 mb-2 min-h-[40px]">
                              {product.name}
                            </h3>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(product.discountPrice)}
                              </span>
                              {product.originalPrice > product.discountPrice && (
                                <>
                                  <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))
                )}
              </div>

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <AlertCircle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Try adjusting your filters or check back later for new arrivals
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-0"></div>
      <FooterPart />
    </div>
  );
};

export default SubcategoryProductsPage;