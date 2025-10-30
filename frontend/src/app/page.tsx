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

const carouselSlides = [
  {
    title: 'POP ADAPTERS',
    subtitle: "India's 1st Foldable Pin Adapter.",
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/Pop-cable-carousal-banner-desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/products'
  },
  {
    title: 'STACK COLLECTION',
    subtitle: 'Organize Your Space.',
    image: 'https://images.dailyobjects.com/marche/colllectionPage/stack-collection/stack_collection_hero_banner_desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/products'
  },
  {
    title: '',
    subtitle: '',
    image: 'https://images.dailyobjects.com/marche/colllectionPage/puft/PUFT-UNIT_Desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/products'
  },
  {
    title: 'WATCHBANDS',
    subtitle: 'Upgrade your watch drobe with our latest styles.',
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/watchbands-carousals-banner-desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/products'
  },
  {
    title: 'LOOP POWER BANKS',
    subtitle: 'Qi2-Certified, Next-Gen Fast Wireless Charging.',
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/desktop_herobanner_loop.jpg?tr=cm-pad_crop,v-3,w-360,dpr-4',
    link: '/products'
  },
];

export default function DailyObjectsReplica() {
  const [userId, setUserId] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] : any = useState(null);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // if (!localStorage.getItem("arttagUserId") || !localStorage.getItem("arttagtoken")) {
    //   router.push('/login');
    //   return;
    // }
    
    const id = localStorage.getItem("arttagUserId");
    if (id) {
      setUserId(id);
    }
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  const handleShopNow = (link) => {
    router.push(link);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <Navbar page={"Home"}/>

      {/* Hero Carousel */}
      <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
        <CarouselContent>
          {carouselSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-80px)]">
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10"></div>
                
                <div className="relative max-w-[1300px] mx-auto h-full px-4 sm:px-6 md:px-8 lg:px-12 flex items-end pb-16 sm:pb-20 md:pb-28 lg:pb-35">
                  <div className="z-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[47px] font-black text-white mb-1 sm:mb-2 tracking-tight leading-tight uppercase drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-[21px] text-white mb-4 sm:mb-5 md:mb-7 font-light drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <button 
                      onClick={() => handleShopNow(slide.link)}
                      className="bg-white text-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-[14px] font-black tracking-wider rounded-[3px] hover:bg-black hover:text-white transition-colors shadow-lg"
                    >
                      SHOP NOW
                    </button>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-1.5 sm:h-2 rounded-full transition-all ${
                        idx === index ? 'bg-white w-6 sm:w-8' : 'bg-white/50 w-1.5 sm:w-2'
                      }`}
                      onClick={() => setCurrentSlide(idx)}
                    />
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="hidden md:flex absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-300 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-0 shadow-lg">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </CarouselPrevious>
        
        <CarouselNext className="hidden md:flex absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-300 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-0 shadow-lg">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </CarouselNext>
      </Carousel>

      {/* Shop by Category Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16">
        <h2 className="text-xl sm:text-2xl md:text-[30px] font-sans ml-2 sm:ml-3 md:ml-5 text-black mb-4 sm:mb-5 tracking-tight uppercase">
          SHOP BY CATEGORY
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Tech Accessories Card */}
          <div className="group relative rounded-xl sm:rounded-2xl cursor-pointer overflow-hidden">
            <div className="aspect-[4/5] sm:aspect-[3.5/5] lg:aspect-[3.3/5] relative overflow-hidden">
              <img 
                src="https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3"
                alt="Tech Accessories"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-16 sm:right-20 md:right-24 flex items-center justify-between">
                <h3 className="text-white text-lg sm:text-xl md:text-[25px] font-black uppercase tracking-tight">
                  TECH ACCESSORIES
                </h3>
                <button className="absolute -right-12 sm:-right-14 md:-right-16 rounded-full border-1 border-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
                  <ArrowRight className='text-white w-4 h-4 sm:w-5 sm:h-5'/>
                </button>
              </div>
            </div>
          </div>

          {/* Bags & Wallets Card */}
          <div className="group relative rounded-xl sm:rounded-2xl cursor-pointer overflow-hidden">
            <div className="aspect-[4/5] sm:aspect-[3.5/5] lg:aspect-[3.3/5] relative overflow-hidden">
              <img 
                src="https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3"
                alt="Bags & Wallets"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-16 sm:right-20 md:right-24 flex items-center justify-between">
                <h3 className="text-white text-lg sm:text-xl md:text-[25px] font-black uppercase tracking-tight">
                  BAGS & WALLETS
                </h3>
                <button className="absolute -right-12 sm:-right-14 md:-right-16 rounded-full border-1 border-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
                  <ArrowRight className='text-white w-4 h-4 sm:w-5 sm:h-5'/>
                </button>
              </div>
            </div>
          </div>

          {/* Work Essentials Card */}
          <div className="group relative rounded-xl sm:rounded-2xl cursor-pointer overflow-hidden">
            <div className="aspect-[4/5] sm:aspect-[3.5/5] lg:aspect-[3.3/5] relative overflow-hidden">
              <img 
                src="https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3"
                alt="Work Essentials"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-16 sm:right-20 md:right-24 flex items-center justify-between">
                <h3 className="text-white text-lg sm:text-xl md:text-[25px] font-black uppercase tracking-tight">
                  WORK ESSENTIALS
                </h3>
                <button className="absolute -right-12 sm:-right-14 md:-right-16 rounded-full border-1 border-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
                  <ArrowRight className='text-white w-4 h-4 sm:w-5 sm:h-5'/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-[1440px] mx-auto px-0 pb-3 sm:pb-5">
        <div className="relative overflow-hidden">
          <img 
            src="https://images.dailyobjects.com/marche/assets/images/other-2/brighten-Desk-Landing-Page-Banner.jpg?tr=cm-pad_crop,v-3"
            alt="Brighten Your Everyday"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      <section>
        <Footer />
      </section>
    </div>
  );
}