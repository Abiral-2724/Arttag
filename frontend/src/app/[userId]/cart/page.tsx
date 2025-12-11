'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, Gift, Tag, CreditCard, ChevronDown, X, ShoppingBag, Loader2, Check, MapPin } from 'lucide-react';
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
  const [cartData, setCartData]: any = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct]: any = useState(null);
  const [processingItems, setProcessingItems] = useState({});

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon]: any = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [pincode, setPincode] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeStatus, setPincodeStatus]: any = useState(null);
  const [showPincodeCheck, setShowPincodeCheck] = useState(false);

  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftData, setGiftData] = useState({
    recipentName: '',
    senderName: '',
    messageFromSender: ''
  });
  const [savingGift, setSavingGift] = useState(false);


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

      // First get the cart items
      const cartResponse = await axios.get(`${API_BASE}/cart/${userId}/get/all/user/cart/product`);

      // Then get the order details which includes gift wrapping info
      const orderDetailsResponse = await axios.get(`${API_BASE}/cart/${userId}/cart/summary`);

      if (cartResponse.data.success) {
        // Merge both responses
        const mergedData = {
          ...cartResponse.data,
          ...orderDetailsResponse.data
        };

        setCartData(mergedData);

        // Set gift wrapping status from order details
        setIsGiftWrapped(orderDetailsResponse.data.isAddingAsGift || false);

        // If gift is added, try to get gift data from the first cart item
        if (orderDetailsResponse.data.isAddingAsGift && cartResponse.data.cart.length > 0) {
          const firstItem = cartResponse.data.cart[0];
          if (firstItem.giftRecipentname || firstItem.giftSendername) {
            setGiftData({
              recipentName: firstItem.giftRecipentname || '',
              senderName: firstItem.giftSendername || '',
              messageFromSender: firstItem.giftMessageFromSender || ''
            });
          }
        }

        // Restore coupon if it was previously applied
        if (orderDetailsResponse.data.couponCode && orderDetailsResponse.data.couponDiscountPercentage) {
          const discountAmount = recalculateCouponDiscount(
            orderDetailsResponse.data.totalamount,
            orderDetailsResponse.data.couponDiscountPercentage
          );

          setAppliedCoupon({
            code: orderDetailsResponse.data.couponCode,
            discountPercentage: orderDetailsResponse.data.couponDiscountPercentage,
            discountAmount: discountAmount
          });
          setCouponCode(orderDetailsResponse.data.couponCode);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };




  const handleCheckPincode = async () => {
    if (pincode.length !== 6) {
      setPincodeStatus({ success: false, message: 'Please enter a valid 6-digit pincode' });
      return;
    }

    setPincodeChecking(true);
    setPincodeStatus(null);

    try {
      const response = await axios.post(`${API_BASE}/coupen/check/pincode`, {
        pincode: pincode
      });

      if (response.data.success) {
        setPincodeStatus({
          success: true,
          message: response.data.message
        });
      }
    } catch (error: any) {
      setPincodeStatus({
        success: false,
        message: error.response?.data?.message || 'Delivery not available for this pincode'
      });
    } finally {
      setPincodeChecking(false);
    }
  };

  const handleAddGiftWrapping = async () => {
    if (!giftData.recipentName || !giftData.senderName) {
      alert('Please fill in recipient and sender names');
      return;
    }

    setSavingGift(true);

    try {
      const response = await axios.patch(`${API_BASE}/cart/add/cart/item/gift`, {
        ownerId: userId,
        recipentName: giftData.recipentName,
        senderName: giftData.senderName,
        messageFromSender: giftData.messageFromSender
      });

      if (response.data.success) {
        // First set the gift wrapped status to true
        setIsGiftWrapped(true);

        // Close the dialog
        setShowGiftDialog(false);

        // Fetch updated cart data from the server
        await fetchCartData();

        alert('Gift wrapping added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding gift wrapping:', error);
      alert(error.response?.data?.message || 'Failed to add gift wrapping');
    } finally {
      setSavingGift(false);
    }
  };


  // Remove gift wrapping function
  const handleRemoveGiftWrapping = async () => {
    try {
      const response = await axios.patch(`${API_BASE}/cart/remove/cart/item/gift`, {
        ownerId: userId
      });

      if (response.data.success) {
        // Reset gift wrapped status
        setIsGiftWrapped(false);

        // Reset gift data
        setGiftData({
          recipentName: '',
          senderName: '',
          messageFromSender: ''
        });

        // Fetch updated cart data from the server
        await fetchCartData();

        alert('Gift wrapping removed');
      }
    } catch (error: any) {
      console.error('Error removing gift wrapping:', error);
      alert(error.response?.data?.message || 'Failed to remove gift wrapping');
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
    } catch (error: any) {
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
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium">
          <Link href={'/'}>
            <div className="flex items-center gap-2">
              <div className="w-auto h-14">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 270 54"
                  className="h-full w-auto"
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
          <Spinner className='text-blue-700 text-5xl'></Spinner>
          <p className="text-gray-600 text-sm">Loading Cart</p>
        </div>
      </>
    );
  }

  if (!cartData || cartData.cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link href={'/'}>
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
  const giftWrappingCharge = cartData?.isAddingAsGift ? (cartData.addAsGiftPrice || 250) : 0;
  const shippingCharge = cartData?.shippingCharge || 0;
  const subtotal = cartData?.grandTotal || 0;
  const finalGrandTotal = subtotal - couponDiscountAmount + giftWrappingCharge + shippingCharge;
  // console.log("subtotal amount = " ,subtotal)
  // console.log("total amount = " ,finalGrandTotal)

  return (
    <div>
      <Navbar page={"cart"} />
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
                          ₹{item.product.discountPrice * item.quantity}
                        </span>
                        <span className="text-base md:text-lg text-gray-400 line-through">
                          ₹{item.product.originalPrice * item.quantity}
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
                {/* pincode check option */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <button
                    onClick={() => setShowPincodeCheck(!showPincodeCheck)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MapPin size={20} className="text-blue-600" />
                      </div>
                      <span className="font-semibold text-sm">Check Delivery</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`transform transition-transform ${showPincodeCheck ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showPincodeCheck && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 6) {
                              setPincode(value);
                              setPincodeStatus(null);
                            }
                          }}
                          placeholder="Enter Pincode"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          maxLength={6}
                          disabled={pincodeChecking}
                        />
                        <Button
                          onClick={handleCheckPincode}
                          disabled={pincodeChecking || pincode.length !== 6}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
                        >
                          {pincodeChecking ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            'CHECK'
                          )}
                        </Button>
                      </div>

                      {pincodeStatus && (
                        <div className={`p-3 rounded-lg text-sm ${pincodeStatus.success
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                          <div className="flex items-center gap-2">
                            {pincodeStatus.success ? (
                              <Check size={16} />
                            ) : (
                              <X size={16} />
                            )}
                            <span>{pincodeStatus.message}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                    {isGiftWrapped ? (
                      <button
                        onClick={handleRemoveGiftWrapping}
                        className="text-red-600 border border-red-600 rounded-full px-3 py-1 text-xs font-semibold hover:bg-red-50 cursor-pointer transition-colors"
                      >
                        REMOVE
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowGiftDialog(true)}
                        className="text-green-600 border border-green-600 rounded-full px-3 py-1 text-xs font-semibold hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        + ADD
                      </button>
                    )}
                  </div>

                  {isGiftWrapped && (
                    <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Check size={16} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-800">Gift wrapping added</span>
                      </div>
                      {giftData.recipentName && (
                        <p className="text-xs text-purple-700">
                          To: {giftData.recipentName} | From: {giftData.senderName}
                        </p>
                      )}
                    </div>
                  )}
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
                {/* <div className="border-b border-gray-200 pb-4 mb-6">
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
                </div> */}

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

                  {isGiftWrapped && (
                    <div className="flex justify-between text-purple-600">
                      <span className="text-sm">Gift Wrapping</span>
                      <span className="font-semibold">+₹{giftWrappingCharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700">
                    <span className="text-sm">Shipping</span>
                    <span className="font-semibold text-green-600">
                      {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                    </span>
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

        <AlertDialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
          <AlertDialogContent className="max-w-md bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Add Gift Wrapping
              </AlertDialogTitle>
              <button
                onClick={() => setShowGiftDialog(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <AlertDialogDescription className="text-sm text-gray-600 mb-4">
              Make your gift extra special with our premium gift wrapping service for just ₹250
            </AlertDialogDescription>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={giftData.recipentName}
                  onChange={(e) => setGiftData({ ...giftData, recipentName: e.target.value })}
                  placeholder="Enter recipient's name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={savingGift}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sender Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={giftData.senderName}
                  onChange={(e) => setGiftData({ ...giftData, senderName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={savingGift}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gift Message (Optional)
                </label>
                <textarea
                  value={giftData.messageFromSender}
                  onChange={(e) => setGiftData({ ...giftData, messageFromSender: e.target.value })}
                  placeholder="Write a personalized message..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                  disabled={savingGift}
                />
              </div>
            </div>

            <AlertDialogFooter className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowGiftDialog(false)}
                disabled={savingGift}
                className="flex-1 py-2 border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddGiftWrapping}
                disabled={savingGift || !giftData.recipentName || !giftData.senderName}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingGift ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Save Gift Card'
                )}
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