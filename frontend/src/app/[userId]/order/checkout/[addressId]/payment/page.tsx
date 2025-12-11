'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, ShoppingBag, Truck, CheckCircle2, Package, Tag, Gift, CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/Navbar';

export default function CheckoutPage() {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    totalItem: 0,
    totalamount: 0,
    shippingCharge: 0,
    couponCode: null,
    couponDiscountPercentage: 0,
    isAddingAsGift: false,
    addAsGiftPrice: 0
  });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { userId, addressId } = useParams();
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

   
  
 
  const paymentMethods = [
    // {
    //   id: 'UPI',
    //   name: 'UPI',
    //   icon: <Smartphone className="w-6 h-6" />,
    //   offers: '2 Offers available',
    //   hasOffers: true
    // },
    // {
    //   id: 'DEBITCARD',
    //   name: 'Debit Card',
    //   icon: <CreditCard className="w-6 h-6" />,
    //   offers: '1 Offer available',
    //   hasOffers: true
    // },
    // {
    //   id: 'CREDITCARD',
    //   name: 'Credit Card',
    //   icon: <CreditCard className="w-6 h-6" />,
    //   offers: '1 Offer available',
    //   hasOffers: true
    // },
    // {
    //   id: 'PHONEPAY',
    //   name: 'PhonePe',
    //   icon: <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">₹</div>,
    //   offers: null,
    //   hasOffers: false
    // },
    // {
    //   id: 'PAYTM',
    //   name: 'Paytm',
    //   icon: <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">P</div>,
    //   offers: null,
    //   hasOffers: false
    // },
    // {
    //   id: 'NETBANKING',
    //   name: 'Net Banking',
    //   icon: <Banknote className="w-6 h-6" />,
    //   offers: null,
    //   hasOffers: false
    // },
    {
      id: 'CASEONDELIVERY',
      name: 'Cash on Delivery',
      icon: <Banknote className="w-6 h-6" />,
      offers: null,
      hasOffers: false
    }
  ];

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const fetchCartDetails = async () => {
    try {
      // Fetch cart items
      const cartResponse = await fetch(`${API_BASE_URL}/cart/${userId}/get/all/user/cart/product`);
      const cartData = await cartResponse.json();

      if (cartData.success) {
        setCartItems(cartData.cart || []);
      }

      // Fetch cart summary
      const summaryResponse = await fetch(`${API_BASE_URL}/cart/${userId}/cart/summary`);
      const summaryData = await summaryResponse.json();

      if (summaryData.success) {
        setOrderSummary({
          totalItem: summaryData.totalItem || 0,
          totalamount: summaryData.totalamount || 0,
          shippingCharge: summaryData.shippingCharge || 0,
          couponCode: summaryData.couponCode || null,
          couponDiscountPercentage: summaryData.couponDiscountPercentage || 0,
          isAddingAsGift: summaryData.isAddingAsGift || false,
          addAsGiftPrice: summaryData.addAsGiftPrice || 0
        });
      } else {
        setError(summaryData.message || 'Failed to load cart details');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load cart details. Please check your connection.');
      setLoading(false);
      console.error(err);
    }
  };

  const couponDiscountAmount = orderSummary.couponDiscountPercentage > 0
    ? Math.round((orderSummary.totalamount * orderSummary.couponDiscountPercentage) / 100)
    : 0;

  const amountAfterDiscount = orderSummary.totalamount - couponDiscountAmount;
  const grandTotal = amountAfterDiscount + orderSummary.shippingCharge + (orderSummary.isAddingAsGift ? orderSummary.addAsGiftPrice : 0);

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      setError('Please select a payment method');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calculate proper values for API
      const subtotalValue = orderSummary.totalamount; // Original total
      const discountValue = couponDiscountAmount || 0; // Discount amount (0 if no coupon)
      const shippingValue = orderSummary.shippingCharge || 0;
      const taxValue = 0;
      
      const orderData = {
        userId: userId,
        subtotal: subtotalValue,
        discountAmount: discountValue,
        shippingCharge: shippingValue,
        taxAmount: taxValue,
        cart: cartItems,
        addressId: addressId,
        paymentType: selectedPayment
      };

      console.log('Placing order with data:', orderData);

      const response = await fetch(`${API_BASE_URL}/order/place/user/new/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        // Delete all cart items after successful order
        try {
          const deleteResponse = await fetch(`${API_BASE_URL}/cart/delete/all/items/cart`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId })
          });

          const deleteData = await deleteResponse.json();
          
          if (!deleteData.success) {
            console.warn('Cart items could not be deleted:', deleteData.message);
            // Still proceed to success page even if cart deletion fails
          }
        } catch (deleteErr) {
          console.warn('Failed to delete cart items:', deleteErr);
          // Still proceed to success page even if cart deletion fails
        }

        // Redirect to order success page
        router.push(`/${userId}/order/success`);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
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
        <Spinner className='text-blue-700 text-5xl' />
        <p className="text-gray-600 text-sm">Loading payment options...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar></Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-teal-50 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                        selectedPayment === method.id
                          ? 'border-teal-600 bg-teal-50 shadow-md'
                          : 'border-slate-200 hover:border-teal-300 bg-white'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={method.id} id={method.id} className="border-2 flex-shrink-0" />
                        
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-slate-700 flex-shrink-0">
                            {method.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={method.id} className="font-bold text-slate-900 text-base cursor-pointer block">
                              {method.name}
                            </Label>
                            {method.hasOffers && (
                              <p className="text-sm text-teal-600 font-medium mt-1">{method.offers}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Link href={`/${userId}/cart`} className="inline-block">
              <Button
                variant="ghost"
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-2 font-semibold text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                Back to Cart
              </Button>
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-teal-50">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Package className="w-4 h-4" />
                      <span>Items ({orderSummary.totalItem})</span>
                    </div>
                    <span className="font-semibold text-slate-900">₹{orderSummary.totalamount.toLocaleString()}</span>
                  </div>

                  {orderSummary.couponDiscountPercentage > 0 && (
                    <>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-800 text-sm">Coupon Applied</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-700 font-medium">{orderSummary.couponCode}</span>
                          <span className="flex items-center gap-1 text-green-700 font-bold">
                            {orderSummary.couponDiscountPercentage}% OFF
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-green-200 mt-2">
                          <span className="text-sm text-slate-600">Discount Amount</span>
                          <span className="font-bold text-green-600">-₹{couponDiscountAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Subtotal After Discount</span>
                        <span className="font-bold text-green-600">₹{amountAfterDiscount.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Truck className="w-4 h-4" />
                      <span>Delivery</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {orderSummary.shippingCharge === 0 ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        `₹${orderSummary.shippingCharge.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {orderSummary.isAddingAsGift && (
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border-2 border-pink-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-pink-600" />
                          <div>
                            <span className="font-bold text-pink-800 text-sm block">Gift Packaging</span>
                            <span className="text-xs text-slate-600">Premium gift wrap included</span>
                          </div>
                        </div>
                        <span className="font-bold text-pink-600">₹{orderSummary.addAsGiftPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-400">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-lg font-bold text-slate-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-900">₹{grandTotal.toLocaleString()}</span>
                    </div>
                    {orderSummary.couponDiscountPercentage > 0 && (
                      <p className="text-xs text-green-700 font-medium mt-1">
                        You saved ₹{couponDiscountAmount.toLocaleString()} with this coupon!
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">All taxes included</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed py-6 text-base font-bold"
                  onClick={handlePlaceOrder}
                  disabled={!selectedPayment || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : selectedPayment ? (
                    <>
                      Place Order
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    'Select Payment Method'
                  )}
                </Button>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>100% Secure payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Easy returns & refunds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
   
  );
}