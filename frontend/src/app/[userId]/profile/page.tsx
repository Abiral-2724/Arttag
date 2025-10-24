'use client'
import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Loader2, CheckCircle2, UserRoundPen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import PersonalInfoSection from '@/components/PersonalInfoSection';
import AddressSection from '@/components/AddressSection';
import OrderSection from '@/components/OrderSection';
import WishlistSection from '@/components/WishlistSection';
import LogoutSection from '@/components/LogoutSection';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import FooterPart from '@/components/FooterPart';

// import PersonalInfoSection from './components/PersonalInfoSection';
// import AddressSection from './components/AddressSection';
// import OrderSection from './components/OrderSection';
// import WishlistSection from './components/WishlistSection';
// import LogoutSection from './components/LogoutSection';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function ProfilePage() {
    const { userId } = useParams();
    const router = useRouter();
    useEffect(() => {
        if(localStorage.getItem("arttagUserId")){
            if(localStorage.getItem("arttagUserId") !== userId){
                if(localStorage.getItem("arttagUserId")){
                    localStorage.removeItem("arttagUserId")
                    
                }
                if(localStorage.getItem("arttagtoken")){
                    localStorage.removeItem("arttagtoken")
                }
                router.push('/login')
            }
        }else{
            router.push('/login')
        }
    },[userId])
 
  const [activeSection, setActiveSection] = useState('personal');
  const [userData, setUserData] = useState({});
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setPageLoading(true);
    await Promise.all([
      fetchUserData(),
      fetchOrders(),
      fetchAddresses(),
      fetchWishlist()
    ]);
    setPageLoading(false);
  };

  const showAlert = (message : any, type = 'success') => {
    setAlert({ message , type });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}/get/profile`);
      setUserData(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showAlert('Failed to load profile data', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/order/${userId}/get/all/orders`);
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/user/${userId}/get/address`);
      if (data.success) setAddresses(data.address);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/wishlist/${userId}/get/all/items/wishlist`);
      if (data.success) setWishlist(data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const menuItems = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'address', label: 'Address Book', icon: MapPin },
    { id: 'order', label: 'Order', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  if (pageLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium">
            <Spinner className='text-blue-700 text-5xl'></Spinner>
            <div className='flex gap-2'> 
            <p className="text-gray-600 text-sm">Loading your profile</p>
            <UserRoundPen />
            </div>
            
          </div>
    );
  }

  return (
    <div>

<div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href={"/"}>
            <Button className='bg-blue-700 text-white'>Home</Button>
            </Link>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {alert && (
          <Alert className={`mb-6 border ${
            alert.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="font-medium ml-2">
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Overview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm">
              <div className="divide-y divide-gray-200">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                        isActive 
                          ? 'bg-black text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="border border-gray-200 shadow-sm">
              {activeSection === 'personal' && (
                <PersonalInfoSection
                  userData={userData}
                  userId={userId}
                  onUpdate={fetchUserData}
                  showAlert={showAlert}
                />
              )}

              {activeSection === 'address' && (
                <AddressSection
                  addresses={addresses}
                  userId={userId}
                  onUpdate={fetchAddresses}
                  showAlert={showAlert}
                />
              )}

              {activeSection === 'order' && (
                <OrderSection
                  orders={orders}
                  showAlert={showAlert}
                />
              )}

              {activeSection === 'wishlist' && (
                <WishlistSection
                  wishlist={wishlist}
                  userId={userId}
                  onUpdate={fetchWishlist}
                  showAlert={showAlert}
                />
              )}

              {activeSection === 'logout' && (
                <LogoutSection
                  onCancel={() => setActiveSection('personal')}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
      
    </div>
   
    <div className="border-t border-gray-300 my-0"></div>
<FooterPart></FooterPart>
    </div>
   
  );
}