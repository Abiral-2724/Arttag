"use client"
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, User, Search, ChevronDown, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Footer from '../components/Footer'
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const carouselSlides = [
  {
    title: 'POP ADAPTERS',
    subtitle: "India's 1st Foldable Pin Adapter.",
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/Pop-cable-carousal-banner-desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2'
  },
  {
    title: 'STACK COLLECTION',
    subtitle: 'Organize Your Space.',
    image: 'https://images.dailyobjects.com/marche/colllectionPage/stack-collection/stack_collection_hero_banner_desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2'
  },
  {
    title: '',
    subtitle: '',
    image: 'https://images.dailyobjects.com/marche/colllectionPage/puft/PUFT-UNIT_Desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2'
  },
  {
    title: 'WATCHBANDS',
    subtitle: 'Upgrade your watch drobe with our latest styles.',
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/watchbands-carousals-banner-desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2'
  },
  {
    title: 'LOOP POWER BANKS',
    subtitle: 'Qi2-Certified, Next-Gen Fast Wireless Charging.',
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/desktop_herobanner_loop.jpg?tr=cm-pad_crop,v-3,w-360,dpr-4'
  },
];

export default function DailyObjectsReplica() {
  const [userId, setUserId] = useState("");
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const API_BASE = "https://ecommerce-v628.onrender.com/api/v1";

  useEffect(() => {
    if (!localStorage.getItem("arttagUserId") || !localStorage.getItem("arttagtoken")) {
      router.push('/login');
      return;
    }
    
    const id = localStorage.getItem("arttagUserId");
    if (id) {
      setUserId(id);
     
    }
  }, []);

  // Fetch cart count
  

  return (
    <div className="bg-white">
      {/* Header */}
      <Navbar page={"Home"}/>

      {/* Hero Carousel */}
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {carouselSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10"></div>
                
                <div className="relative max-w-[1300px] mx-auto h-full px-12 flex items-end pb-35">
                  <div className="z-10">
                    <h1 className="text-[47px] font-black text-white mb-2 tracking-tight leading-[0.95] uppercase drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-[21px] text-white mb-7 font-light drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <button className="bg-white text-black px-8 py-4 text-[14px] font-black tracking-wider rounded-[3px] hover:bg-black hover:text-white transition-colors shadow-lg">
                      SHOP NOW
                    </button>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === index ? 'bg-white w-8' : 'bg-white/50 w-2'
                      }`}
                      onClick={() => setCurrentSlide(idx)}
                    />
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-300 w-14 h-14 rounded-full border-0 shadow-lg">
          <ChevronLeft className="w-6 h-6" />
        </CarouselPrevious>
        
        <CarouselNext className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-300 w-14 h-14 rounded-full border-0 shadow-lg">
          <ChevronRight className="w-6 h-6" />
        </CarouselNext>
      </Carousel>

      {/* Shop by Category Section */}
      <section className="max-w-[1440px] mx-auto px-10 py-16">
        <h2 className="text-[30px] font-sans ml-5 text-black mb-5 tracking-tight uppercase">
          SHOP BY CATEGORY
        </h2>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Tech Accessories Card */}
          <div className="group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="aspect-[3.3/5] relative">
              <img 
                src="https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3"
                alt="Tech Accessories"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <h3 className="text-white text-[25px] font-black uppercase tracking-tight">
                  TECH ACCESSORIES
                </h3>
                <button className="rounded-full border-1 border-white w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className='text-white'/>
                </button>
              </div>
            </div>
          </div>

          {/* Bags & Wallets Card */}
          <div className="group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="aspect-[3.3/5] relative">
              <img 
                src="https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3"
                alt="Bags & Wallets"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <h3 className="text-white text-[25px] font-black uppercase tracking-tight">
                  BAGS & WALLETS
                </h3>
                <button className="rounded-full border-1 border-white w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className='text-white'/>
                </button>
              </div>
            </div>
          </div>

          {/* Work Essentials Card */}
          <div className="group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="aspect-[3.3/5] relative">
              <img 
                src="https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3"
                alt="Work Essentials"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <h3 className="text-white text-[25px] font-black uppercase tracking-tight">
                  WORK ESSENTIALS
                </h3>
                <button className="rounded-full border-1 border-white w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className='text-white'/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-[1440px] mx-auto px-0 pb-5">
        <div className="relative overflow-hidden">
          <img 
            src="https://images.dailyobjects.com/marche/assets/images/other-2/brighten-Desk-Landing-Page-Banner.jpg?tr=cm-pad_crop,v-3"
            alt="Brighten Your Everyday"
            className="w-full object-cover"
          />
        </div>
      </section>

      <section>
        <Footer />
      </section>
    </div>
  );
}