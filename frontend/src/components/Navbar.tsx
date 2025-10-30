'use client'
import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown, ChevronRight, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from './ui/button';

type Props = {
  userId?: string;
  cartCount?: number;
}

const navItems = [
  {
    name: 'Tech Essentials',
    items: ['Hard Drives', '4-in-1 Cable', 'Wireless Chargers', 'Essential Connectors' ,'Keyboard & Mouse'],
    id : "cfd5c887-cfc6-4224-9da6-bb8fc85096a1"
  },
  {
    name: 'Travel Essentials',
    items: ['Backpacks', 'Pouches', 'Travel Organizers', 'Table Organizers'],
    id : "e60bc235-8d04-4c31-b229-ba3a71f25fb0"
  },
  {
    name: 'Lifestyle Accessories',
    items: ['Keychains', 'Wallets', 'Female Handbags', 'Water Bottles', 'Stationery'] ,
    id : "8c9213f1-2ce7-4066-80f1-3dad45afab17"
  },
  {
    name: 'Creative Add-Ons',
    items: ['Skins', 'Stickers', 'Limited Edition Art Prints'],
    id : "6578853f-a315-4c27-acd2-d1ca33f55135"
  },
  {
    name: 'All CATEGORY',
    items: []
  }
];
  const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL ;

const Navbar = ({page} : any) => {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin ,setIsAdmin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("arttagtoken");
        const id = localStorage.getItem("arttagUserId");
        
        // Check if user is authenticated
        if (token && id) {
          setUserId(id);
          setIsAuthenticated(true);
          checkAdmin(id);
          fetchCartCount(id);
        } else {
          setUserId(null);
          setIsAuthenticated(false);
        }
      }, []);
    
    const checkAdmin = async (id: string) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/${id}/get/profile`);
        if (response.data.user.role === "ADMIN") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    const fetchCartCount = async (id: string) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/cart/${id}/get/product/total/count`);
          if (response.data.success) {
            setCartCount(response.data.totalCount);
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      };

      const handleAdminPage = () => {
        if (userId) {
          router.push(`/${userId}/admin`);
        }
      };

      const handleLoginClick = () => {
        router.push('/login');
      };

      const handleCartClick = () => {
        if (userId) {
          router.push(`/${userId}/cart`);
        } else {
          router.push('/login');
        }
      };

      const handleProfileClick = () => {
        if (userId) {
          router.push(`/${userId}/profile`);
        } else {
          router.push('/login');
        }
      };

      const toggleCategory = (idx: number) => {
        setExpandedCategory(expandedCategory === idx ? null : idx);
      };

  return (
    <div>
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
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

            {/* Desktop Navigation */}
            {
                page !== "cart" && (
                    <nav className="hidden xl:flex items-center gap-4 2xl:gap-6">
                    {navItems.map((item, idx) => (
                      <DropdownMenu key={idx}>
                        <DropdownMenuTrigger 
                          className="group flex items-center text-[13px] 2xl:text-[14px] font-light text-black tracking-wide hover:text-teal-600 transition-all outline-none relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-[3px] after:bg-teal-600 after:transition-all hover:after:w-full data-[state=open]:text-teal-600 data-[state=open]:after:w-full"
                          onMouseEnter={(e) => e.currentTarget.click()}
                        >
                          {item.name}
                          <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          className="w-60 mt-3 bg-white border-0 shadow-2xl rounded-xl p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200"
                          onMouseLeave={(e) => {
                            const trigger : any = e.currentTarget.previousElementSibling;
                            if (trigger) trigger.click();
                          }}
                        >
                          <div className="mb-1 px-3 pt-2 pb-3 border-b border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider">
                              {item.name}
                            </h3>
                          </div>
                          <div className="space-y-1">
                            {item.items.map((subItem, subIdx) => (
                              <DropdownMenuItem 
                                key={subIdx} 
                                className="cursor-pointer px-4 py-3 text-[15px] font-medium text-gray-900 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 rounded-lg transition-all group/item"
                              >
                                <span className="flex items-center justify-between w-full">
                                  {subItem}
                                  <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity text-teal-600" />
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </div>
                          <DropdownMenuItem className="mt-3 pt-3 px-4 py-3 cursor-pointer rounded-lg transition-all text-[14px] font-semibold bg-blue-700 text-white shadow-lg hover:shadow-xl">
  {item.name === "All CATEGORY" ? (
     <Link
     href={`/allcategory`}
     className="flex items-center justify-center w-full gap-2"
   >
     View All
     <ChevronRight className="w-4 h-4" />
   </Link>
  ) : (
    <Link
      href={`/product/category/${item.id}`}
      className="flex items-center justify-center w-full gap-2"
    >
      View All
      <ChevronRight className="w-4 h-4" />
    </Link>
  )}
</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ))}
                  </nav>
                )
            }

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-4 lg:gap-7">
                {isAuthenticated ? (
                  <>
                    {page !== "cart" && (
                      <button className="relative" onClick={handleCartClick}>
                        <ShoppingCart className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    )}
                    
                    <button onClick={handleProfileClick}>
                      <User className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
                    </button>
                    
                    {page !== "cart" && (
                      <button>
                        <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
                      </button>
                    )}

                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        onClick={handleAdminPage} 
                        className='bg-blue-600 text-white text-xs lg:text-sm px-3 lg:px-4'
                      >
                        Admin
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {page !== "cart" && (
                      <button>
                        <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
                      </button>
                    )}
                    
                    <Button 
                      onClick={handleLoginClick}
                      className='bg-blue-700 text-white font-light text-sm px-3 lg:px-5 py-2'
                    >
                      Login
                    </Button>
                  </>
                )}
            </div>

            {/* Mobile Icons & Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              {isAuthenticated && page !== "cart" && (
                <button className="relative" onClick={handleCartClick}>
                  <ShoppingCart className="w-5 h-5 text-black stroke-[1.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-black" />
                ) : (
                  <Menu className="w-6 h-6 text-black" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Items */}
              {page !== "cart" && navItems.map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() => toggleCategory(idx)}
                    className="flex items-center justify-between w-full py-3 text-sm font-medium text-black"
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === idx ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedCategory === idx && (
                    <div className="pl-4 space-y-2 mt-2">
                      {item.items.map((subItem, subIdx) => (
                        <div key={subIdx} className="py-2 text-sm text-gray-700">
                          {subItem}
                        </div>
                      ))}
                      {item.id && (
                        <Link
                          href={`/product/category/${item.id}`}
                          className="block mt-2 py-2 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-bold rounded-lg text-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          View All
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile User Actions */}
              <div className="pt-4 space-y-3 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => {
                        handleProfileClick();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full py-3 text-sm font-medium text-black"
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </button>
                    
                    {page !== "cart" && (
                      <button className="flex items-center gap-3 w-full py-3 text-sm font-medium text-black">
                        <Search className="w-5 h-5" />
                        Search
                      </button>
                    )}

                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleAdminPage();
                          setMobileMenuOpen(false);
                        }} 
                        className='w-full bg-blue-600 text-white'
                      >
                        Admin Panel
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {page !== "cart" && (
                      <button className="flex items-center gap-3 w-full py-3 text-sm font-medium text-black">
                        <Search className="w-5 h-5" />
                        Search
                      </button>
                    )}
                    
                    <Button 
                      onClick={() => {
                        handleLoginClick();
                        setMobileMenuOpen(false);
                      }}
                      className='w-full bg-blue-600 text-white py-3'
                    >
                      Login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}

export default Navbar