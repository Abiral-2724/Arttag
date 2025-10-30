'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Loader2, Edit, Plus, ShoppingBag, Truck, CreditCard, CheckCircle2, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    totalItem: 0,
    totalamount: 0,
    shippingCharge: 0
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

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
          shippingCharge: data.shippingCharge
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

  const getSelectedAddressDetails = () => {
    return addresses.find((addr : any) => addr.id === selectedAddress);
  };

  const grandTotal = orderSummary.totalamount + orderSummary.shippingCharge;

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
        grandTotal
      }
    };
    
    console.log('Proceeding to payment with:', orderData);
  };

  if (loading) {
    return (
      <div>

      
        <Navbar></Navbar>
         <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium">
                <Spinner className='text-blue-700 text-5xl'></Spinner>
                <p className="text-gray-600 text-sm">Loading order summary</p>
              </div>  
      
              </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
     <Navbar></Navbar>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="text-black">
                <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-4">
                      <MapPin className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Address Found</h3>
                    <p className="text-slate-600 mb-6">Add a delivery address to continue</p>
                    <Button 
                      onClick={handleAddAddress} 
                      className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 px-8 py-6 text-base"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Delivery Address
                    </Button>
                  </div>
                ) : (
                  <>
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3">
                      {addresses.map((address : any) => (
                        <div 
                          key={address.id} 
                          className={`relative flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md ${
                            selectedAddress === address.id 
                              ? 'border-teal-600 bg-teal-50 shadow-md' 
                              : 'border-slate-200 hover:border-teal-300 bg-white'
                          }`}
                        >
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1 border-2" />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900 text-lg">{address.fullname}</span>
                              {selectedAddress === address.id && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                              <p>{address.streetAddress}, {address.locality}</p>
                              {address.landmark && <p className="text-slate-500">{address.landmark}</p>}
                              <p className="font-medium text-slate-700">{address.city}, {address.state} {address.pincode}</p>
                              <p className="flex items-center gap-1 mt-2 text-slate-700">
                                <span className="font-medium">Mobile:</span> {address.mobile}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 p-0 h-auto mt-3 font-semibold"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditAddress(address);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit Address
                            </Button>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button 
                      onClick={handleAddAddress} 
                      variant="outline" 
                      className="w-full mt-6 border-2 border-dashed py-6 text-base font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Address
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

                <Link href={`/${userId}/cart`}>
                <Button 
              variant="ghost" 
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-2 font-semibold text-base"
            >
              <ArrowLeft className="w-5 h-5" />
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

                  <div className="bg-blue-100 rounded-lg p-4 border border-blue-400">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-lg font-bold text-slate-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-900">₹{grandTotal.toLocaleString()}</span>
                    </div>
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