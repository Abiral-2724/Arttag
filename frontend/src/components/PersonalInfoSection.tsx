import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';

const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL ;

export default function PersonalInfoSection({ userData, userId, onUpdate, showAlert } : any) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: userData?.name || '', 
    email: userData?.email || ''
  });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/user/${userId}/edit/profile`, form);
      if (data.success) {
        showAlert('Profile updated successfully');
        setIsEditing(false);
        onUpdate();
      }
    } catch (error : any) {
      showAlert(error.response?.data?.message || 'Failed to update profile', 'error');
    }
    setLoading(false);
  };

  return (
    <CardContent className="p-8">
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  className="mt-1.5"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  className="mt-1.5"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-base text-gray-900">{userData?.name || 'Add your name'}</p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setIsEditing(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  Edit
                </Button>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="text-base text-gray-900">{userData?.phoneNumber}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-base text-gray-900">{userData?.email || 'Add your email'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
}