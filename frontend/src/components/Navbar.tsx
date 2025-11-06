'use client'
import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, Search, ShoppingCart, User, Menu, X, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';

type Props = {
  userId?: string;
  cartCount?: number;
}

const navItems = [
  {
    name: 'TECH ACCESSORIES',
    items: [
      { name: 'Mackbook', link: '/product/category/cfd5c887-cfc6-4224-9da6-bb8fc85096a1/subcategory/34de1f5c-4dc1-4f78-b9dd-9ee22d2d9618/TECH%20ACCESSORIES' },
      { name: 'PHONE CASES', link: '/product/category/cfd5c887-cfc6-4224-9da6-bb8fc85096a1/subcategory/2367fc28-9e11-4cf6-9500-1c32101652a9/TECH%20ACCESSORIES' },
      { name: 'STANDS', link: '/product/category/cfd5c887-cfc6-4224-9da6-bb8fc85096a1/subcategory/388bbc7d-9204-4f56-be69-9fe6ce3ac91b/TECH%20ACCESSORIES' },
      // { name: 'Essential Connectors', link: '/products/essential-connectors' },
      // { name: 'Keyboard & Mouse', link: '/products/keyboard-mouse' }
    ],
    id: "cfd5c887-cfc6-4224-9da6-bb8fc85096a1"
  },
  {
    name: 'BAGS & WALLETS',
    items: [
      { name: 'Backpacks', link: '/product/category/e60bc235-8d04-4c31-b229-ba3a71f25fb0/subcategory/14e1bb91-105f-49c5-9a30-0ed73dcbec64/BAGS%20&%20WALLETS' },
      { name: 'Wallets', link: '/product/category/e60bc235-8d04-4c31-b229-ba3a71f25fb0/subcategory/f3c079fc-1321-461b-bf04-a747c8497745/BAGS%20&%20WALLETS' },
    
    ],
    id: "e60bc235-8d04-4c31-b229-ba3a71f25fb0"
  },
  {
    name: 'WORK ESSENTIALS',
    items: [
      { name: 'DESKS', link: '/product/category/8c9213f1-2ce7-4066-80f1-3dad45afab17/subcategory/ae1a8dd8-4398-4637-a3ab-22dbfd110150/WORK%20ESSENTIALS' },
      // { name: 'Wallets', link: '/products/wallets' },
      // { name: 'Female Handbags', link: '/products/female-handbags' },
      // { name: 'Water Bottles', link: '/products/water-bottles' },
      // { name: 'Stationery', link: '/products/stationery' }
    ],
    id: "8c9213f1-2ce7-4066-80f1-3dad45afab17"
  },
  {
    name: 'SHOP BY APPLE',
    items: [
      { name: 'Phone', link: '/product/category/6578853f-a315-4c27-acd2-d1ca33f55135/subcategory/387f9538-2286-44fd-a5b5-fd87ea383629/SHOP%20BY%20APPLE' },
      { name: 'Iphone', link: '/product/category/6578853f-a315-4c27-acd2-d1ca33f55135/subcategory/8eaf3dad-86bf-49fd-af56-7e2a0b96ac63/SHOP%20BY%20APPLE' },
      { name: 'MackBook', link: '/product/category/6578853f-a315-4c27-acd2-d1ca33f55135/subcategory/42fa8c63-45c0-48b5-8bf4-049d37ca55aa/SHOP%20BY%20APPLE' }
    ],
    id: "6578853f-a315-4c27-acd2-d1ca33f55135"
  },
  {
    name: 'All CATEGORY',
    items: [],
    link: '/allcategory'
  }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Navbar = ({ page }: any) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("arttagtoken");
    const id = localStorage.getItem("arttagUserId");

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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
            {page !== "cart" && (
              <nav className="hidden xl:flex items-center gap-4 2xl:gap-6">
                {navItems.map((item, idx) => (
                  item.items.length > 0 ? (
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger
                        className="group flex items-center gap-1 text-[13px] 2xl:text-[14px] font-medium text-gray-700 tracking-wide hover:text-teal-600 transition-all outline-none relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-teal-600 after:to-cyan-600 after:transition-all hover:after:w-full data-[state=open]:text-teal-600 data-[state=open]:after:w-full"
                        onMouseEnter={(e) => e.currentTarget.click()}
                      >
                        {item.name}
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]:rotate-180" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-64 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 animate-in fade-in-0 slide-in-from-top-2 duration-200"
                        onMouseLeave={(e) => {
                          const trigger: any = e.currentTarget.previousElementSibling;
                          if (trigger) trigger.click();
                        }}
                      >
                        <div className="mb-2 px-4 pt-3 pb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-teal-600" />
                            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                              {item.name}
                            </h3>
                          </div>
                          <div className="h-px bg-gradient-to-r from-teal-500 to-cyan-500 mt-2" />
                        </div>
                        <div className="space-y-1 max-h-[400px] overflow-y-auto">
                          {item.items.map((subItem, subIdx) => (
                            <Link key={subIdx} href={subItem.link}>
                              <DropdownMenuItem
                                className="cursor-pointer px-4 py-3 text-[14px] font-medium text-gray-800 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 rounded-xl transition-all group/item"
                              >
                                <span className="flex items-center justify-between w-full">
                                  <span>{subItem.name}</span>
                                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-teal-600" />
                                </span>
                              </DropdownMenuItem>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <Link href={item.id ? `/product/category/${item.id}` : '/allcategory'}>
                            <DropdownMenuItem className="px-4 py-3 cursor-pointer rounded-xl transition-all text-[13px] font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md hover:shadow-lg hover:from-teal-700 hover:to-cyan-700">
                              <span className="flex items-center justify-center w-full gap-2">
                                View All {item.name}
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </DropdownMenuItem>
                          </Link>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link key={idx} href={item.link || '/allcategory'}>
                      <button className="text-[13px] 2xl:text-[14px] font-medium text-gray-700 tracking-wide hover:text-teal-600 transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-teal-600 after:to-cyan-600 after:transition-all hover:after:w-full">
                        {item.name}
                      </button>
                    </Link>
                  )
                ))}
              </nav>
            )}

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-4 lg:gap-7">
              {isAuthenticated ? (
                <>
                  {page !== "cart" && (
                    <button className="relative group" onClick={handleCartClick}>
                      <ShoppingCart className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-gray-700 stroke-[1.5] group-hover:text-teal-600 transition-colors" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold shadow-lg">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button onClick={handleProfileClick} className="group">
                    <User className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-gray-700 stroke-[1.5] group-hover:text-teal-600 transition-colors" />
                  </button>

                  {page !== "cart" && (
                    <button className="group">
                      <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-gray-700 stroke-[1.5] group-hover:text-teal-600 transition-colors" />
                    </button>
                  )}

                  {isAdmin && (
                    <Button
                      variant="outline"
                      onClick={handleAdminPage}
                      className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs lg:text-sm px-3 lg:px-5 border-0 shadow-md hover:shadow-lg transition-all'
                    >
                      Admin
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {page !== "cart" && (
                    <button className="group">
                      <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-gray-700 stroke-[1.5] group-hover:text-teal-600 transition-colors" />
                    </button>
                  )}

                  <Button
                    onClick={handleLoginClick}
                    className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium text-sm px-4 lg:px-6 py-2 shadow-md hover:shadow-lg transition-all'
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
                  <ShoppingCart className="w-5 h-5 text-gray-700 stroke-[1.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Items */}
              {page !== "cart" && navItems.map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-2">
                  {item.items.length > 0 ? (
                    <>
                      <button
                        onClick={() => toggleCategory(idx)}
                        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-800 hover:text-teal-600 transition-colors"
                      >
                        {item.name}
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === idx ? 'rotate-180' : ''}`} />
                      </button>

                      {expandedCategory === idx && (
                        <div className="pl-4 space-y-1 mt-2 bg-gray-50 rounded-lg p-3">
                          {item.items.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subItem.link}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="py-2.5 px-3 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-white rounded-lg transition-all flex items-center justify-between group">
                                <span>{subItem.name}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </Link>
                          ))}
                          {item.id && (
                            <Link
                              href={`/product/category/${item.id}`}
                              className="block mt-2 py-2.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-bold rounded-lg text-center shadow-md"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              View All
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.link || '/allcategory'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <button className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-800 hover:text-teal-600 transition-colors">
                        {item.name}
                      </button>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile User Actions */}
              <div className="pt-4 space-y-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        handleProfileClick();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full py-3 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <User className="w-5 h-5 text-teal-600" />
                      Profile
                    </button>

                    {page !== "cart" && (
                      <button className="flex items-center gap-3 w-full py-3 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-all">
                        <Search className="w-5 h-5 text-teal-600" />
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
                        className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0'
                      >
                        Admin Panel
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {page !== "cart" && (
                      <button className="flex items-center gap-3 w-full py-3 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-all">
                        <Search className="w-5 h-5 text-teal-600" />
                        Search
                      </button>
                    )}

                    <Button
                      onClick={() => {
                        handleLoginClick();
                        setMobileMenuOpen(false);
                      }}
                      className='w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 shadow-md'
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