'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, Gift, Tag, CreditCard, ChevronDown, X, ShoppingBag, Loader2, Check } from 'lucide-react';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import FooterPart from '@/components/FooterPart';
import Link from 'next/link';


const ShoppingCart = () => {
  const [cartData, setCartData] : any = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] : any = useState(null);
  const [processingItems, setProcessingItems] = useState({});
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] : any = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  const { userId } = useParams();
 
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchCartData();
  }, []);

  // Recalculate coupon discount when cart changes
  const recalculateCouponDiscount = (newGrandTotal, discountPercentage) => {
    return Math.round((newGrandTotal * discountPercentage) / 100);
  };
  

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/cart/${userId}/get/all/user/cart/product`);
      
      if (response.data.success) {
        setCartData(response.data);
        
        // Restore coupon if it was previously applied
        console.log(response.data)
        if (response.data.couponCode && response.data.couponDiscountPercentage) {
          const discountAmount = recalculateCouponDiscount(
            response.data.grandTotal, 
            response.data.couponDiscountPercentage
          );
          
          setAppliedCoupon({
            code: response.data.couponCode,
            discountPercentage: response.data.couponDiscountPercentage,
            discountAmount: discountAmount
          });
          setCouponCode(response.data.couponCode);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError('');

      const currentDate = new Date().toISOString();
      const totalCartAmount = cartData.grandTotal;

      // Step 1: Validate coupon code
      const validateResponse = await axios.post(`${API_BASE}/coupen/apply/coupen`, {
        code: couponCode,
        totalCartAmount: totalCartAmount,
        currentDate: currentDate
      });

      if (validateResponse.data.success) {
        const discountPercentage = validateResponse.data.discountPercentage;
        const discountAmount = recalculateCouponDiscount(totalCartAmount, discountPercentage);

        // Step 2: Update cart items with coupon discount percentage and code
        const updateResponse = await axios.patch(`${API_BASE}/cart/add/coupendiscount/amount`, {
          userId: userId,
          couponCode: couponCode,
          couponDiscountPercentage: discountPercentage
        });

        if (updateResponse.data.success) {
          // Update local state
          setAppliedCoupon({
            code: couponCode,
            discountPercentage: discountPercentage,
            discountAmount: discountAmount
          });
          
          // Refresh cart data to get updated values
          await fetchCartData();
          
          alert(`Coupon applied successfully! You saved ₹${discountAmount.toFixed(2)}`);
        } else {
          setCouponError(updateResponse.data.message);
        }
      } else {
        setCouponError(validateResponse.data.message);
      }
    } catch (error : any) {
      console.error('Error applying coupon:', error);
      setCouponError(error.response?.data?.message || 'Failed to apply coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      // Reset coupon discount in cart items
      await axios.patch(`${API_BASE}/cart/add/coupendiscount/amount`, {
        userId: userId,
        couponCode: null,
        couponDiscountPercentage: 0
      });

      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError('');
      
      // Refresh cart data
      await fetchCartData();
      
      alert('Coupon removed successfully');
    } catch (error) {
      console.error('Error removing coupon:', error);
      alert('Failed to remove coupon');
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      setProcessingItems(prev => ({ ...prev, [selectedProduct.productId]: true }));
      const response = await axios.delete(`${API_BASE}/cart/delete/product/user/cart`, {
        data: { 
          userId, 
          productId: selectedProduct.productId 
        }
      });
      
      if (response.data.success) {
        // Recalculate everything including coupon
        const itemToRemove = cartData.cart.find(item => item.productId === selectedProduct.productId);
        const itemTotal = itemToRemove.quantity * itemToRemove.product.originalPrice;
        const itemDiscount = (itemToRemove.quantity * itemToRemove.product.originalPrice) - 
                            (itemToRemove.quantity * itemToRemove.product.discountPrice);
        
        const newGrandTotal = cartData.grandTotal - (itemTotal - itemDiscount);
        
        // Recalculate coupon discount based on new total
        let newCouponDiscount = 0;
        if (appliedCoupon) {
          newCouponDiscount = recalculateCouponDiscount(newGrandTotal, appliedCoupon.discountPercentage);
          setAppliedCoupon({
            ...appliedCoupon,
            discountAmount: newCouponDiscount
          });
        }
        
        setCartData((prev) => {
          const newCart = prev.cart.filter(item => item.productId !== selectedProduct.productId);
          
          return {
            ...prev,
            cart: newCart,
            totalItems: prev.totalItems - itemToRemove.quantity,
            totalOrginalPrice: prev.totalOrginalPrice - itemTotal,
            totalDiscount: prev.totalDiscount - itemDiscount,
            grandTotal: newGrandTotal,
            priceSaved: prev.priceSaved - itemDiscount
          };
        });
        
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
      fetchCartData(); // Revert on error
    } finally {
      setProcessingItems(prev => ({ ...prev, [selectedProduct.productId]: false }));
    }
  };

  const handleMoveToWishlist = async () => {
    if (!selectedProduct) return;
    
    try {
      setProcessingItems(prev => ({ ...prev, [selectedProduct.productId]: true }));
      const response = await axios.patch(`${API_BASE}/cart/move/product/cart/to/wishlist`, {
        userId,
        productId: selectedProduct.productId
      });
      
      if (response.data.success) {
        // Recalculate everything including coupon
        const itemToRemove = cartData.cart.find(item => item.productId === selectedProduct.productId);
        const itemTotal = itemToRemove.quantity * itemToRemove.product.originalPrice;
        const itemDiscount = (itemToRemove.quantity * itemToRemove.product.originalPrice) - 
                            (itemToRemove.quantity * itemToRemove.product.discountPrice);
        
        const newGrandTotal = cartData.grandTotal - (itemTotal - itemDiscount);
        
        // Recalculate coupon discount based on new total
        let newCouponDiscount = 0;
        if (appliedCoupon) {
          newCouponDiscount = recalculateCouponDiscount(newGrandTotal, appliedCoupon.discountPercentage);
          setAppliedCoupon({
            ...appliedCoupon,
            discountAmount: newCouponDiscount
          });
        }
        
        setCartData((prev) => {
          const newCart = prev.cart.filter(item => item.productId !== selectedProduct.productId);
          
          return {
            ...prev,
            cart: newCart,
            totalItems: prev.totalItems - itemToRemove.quantity,
            totalOrginalPrice: prev.totalOrginalPrice - itemTotal,
            totalDiscount: prev.totalDiscount - itemDiscount,
            grandTotal: newGrandTotal,
            priceSaved: prev.priceSaved - itemDiscount
          };
        });
        
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      alert('Failed to move to wishlist');
      fetchCartData(); // Revert on error
    } finally {
      setProcessingItems(prev => ({ ...prev, [selectedProduct.productId]: false }));
    }
  };

  const handleIncreaseQuantity = async (productId, currentQuantity) => {
    try {
      setProcessingItems(prev => ({ ...prev, [productId]: true }));
      
      const item = cartData.cart.find(i => i.productId === productId);
      const priceIncrease = item.product.originalPrice;
      const discountIncrease = item.product.originalPrice - item.product.discountPrice;
      const newGrandTotal = cartData.grandTotal + item.product.discountPrice;
      
      // Recalculate coupon discount based on new total
      let newCouponDiscount = 0;
      if (appliedCoupon) {
        newCouponDiscount = recalculateCouponDiscount(newGrandTotal, appliedCoupon.discountPercentage);
        setAppliedCoupon({
          ...appliedCoupon,
          discountAmount: newCouponDiscount
        });
      }
      
      // Optimistic update
      setCartData((prev) => {
        const newCart = prev.cart.map(item => {
          if (item.productId === productId) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
        
        return {
          ...prev,
          cart: newCart,
          totalItems: prev.totalItems + 1,
          totalOrginalPrice: prev.totalOrginalPrice + priceIncrease,
          totalDiscount: prev.totalDiscount + discountIncrease,
          grandTotal: newGrandTotal,
          priceSaved: prev.priceSaved + discountIncrease
        };
      });
      
      const response = await axios.patch(`${API_BASE}/cart/update/product/count`, {
        userId,
        productId,
        productCount: currentQuantity
      });
      
      if (!response.data.success) {
        alert(response.data.message);
        fetchCartData(); // Revert on error
      }
    } catch (error) {
      console.error('Error increasing quantity:', error);
      alert('Failed to update quantity');
      fetchCartData(); // Revert on error
    } finally {
      setProcessingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleDecreaseQuantity = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      alert('Quantity cannot be less than 1');
      return;
    }
    
    try {
      setProcessingItems(prev => ({ ...prev, [productId]: true }));
      
      const item = cartData.cart.find(i => i.productId === productId);
      const priceDecrease = item.product.originalPrice;
      const discountDecrease = item.product.originalPrice - item.product.discountPrice;
      const newGrandTotal = cartData.grandTotal - item.product.discountPrice;
      
      // Recalculate coupon discount based on new total
      let newCouponDiscount = 0;
      if (appliedCoupon) {
        newCouponDiscount = recalculateCouponDiscount(newGrandTotal, appliedCoupon.discountPercentage);
        setAppliedCoupon({
          ...appliedCoupon,
          discountAmount: newCouponDiscount
        });
      }
      
      // Optimistic update
      setCartData((prev) => {
        const newCart = prev.cart.map(item => {
          if (item.productId === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });
        
        return {
          ...prev,
          cart: newCart,
          totalItems: prev.totalItems - 1,
          totalOrginalPrice: prev.totalOrginalPrice - priceDecrease,
          totalDiscount: prev.totalDiscount - discountDecrease,
          grandTotal: newGrandTotal,
          priceSaved: prev.priceSaved - discountDecrease
        };
      });
      
      const response = await axios.patch(`${API_BASE}/cart/decrease/product/count`, {
        userId,
        productId,
        productCount: currentQuantity
      });
      
      if (!response.data.success) {
        alert(response.data.message);
        fetchCartData(); // Revert on error
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      alert('Failed to update quantity');
      fetchCartData(); // Revert on error
    } finally {
      setProcessingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium">
          <Spinner className='text-blue-700 text-5xl'></Spinner>
          <p className="text-gray-600 text-sm">Loading Cart</p>
        </div>  
      </>
    );
  }

  if (!cartData || cartData.cart.length === 0) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link href={'/allcategory'}>
              <Button className="bg-green-600 hover:bg-green-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Calculate final amount with coupon
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalGrandTotal = cartData.grandTotal - couponDiscountAmount;

  return (
    <div>
      <Navbar page={"cart"}/>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shopping Bag</h1>
            <p className="text-gray-600">{cartData.totalItems} {cartData.totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {cartData.cart.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-48 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 group">
                      <img 
                        src={item.product.primaryImage1} 
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 pr-4 line-clamp-2">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                          title="Remove from Cart"
                          disabled={processingItems[item.productId]}
                        >
                          <Trash2 size={20} className="text-gray-600 hover:text-red-600" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl md:text-2xl font-bold text-gray-900">
                          ₹{item.product.discountPrice*item.quantity}
                        </span>
                        <span className="text-base md:text-lg text-gray-400 line-through">
                          ₹{item.product.originalPrice*item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {Math.round(((item.product.originalPrice - item.product.discountPrice) / item.product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.product.shortDescription}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                            <button 
                              className="w-8 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                              onClick={() => handleDecreaseQuantity(item.productId, item.quantity)}
                              disabled={processingItems[item.productId] || item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-lg font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button 
                              className="w-8 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                              onClick={() => handleIncreaseQuantity(item.productId, item.quantity)}
                              disabled={processingItems[item.productId]}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          {item.product.delivery}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
                {/* Gift Option */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Gift size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Gift Wrapping</p>
                        <p className="text-xs text-gray-500">Add for ₹250</p>
                      </div>
                    </div>
                    <span className="text-green-600 border border-green-600 rounded-full px-3 py-1 text-xs font-semibold hover:bg-green-50 cursor-pointer transition-colors">
                      + ADD
                    </span>
                  </div>
                </div>
                
                {/* Coupons Section */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <button 
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Tag size={20} className="text-orange-600" />
                      </div>
                      <span className="font-semibold text-sm">Coupons & Offers</span>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`transform transition-transform ${showCoupons ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {/* Coupon Input Section */}
                  {showCoupons && (
                    <div className="mt-4 space-y-3">
                      {appliedCoupon ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Check size={18} className="text-green-600" />
                              <span className="font-semibold text-green-800 text-sm">
                                {appliedCoupon.code}
                              </span>
                            </div>
                            <button 
                              onClick={handleRemoveCoupon}
                              className="text-red-600 hover:text-red-700 text-xs font-semibold"
                            >
                              REMOVE
                            </button>
                          </div>
                          <p className="text-xs text-green-700">
                            Coupon applied! You saved ₹{couponDiscountAmount.toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError('');
                              }}
                              placeholder="Enter coupon code"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm uppercase"
                              disabled={applyingCoupon}
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={applyingCoupon || !couponCode.trim()}
                              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 text-sm font-semibold"
                            >
                              {applyingCoupon ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                'APPLY'
                              )}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-red-600 mt-1">{couponError}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Gift Card Section */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <button 
                    onClick={() => setShowGiftCard(!showGiftCard)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <CreditCard size={20} className="text-blue-600" />
                      </div>
                      <span className="font-semibold text-sm">Redeem Gift Card</span>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`transform transition-transform ${showGiftCard ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
                
                {/* Order Summary */}
                <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span className="text-sm">Item Total ({cartData.totalItems} Items)</span>
                    <span className="font-semibold">₹{cartData.totalOrginalPrice}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Discount</span>
                    <span className="font-semibold">-₹{cartData.totalDiscount}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-orange-600">
                      <span className="text-sm">Coupon Discount ({appliedCoupon.code})</span>
                      <span className="font-semibold">-₹{couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-700">
                    <span className="text-sm">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-gray-900">₹{finalGrandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>(Inclusive of Taxes)</span>
                    <span className="text-green-600 font-semibold">
                      You Saved ₹{(cartData.priceSaved + couponDiscountAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Link href={`/${userId}/order/checkout`}>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-98">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  🔒 Secure checkout powered by SSL
                </p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-xl bg-white rounded-xl p-8 shadow-lg">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <AlertDialogTitle className="text-2xl font-extrabold uppercase tracking-tight">
                  REMOVE FROM BAG ?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-800 text-base mt-2">
                  Are you sure you want to remove this product from your bag?
                </AlertDialogDescription>
              </div>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {selectedProduct && (
              <div className="flex items-center gap-5 mb-0 bg-gray-50 p-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-400 shadow-sm">
                  <img
                    src={selectedProduct.product.primaryImage1}
                    alt={selectedProduct.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold text-base line-clamp-2">
                    {selectedProduct.product.name}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    ₹{selectedProduct.product.discountPrice} × {selectedProduct.quantity}
                  </p>
                </div>
              </div>
            )}

            <AlertDialogFooter className="flex flex-row justify-between gap-4 mt-0 ml-5">
              <Button
                variant="outline"
                onClick={handleConfirmDelete}
                disabled={processingItems[selectedProduct?.productId]}
                className="w-1/2 py-6 text-sm font-extrabold uppercase border-2 border-blue-500 text-blue-600 hover:bg-blue-100 transition-all"
              >
                {processingItems[selectedProduct?.productId] ? 'Removing...' : 'Remove'}
              </Button>

              <Button
                onClick={handleMoveToWishlist}
                disabled={processingItems[selectedProduct?.productId]}
                className="w-1/2 py-6 text-sm font-extrabold uppercase bg-blue-800 hover:bg-blue-700 text-white transition-all"
              >
                {processingItems[selectedProduct?.productId] ? 'Moving...' : 'Move to Wishlist'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
      <div className="border-t border-gray-300 my-0"></div>
      <FooterPart></FooterPart>
    </div>
  );
};

export default ShoppingCart;