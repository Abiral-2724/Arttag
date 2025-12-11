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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  useEffect(() => {
    if (localStorage.getItem("arttagUserId")) {
      if (localStorage.getItem("arttagUserId") !== userId) {
        if (localStorage.getItem("arttagUserId")) {
          localStorage.removeItem("arttagUserId")

        }
        if (localStorage.getItem("arttagtoken")) {
          localStorage.removeItem("arttagtoken")
        }
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [userId])

  const [activeSection, setActiveSection] = useState('personal');
  const [userData, setUserData] = useState({});
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [alert, setAlert]: any = useState(null);

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

  const showAlert = (message: any, type = 'success') => {
    setAlert({ message, type });
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

        <div className='flex flex-col items-center gap-2'>
          <div className='flex items-center gap-2'>
            <p className="text-gray-600 text-sm">Loading your profile</p>
            <UserRoundPen className="w-5 h-5 text-gray-600" />
          </div>

          <Spinner className='text-blue-700 text-5xl' />
        </div>
      </div>
    );
  }

  return (
    <div>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-0 py-3">
            <div className="flex items-center text-sm text-gray-600">
              <Link href={'/'}>
                <div className="flex items-center gap-2">
                  <div className="w-auto h-10">
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

            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {alert && (
            <Alert className={`mb-6 border ${alert.type === 'error'
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
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isActive
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