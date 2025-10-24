'use client'
import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown, ChevronRight, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from './ui/button';

type Props = {
  userId: string;
  cartCount?: number;
}

const navItems = [
    {
      name: 'TECH ACCESSORIES',
      items: ['Stands', 'Phone Cases'],
      id : "cfd5c887-cfc6-4224-9da6-bb8fc85096a1"
    },
    {
      name: 'BAGS & WALLETS',
      items: ['Backpacks', 'Laptop Bags', 'Wallets', 'Card Holders', 'Travel Bags'],
      id : "e60bc235-8d04-4c31-b229-ba3a71f25fb0"
    },
    {
      name: 'WORK ESSENTIALS',
      items: ['Notebooks', 'Organizers', 'Desk Accessories', 'Planners', 'Pens & Pencils'] ,
      id : "8c9213f1-2ce7-4066-80f1-3dad45afab17"
    },
    {
      name: 'SHOP BY APPLE',
      items: ['iPhone Cases', 'iPad Accessories', 'MacBook Sleeves', 'AirPods Cases', 'Apple Watch Bands'],
      id : "6578853f-a315-4c27-acd2-d1ca33f55135"
    },
    {
      name: 'All CATEGORY',
      items: []
    }
  ];
  const API_BASE_URL = "https://ecommerce-v628.onrender.com/api/v1" ;

const Navbar = ({page} : any) => {
    const router = useRouter();
    const [userId, setUserId] = useState("");
    const [isAdmin ,setIsAdmin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

    useEffect(() => {
        if (!localStorage.getItem("arttagUserId") || !localStorage.getItem("arttagtoken")) {
          router.push('/login');
          return;
        }
        
        const id = localStorage.getItem("arttagUserId");
        if (id) {
          setUserId(id);
        }

        const checkadmin = async () => {
            const response = await axios.get(`${API_BASE_URL}/user/${id}/get/profile`);

            if (response.data.user.role === "ADMIN") {
              setIsAdmin(true)
            }
        }
        checkadmin() ;
       
      }, []);
    
  
    const [cartCount, setCartCount] = useState(0);

    

    const fetchCartCount = async (id: string) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/cart/${userId}/get/product/total/count`);
          if (response.data.success) {
            setCartCount(response.data.totalCount);
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      };
    
      useEffect(() => {
        if (userId) {
          fetchCartCount(userId);
        }
      }, [userId]);

      const handleadminpage = () => {
        router.push(`/${userId}/admin`)
      }

      const toggleCategory = (idx: number) => {
        setExpandedCategory(expandedCategory === idx ? null : idx);
      };

  return (
    <div>
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
            <div className="text-2xl sm:text-3xl font-black tracking-tighter">
                <span className="text-black">ARTTAG</span>
              </div>
            </div>

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
                            const trigger = e.currentTarget.previousElementSibling;
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
                {
                    page !== "cart" && (
                        <Link href={`/${userId}/cart`}>
                        <button className="relative" >
                            <ShoppingCart className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
                            {cartCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                                {cartCount}
                              </span>
                            )}
                          </button>
                        </Link>
                    )
                }
           
             
              <Link href={`/${userId}/profile`}>
              <button>
                <User className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
              </button>
              </Link>
             
            {
                page !== "cart" && (
                    <button>
                <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-black stroke-[1.5]" />
              </button>
                )
            }

           <div>
            {
                isAdmin ? (<>
                            <Button variant="outline" onClick={handleadminpage} className='bg-blue-600 text-white text-xs lg:text-sm px-3 lg:px-4'>Admin</Button>
                </>) : (<>
                </>)
            }
           </div>
              
            </div>

            {/* Mobile Icons & Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              {page !== "cart" && (
                <Link href={`/${userId}/cart`}>
                  <button className="relative">
                    <ShoppingCart className="w-5 h-5 text-black stroke-[1.5]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </Link>
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
                <Link href={`/${userId}/profile`} onClick={() => setMobileMenuOpen(false)}>
                  <button className="flex items-center gap-3 w-full py-3 text-sm font-medium text-black">
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                </Link>
                
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
                      handleadminpage();
                      setMobileMenuOpen(false);
                    }} 
                    className='w-full bg-blue-600 text-white'
                  >
                    Admin Panel
                  </Button>
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