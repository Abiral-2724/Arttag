import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-v628.onrender.com/api/v1';

const initialFormState = {
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
};

export default function AddressForm({ userId, address, onSuccess, showAlert } : any) {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setForm({
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
    }
  }, [address]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = address 
        ? `${API_BASE_URL}/user/${userId}/modify/address`
        : `${API_BASE_URL}/user/${userId}/add/address`;
      
      const payload = address 
        ? { addressId: address.id, ...form }
        : form;

      const method = address ? 'patch' : 'post';
      const { data } = await axios[method](url, payload);
      
      if (data.success) {
        showAlert(address ? 'Address updated successfully' : 'Address added successfully');
        onSuccess();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (error : any) {
      showAlert(error.response?.data?.message || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleChange = (field : any, value : any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b pb-2">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="Enter full name"
              value={form.fullname} 
              onChange={(e) => handleChange('fullname', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email Address *</Label>
            <Input 
              type="email" 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="your.email@example.com"
              value={form.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700">Mobile Number *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="+91 XXXXXXXXXX"
              value={form.mobile} 
              onChange={(e) => handleChange('mobile', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Address Details Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b pb-2">
          Address Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700">Street Address *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="House/Flat No., Building Name, Street"
              value={form.streetAddress} 
              onChange={(e) => handleChange('streetAddress', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Locality *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="Area, Sector"
              value={form.locality} 
              onChange={(e) => handleChange('locality', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Landmark</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="Near metro station, mall, etc."
              value={form.landmark} 
              onChange={(e) => handleChange('landmark', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">City *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="Enter city"
              value={form.city} 
              onChange={(e) => handleChange('city', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">State *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="Enter state"
              value={form.state} 
              onChange={(e) => handleChange('state', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Pincode *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="6 digit pincode"
              value={form.pincode} 
              onChange={(e) => handleChange('pincode', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Country *</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="Enter country"
              value={form.country} 
              onChange={(e) => handleChange('country', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Business Information Section (Optional) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b pb-2">
          Business Information (Optional)
        </h3>
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">GSTIN</Label>
            <Input 
              className="h-11 border-gray-300 focus:border-black focus:ring-black" 
              placeholder="GST Identification Number"
              value={form.GSTIN} 
              onChange={(e) => handleChange('GSTIN', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t">
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="w-full bg-black hover:bg-gray-800 text-white h-12 text-base font-medium rounded-lg transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            address ? 'Update Address' : 'Add Address'
          )}
        </Button>
      </div>
    </div>
  );
}