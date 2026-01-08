'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Gift, Tag, Package, CreditCard, RotateCcw, Heart, Loader2, Share2, X, Copy, Check as CheckIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import CustomerReviewSection from '@/components/CustomerReview';

const ProductDetailPage = () => {
  const [product, setProduct] : any = useState(null);
  const [selectedColor, setSelectedColor] : any = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] : any = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [userId, setUserId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const {productId} = useParams();
  const [productName ,setProductName] = useState("")
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ; 


  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage?.getItem("arttagtoken") : null;
    const storedUserId : any = typeof window !== 'undefined' ? window.localStorage?.getItem("arttagUserId") : null;
    
    // Check if user is logged in
    if (storedUserId && token) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    
    // Always fetch product details regardless of login status
    fetchProductDetails(storedUserId);
  }, []);



  const fetchProductDetails = async (currentUserId = null) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/product/get/product/details/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
        setProductName(data.product.name)
        // Only check wishlist and cart status if user is logged in
        if (currentUserId) {
          // Check if product is in wishlist
          if (data.product.wishlists && data.product.wishlists.length > 0) {
            const inWishlist = data.product.wishlists.some(
              wishlistItem => wishlistItem.userId === currentUserId
            );
            setIsInWishlist(inWishlist);
          }
          
          // Check if product is in cart
          if (data.product.cart && data.product.cart.length > 0) {
            const inCart = data.product.cart.some(
              cartItem => cartItem.ownerId === currentUserId
            );
            setIsInCart(inCart);
          }
        }
        
        if (data.product.colors && data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0]);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentImages = () => {
    if (!selectedColor) return [];
    
    const images : any = [];
    if (selectedColor.colorImage1) images.push(selectedColor.colorImage1);
    if (selectedColor.colorImage2) images.push(selectedColor.colorImage2);
    if (selectedColor.colorImage3) images.push(selectedColor.colorImage3);
    if (selectedColor.colorImage4) images.push(selectedColor.colorImage4);
    if (selectedColor.colorImage5) images.push(selectedColor.colorImage5);
    
    return images;
  };

  const nextImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
  };

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(0); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  const handleAddToCart = async () => {
    // If user is not logged in, redirect to login
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Check if product is out of stock
    if (product.totalCount === 0) {
      alert('This product is currently out of stock');
      return;
    }

    if (isInCart) {
      router.push(`/${userId}/cart`);
      return;
    }

    try {
      setAddingToCart(true);
      const response = await axios.post(`${API_BASE_URL}/cart/add/product/user/cart`, {
        userId: userId,
        productId: productId
      });

      if (response.data.success) {
        setIsInCart(true);
        alert('Product added to cart successfully!');
      }
    } catch (err : any) {
      if (err.response?.data?.message === 'Product already added to cart') {
        setIsInCart(true);
      }
      alert(err.response?.data?.message || 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    // If user is not logged in, redirect to login
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      setTogglingWishlist(true);
      
      if (isInWishlist) {
        const response = await axios.delete(`${API_BASE_URL}/wishlist/delete/item/user/wishlist`, {
          data: {
            userId: userId,
            productId: productId
          }
        });

        if (response.data.success) {
          setIsInWishlist(false);
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/wishlist/add/product/user/wishlist`, {
          userId: userId,
          productId: productId
        });

        if (response.data.success) {
          setIsInWishlist(true);
        }
      }
    } catch (err : any) {
      if (err.response?.data?.message === 'product already added to user wishlist') {
        setIsInWishlist(true);
      }
      alert(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  // Share functionality
  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const getShareText = () => {
    return `Check out ${product?.name} for ₹${product?.discountPrice}!`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(getShareText());
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (false && navigator.share) {

      try {
        await navigator.share({
          title: product?.name,
          text: getShareText(),
          url: getProductUrl(),
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      setShowShareModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-6">
      <Link href={'/'} className="mb-4">
        <div className="flex items-center gap-2 transition-transform hover:scale-105 duration-300">
          <div className="w-auto h-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 270 54"
              className="h-full w-auto drop-shadow-md"
            >
              <defs>
                <style>
                  {`
                  .st0 {
                    font-family: MuktaMahee-Regular, 'Mukta Mahee';
                    font-size: 49.69px;
                  }
                  `}
                </style>
              </defs>
              <g>
                <path d="M62.85,33.21c.11,0,.17.04.19.21.2,1.7-.04,4.05-.01,5.84,0,.44.01.95-.3,1.15-.34.21-1.72-.06-2.18-.12-14.77-1.86-19.13-21.03-6.37-28.96,3.44-2.14,5.73-2.15,9.65-2.25.57-.01,1.26,0,1.76.06-2.15,2.88-1.5,7.52,2.16,8.77,1.53.52,2.98.08,4.52.4v21.62c0,.2-.1.41-.29.49h-6.67c-.08,0-.16-.03-.22-.09-.06-.06-.09-.14-.09-.22v-20.52c0-.35-.19-.72-.24-.86-1.18-3.54-5.67-2.47-7.9-.6-4.54,3.81-3.78,11.34,1.53,14.02.34.17,1.24.75,2.41.87l2.06.2Z" />
                <path d="M68.98,16.48c-.15,0-.29-.02-.44-.05-1.63-.42-2.77-2.4-2.6-4.02.15-1.44,1.7-3.34,3.22-3.34h20.4c.15,0,.17.11.18.44v6.66c0,.08-.03.16-.09.22-.06.06-.14.09-.22.09h-20.45Z" />
                <path d="M73.96,40.29v-21.62c0-.2.1-.41.29-.49h6.67c.08,0,.16.03.22.09.06.06.09.14.09.22v18.21c.03.76-.62,1.51-.8,1.75-1.53,2.1-4.13,2.17-6.49,1.83Z" />
              </g>
              <text className="st0" transform="translate(84.95 40.38)">
                <tspan x="0" y="0">Arttag</tspan>
              </text>
            </svg>
          </div>
        </div>
      </Link>
      
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <Spinner className='text-blue-600 text-6xl'></Spinner>
          <div className="absolute inset-0 bg-blue-500 opacity-20 blur-xl rounded-full"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 text-base font-semibold">Loading product</p>
          <p className="text-gray-500 text-xs mt-1">Please wait a moment...</p>
        </div>
      </div>
    </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const images = getCurrentImages();
  const discount = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div className="">
        <div className="grid md:grid-cols-2 gap-8 bg-white shadow-sm">
          {/* Left Side - Image Slider */}
          <div className="space-y-4">
            <div 
              className="relative overflow-hidden aspect-square touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {images.length > 0 && (
                <img
                  src={images[currentImageIndex]}
                  alt={selectedColor?.name}
                  className="w-full h-full object-contain select-none"
                  draggable="false"
                />
              )}
              
              {/* Wishlist Heart Icon - Only show if logged in */}
              {isLoggedIn && (
                <button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  className={`absolute top-4 right-18 p-3 rounded-full shadow-lg transition-all ${
                    togglingWishlist ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                  } ${isInWishlist ? 'bg-red-500' : 'bg-white/90'}`}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist ? 'fill-white text-white' : 'text-gray-700'
                    }`}
                  />
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={handleNativeShare}
                className="absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all hover:scale-110 bg-white/90"
              >
                <Share2 className="w-6 h-6 text-gray-700" />
              </button>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-gray-800 w-6' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6 mt-14 pl-15 mr-7">
            <div>
              <h1 className="text-2xl font-light mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-medium">₹{product.discountPrice}</span>
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                <span className="text-sm text-gray-600">MRP Inclusive of all taxes</span>
              </div>
              
              {/* Stock Availability Badge */}
              <div className="mb-4">
                {product.totalCount === 0 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">Out of Stock</span>
                  </div>
                ) : product.totalCount < 20 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-amber-700">Limited Stock Available ({product.totalCount} left)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">In Stock</span>
                  </div>
                )}
              </div>
            </div>
            {product.shortDescription && (
              <div>
                <p className="text-gray-900">{product.shortDescription}</p>
              </div>
            )}

            {/* Color Selection */}
            <div>
              <h3 className="font-bold mb-3">COLOR</h3>
              <div className="flex gap-4">
                {product.colors?.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor?.id === color.id ? 'border-black ring-1 ring-offset-2 ring-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button - Desktop Only */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.totalCount === 0}
              className={`hidden md:block w-[76%] py-3 rounded-lg font-medium text-lg transition-colors ${
                addingToCart || product.totalCount === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : !isLoggedIn
                  ? 'bg-blue-700 hover:bg-blue-600'
                  : isInCart
                  ? 'bg-amber-800 hover:bg-amber-700'
                  : 'bg-blue-700 hover:bg-blue-600'
              } text-white`}
            >
              {product.totalCount === 0
                ? 'OUT OF STOCK'
                : addingToCart 
                ? 'ADDING...' 
                : !isLoggedIn 
                ? 'LOGIN TO ADD TO CART' 
                : isInCart 
                ? 'GO TO CART' 
                : 'ADD TO CART'}
            </button>

            {/* Product Description */}
            <div className="bg-white rounded-lg pl-5 pr-7">
              <Accordion type="single" collapsible className="w-full">
                {/* Product Details */}
                <AccordionItem value="product-details">
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                    Product Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-1">
                      <div>
                        <p className="text-gray-600">{product.description}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Specifications */}
                <AccordionItem value="specifications">
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                    Specifications
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-4 text-gray-700 text-sm">
                      {/* Material */}
                      <div className="border-b pb-3">
                        <span className="font-semibold text-gray-900">Material:</span>
                        <span className="ml-2 text-gray-800">{product.material}</span>
                      </div>

                      {/* Dimensions */}
                      <div className="border-b pb-3">
                        <span className="font-semibold text-gray-900">Dimensions:</span>
                        <span className="ml-2">{product.dimensions}</span>
                      </div>

                      {/* Weight */}
                      <div className="border-b pb-3">
                        <span className="font-semibold text-gray-900">Weight:</span>
                        <span className="ml-2">{product.weight}g</span>
                      </div>

                      {/* Country of Origin */}
                      <div className="border-b pb-3">
                        <span className="font-semibold text-gray-900">Country of Origin:</span>
                        <span className="ml-2">{product.countryOfOrigin}</span>
                      </div>

                      {/* Care Instructions */}
                      <div className="md:col-span-2 border-b pb-3">
                        <span className="font-semibold text-gray-900">Care Instructions:</span>
                        <span className="ml-2">{product.care}</span>
                      </div>

                      {/* Package Content */}
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-900 mb-2">Package Content</h3>
                        <p>{product.packageContent}</p>
                      </div>

                      {/* Manufacturer / Packer / Importer */}
                      <div className="md:col-span-2 grid sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="font-semibold text-gray-900">Manufacturer:</span>
                          <span className="ml-2">{product.manufacturerName}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Packer:</span>
                          <span className="ml-2">{product.packerName}</span>
                        </div>
                        {product.importerName && (
                          <div className="sm:col-span-2">
                            <span className="font-semibold text-gray-900">Importer:</span>
                            <span className="ml-2">{product.importerName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Delivery Time & Returns */}
                <AccordionItem value="delivery-returns">
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                    Delivery Time & Returns
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="border-b pb-3">
                        <span className="font-semibold">Delivery Time:</span>
                        <span className="ml-2 text-gray-600">{product.delivery}</span>
                      </div>
                      <div className="border-b pb-3">
                        <span className="font-semibold">Cash on Delivery:</span>
                        <span className="ml-2 text-gray-600">
                          {product.caseOnDeliveryAvailability ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      <div className="border-b pb-3">
                        <span className="font-semibold">Return Policy:</span>
                        <span className="ml-2 text-gray-600">{product.returnDetails}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="space-y-0">
        {product.images?.map((image, idx) => (
          <div
            key={image.id}
            className={`grid md:grid-cols-2 items-stretch bg-white ${
              idx % 2 !== 0 ? 'md:[&>*:first-child]:order-2' : ''
            }`}
          >
            {/* Image Section */}
            <div className="h-[65vh] w-full overflow-hidden">
              <img
                src={image.url}
                alt={image.altText}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text Section */}
            <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 space-y-6">
              <h2 className="text-2xl md:text-3xl lg:text-3xl font-semibold uppercase text-gray-800 leading-tight">
                {image.description}
              </h2>
            </div>
          </div>
        ))}
      </div>
        <CustomerReviewSection productId={productId} userId={userId} productName={productName}></CustomerReviewSection>
      <div className="border-t border-gray-300"></div>
      <Footer />

      {/* Sticky Add to Cart Button - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.totalCount === 0}
          className={`w-full py-4 rounded-lg font-medium text-lg transition-colors ${
            addingToCart || product.totalCount === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : !isLoggedIn
              ? 'bg-blue-700 hover:bg-blue-600'
              : isInCart
              ? 'bg-amber-800 hover:bg-amber-700'
              : 'bg-blue-700 hover:bg-blue-600'
          } text-white`}
        >
          {product.totalCount === 0
            ? 'OUT OF STOCK'
            : addingToCart 
            ? 'ADDING...' 
            : !isLoggedIn 
            ? 'LOGIN TO ADD TO CART' 
            : isInCart 
            ? 'GO TO CART' 
            : 'ADD TO CART'}
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold mb-6">Share Product</h2>

            {/* Social Media Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  W
                </div>
                <span className="font-medium">Share on WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  f
                </div>
                <span className="font-medium">Share on Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
                  𝕏
                </div>
                <span className="font-medium">Share on Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                  in
                </div>
                <span className="font-medium">Share on LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('telegram')}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  ✈
                </div>
                <span className="font-medium">Share on Telegram</span>
              </button>

              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                  @
                </div>
                <span className="font-medium">Share via Email</span>
              </button>
            </div>

            {/* Copy Link Section */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {linkCopied ? (
                  <>
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;