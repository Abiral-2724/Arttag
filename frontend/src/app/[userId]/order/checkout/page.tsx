'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Loader2, Edit, Plus, ShoppingBag, Truck, CreditCard, CheckCircle2, Package, Tag, Percent, Gift } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';

export default function CheckoutPage() {
  const [addresses, setAddresses]: any = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    totalItem: 0,
    totalamount: 0,
    shippingCharge: 0,
    couponCode: null,
    couponDiscountPercentage: 0,
    isAddingAsGift: false,
    addAsGiftPrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    addressId: '',
    fullname: '',
    email: '',
    mobile: '',
    pincode: '',
    city: '',
    state: '',
    country: '',
    streetAddress: '',
    locality: '',
    landmark: '',
    GSTIN: ''
  });

  const { userId } = useParams();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchAddresses();
    fetchCartDetails();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/get/address`);
      const data = await response.json();

      if (data.success) {
        setAddresses(data.address);
        if (data.address.length > 0) {
          setSelectedAddress(data.address[0].id);
        }
      } else {
        setError(data.message || 'Failed to load addresses');
      }
    } catch (err) {
      setError('Failed to load addresses. Please check your connection.');
      console.error(err);
    }
  };

  const fetchCartDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/cart/summary`);
      const data = await response.json();

      if (data.success) {
        setOrderSummary({
          totalItem: data.totalItem,
          totalamount: data.totalamount,
          shippingCharge: data.shippingCharge,
          couponCode: data.couponCode || null,
          couponDiscountPercentage: data.couponDiscountPercentage || 0,
          isAddingAsGift: data.isAddingAsGift || false,
          addAsGiftPrice: data.addAsGiftPrice || 0
        });
      } else {
        setError(data.message || 'Failed to load cart details');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load cart details. Please check your connection.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleAddAddress = () => {
    setEditMode(false);
    setFormData({
      addressId: '',
      fullname: '',
      email: '',
      mobile: '',
      pincode: '',
      city: '',
      state: '',
      country: '',
      streetAddress: '',
      locality: '',
      landmark: '',
      GSTIN: ''
    });
    setDialogOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditMode(true);
    setFormData({
      addressId: address.id,
      fullname: address.fullname || '',
      email: address.email || '',
      mobile: address.mobile || '',
      pincode: address.pincode || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || '',
      streetAddress: address.streetAddress || '',
      locality: address.locality || '',
      landmark: address.landmark || '',
      GSTIN: address.GSTIN || ''
    });
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = async () => {
    setSubmitting(true);
    setError('');

    const requiredFields = ['fullname', 'email', 'mobile', 'pincode', 'city', 'state', 'country', 'streetAddress', 'locality'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    if (formData.mobile.length !== 13) {
      setError('Phone number must be 13 characters (+91XXXXXXXXXX)');
      setSubmitting(false);
      return;
    }

    if (formData.mobile[0] !== '+') {
      setError('Phone number must start with +');
      setSubmitting(false);
      return;
    }

    if (formData.pincode.length !== 6) {
      setError('Pincode must be 6 digits');
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = editMode
        ? `${API_BASE_URL}/user/${userId}/modify/address`
        : `${API_BASE_URL}/user/${userId}/add/address`;

      const response = await fetch(endpoint, {
        method: editMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setDialogOpen(false);
        fetchAddresses();
        setError('');
      } else {
        setError(data.message || 'Failed to save address');
      }
    } catch (err) {
      setError('Failed to save address. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  const router = useRouter();
  const pathname = usePathname(); 
  const getSelectedAddressDetails = () => {
    return addresses.find((addr: any) => addr.id === selectedAddress);
  };

  // Calculate coupon discount amount
  const couponDiscountAmount = orderSummary.couponDiscountPercentage > 0
    ? Math.round((orderSummary.totalamount * orderSummary.couponDiscountPercentage) / 100)
    : 0;


  // Calculate amount after discount
  const amountAfterDiscount = orderSummary.totalamount - couponDiscountAmount;

  // Calculate grand total (including gift charge if applicable)
  const grandTotal = amountAfterDiscount + orderSummary.shippingCharge + (orderSummary.isAddingAsGift ? orderSummary.addAsGiftPrice : 0);
  const handleContinue = () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }
    
    const orderData = {
      shippingAddress: getSelectedAddressDetails(),
      billingAddress: getSelectedAddressDetails(),
      orderSummary: {
        ...orderSummary,
        couponDiscountAmount,
        amountAfterDiscount,
        grandTotal
      }
    };

router.push(`${pathname}/${selectedAddress}/payment`)

    console.log('Proceeding to payment with:', orderData);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-[18%] gap-2 text-lg font-medium">
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
          <p className="text-gray-600 text-sm">Loading order summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="text-black p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span>Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 md:py-16 px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-100 mb-4">
                      <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">No Address Found</h3>
                    <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">Add a delivery address to continue</p>
                    <Button
                      onClick={handleAddAddress}
                      className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add Delivery Address
                    </Button>
                  </div>
                ) : (
                  <>
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3 sm:space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`relative p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 ${selectedAddress === address.id
                              ? 'border-teal-600 bg-teal-50 shadow-md'
                              : 'border-slate-200 hover:border-teal-300 bg-white'
                            }`}
                        >
                          <div className="flex gap-3 sm:gap-4">
                            {/* Radio Button */}
                            <div className="pt-1">
                              <RadioGroupItem value={address.id} id={address.id} className="border-2 flex-shrink-0" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Name and Selected Badge Row */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <Label htmlFor={address.id} className="font-bold text-slate-900 text-base sm:text-lg break-words cursor-pointer">
                                  {address.fullname}
                                </Label>
                                {selectedAddress === address.id && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold whitespace-nowrap flex-shrink-0">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Selected
                                  </span>
                                )}
                              </div>

                              {/* Address Details */}
                              <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-1">
                                <p className="break-words">{address.streetAddress}, {address.locality}</p>
                                {address.landmark && (
                                  <p className="text-slate-500 break-words">{address.landmark}</p>
                                )}
                                <p className="font-medium text-slate-700 break-words">
                                  {address.city}, {address.state} {address.pincode}
                                </p>
                                <p className="text-slate-700 pt-1">
                                  <span className="font-medium">Mobile:</span> {address.mobile}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Edit Button - Positioned at bottom right */}
                          <div className="flex justify-end mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 px-2 py-1 h-auto font-semibold text-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditAddress(address);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1 flex-shrink-0" />
                              Edit Address
                            </Button>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button
                      onClick={handleAddAddress}
                      variant="outline"
                      className="w-full mt-4 sm:mt-6 border-2 border-dashed border-slate-300 hover:border-teal-600 hover:bg-teal-50 py-5 sm:py-6 text-sm sm:text-base font-semibold"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add New Address
                    </Button>
                  </>
                )}
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
              <CardHeader className="text-black">
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

                  {/* Coupon Discount Section - Only show if discount > 0 */}
                  {orderSummary.couponDiscountPercentage > 0 && (
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
                  )}

                  {/* Amount After Discount - Only show if discount > 0 */}
                  {orderSummary.couponDiscountPercentage > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-slate-600 font-medium">Subtotal After Discount</span>
                      <span className="font-bold text-green-600">₹{amountAfterDiscount.toLocaleString()}</span>
                    </div>
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

                  {/* Gift Add-on Section - Only show if gift is added */}
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

                  <div className="bg-blue-100 rounded-lg p-4 border border-blue-400">
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
                  className="w-full bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleContinue}
                  disabled={!selectedAddress}
                >
                  {selectedAddress ? (
                    <>
                      Continue to Payment
                      <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                    </>
                  ) : (
                    'Select Address to Continue'
                  )}
                </Button>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Secure checkout</span>
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

      {/* Add/Edit Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-teal-600" />
              {editMode ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {editMode ? 'Update your delivery address details.' : 'Fill in your delivery address information.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-slate-700 font-semibold">Full Name *</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-slate-700 font-semibold">Mobile Number *</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+919876543210"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress" className="text-slate-700 font-semibold">Street Address *</Label>
              <Input
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                placeholder="House No., Building Name"
                className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality" className="text-slate-700 font-semibold">Locality *</Label>
              <Input
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                placeholder="Area, Colony"
                className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark" className="text-slate-700 font-semibold">Landmark</Label>
              <Input
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Nearby landmark (optional)"
                className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-700 font-semibold">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-slate-700 font-semibold">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-700 font-semibold">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-slate-700 font-semibold">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="GSTIN" className="text-slate-700 font-semibold">GSTIN (Optional)</Label>
              <Input
                id="GSTIN"
                name="GSTIN"
                value={formData.GSTIN}
                onChange={handleInputChange}
                placeholder="GST Identification Number"
                className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-blue-600 ml-1 text-white"
                onClick={handleSubmitAddress}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editMode ? 'Update Address' : 'Add Address'}
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}