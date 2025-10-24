'use client'
import React from 'react';
import { LogOut } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LogoutSection({ onCancel } : any) {
  const router = useRouter();

  const handleLogout = async () => {
   
      try {
       
        localStorage.removeItem("arttagUserId")
        localStorage.removeItem("arttagtoken")
       
        await signOut(auth);
     
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        console.error("Error signing out:", error);
        alert('Failed to logout. Please try again.');
      }
    
  };

  return (
    <CardContent className="p-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Logout</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-2">Are you sure you want to logout?</p>
          <p className="text-sm text-gray-600">You'll need to sign in again to access your account.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleLogout}
            className="h-10 bg-red-400 hover:bg-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Confirm Logout
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="h-10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </CardContent>
  );
}