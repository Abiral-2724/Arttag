import React, { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from 'axios';
import AddressForm from './AddressForm';

const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL ;

export default function AddressSection({ addresses, userId, onUpdate, showAlert } : any) {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleDelete = async (addressId : any) => {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/user/${userId}/delete/address`, {
        data: { addressId }
      });
      if (data.success) {
        showAlert('Address deleted successfully');
        onUpdate();
      }
    } catch (error : any) {
      showAlert(error.response?.data?.message || 'Failed to delete address', 'error');
    }
  };

  const openEditAddress = (address : any) => {
    setEditingAddress(address);
  };

  const closeDialog = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  return (
    <CardContent className="p-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Address Book</h2>
          <Dialog open={isAddingAddress || editingAddress !== null} onOpenChange={(open) => {
            if (!open) closeDialog();
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsAddingAddress(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-yellow-50">
              <DialogHeader className="px-8 pt-8 pb-6 border-b bg-gray-50">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 mt-2">
                  {editingAddress 
                    ? 'Update your address information below' 
                    : 'Fill in the address details to add a new delivery location'}
                </DialogDescription>
              </DialogHeader>
              <div className="px-8 py-6">
                <AddressForm
                  userId={userId}
                  address={editingAddress}
                  onSuccess={() => {
                    closeDialog();
                    onUpdate();
                  }}
                  showAlert={showAlert}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No addresses saved yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((addr : any) => (
              <Card key={addr.id} className="border border-gray-200 hover:border-gray-300 transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{addr.fullname}</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditAddress(addr)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(addr.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{addr.streetAddress}, {addr.locality}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>{addr.country}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  );
}