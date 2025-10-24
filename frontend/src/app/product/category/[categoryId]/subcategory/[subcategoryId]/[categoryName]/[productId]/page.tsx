'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Gift, Tag, Package, CreditCard, RotateCcw, Heart, Loader2 } from 'lucide-react';
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

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [userId, setUserId] = useState("");
  const {productId} = useParams();
  const router = useRouter();
  const API_BASE_URL = "http://localhost:8000/api/v1" ; 


  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage?.getItem("arttagtoken") : null;
    const storedUserId = typeof window !== 'undefined' ? window.localStorage?.getItem("arttagUserId") : null;
    
    if (!storedUserId || !token) {
      router.push('/login');
      return;
    }
    
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [router]);
  
  
  useEffect(() => {
    if (userId) {
      fetchProductDetails();
    }
  }, [userId]);



  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/product/get/product/details/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
        
        // Check if product is in wishlist
        if (data.product.wishlists && data.product.wishlists.length > 0) {
          const inWishlist = data.product.wishlists.some(
            wishlistItem => wishlistItem.userId === userId
          );
          setIsInWishlist(inWishlist);
        }
        
        // Check if product is in cart
        if (data.product.cart && data.product.cart.length > 0) {
          const inCart = data.product.cart.some(
            cartItem => cartItem.ownerId === userId
          );
          setIsInCart(inCart);
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
    
    const images = [];
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

  const handleAddToCart = async () => {
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
    } catch (err) {
      if (err.response?.data?.message === 'Product already added to cart') {
        setIsInCart(true);
      }
      alert(err.response?.data?.message || 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
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
        //   alert('Removed from wishlist');
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/wishlist/add/product/user/wishlist`, {
          userId: userId,
          productId: productId
        });

        if (response.data.success) {
          setIsInWishlist(true);
        //   alert('Added to wishlist!');
        }
      }
    } catch (err) {
      if (err.response?.data?.message === 'product already added to user wishlist') {
        setIsInWishlist(true);
      }
      alert(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
        <Spinner className='text-blue-700 text-5xl'></Spinner>
        <p className="text-gray-600 text-sm">Loading product</p>
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
    <div className="min-h-screen">
      <Navbar />
      <div className="">
        <div className="grid md:grid-cols-2 gap-8 bg-white shadow-sm">
          {/* Left Side - Image Slider */}
          <div className="space-y-4">
            <div className="relative overflow-hidden aspect-square">
              {images.length > 0 && (
                <img
                  src={images[currentImageIndex]}
                  alt={selectedColor?.name}
                  className="w-full h-full object-contain"
                />
              )}
              
              {/* Wishlist Heart Icon */}
              <button
                onClick={handleToggleWishlist}
                disabled={togglingWishlist}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
                  togglingWishlist ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                } ${isInWishlist ? 'bg-red-500' : 'bg-white/90'}`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isInWishlist ? 'fill-white text-white' : 'text-gray-700'
                  }`}
                />
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

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`w-[76%] py-3 rounded-lg font-semibold text-lg transition-colors ${
                addingToCart
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isInCart
                  ? 'bg-amber-800 hover:bg-amber-700'
                  : 'bg-blue-700 hover:bg-blue-600'
              } text-white`}
            >
              {addingToCart ? 'ADDING...' : isInCart ? 'GO TO CART' : 'ADD TO CART'}
            </button>

            {/* Features */}
            <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <p className="text-xs">MagSafe-Ready</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <CreditCard className="w-8 h-8" />
                </div>
                <p className="text-xs">3 Cards</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-xs">Built-in Stand</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <p className="text-xs">Adjustable View</p>
              </div>
            </div>

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

      <div className="border-t border-gray-300"></div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;