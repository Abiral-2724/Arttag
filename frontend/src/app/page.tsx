"use client"
import React, { useEffect, useRef, useState } from 'react';
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
import Link from 'next/link';

const carouselSlides = [
  {
    title: 'POP ADAPTERS',
    subtitle: "India's 1st Foldable Pin Adapter.",
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/Pop-cable-carousal-banner-desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/product/category/cfd5c887-cfc6-4224-9da6-bb8fc85096a1'
  },
  {
    title: 'STACK COLLECTION',
    subtitle: 'Organize Your Space.',
    image: 'https://images.dailyobjects.com/marche/colllectionPage/stack-collection/stack_collection_hero_banner_desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/product/category/e60bc235-8d04-4c31-b229-ba3a71f25fb0'
  },
  {
    title: '',
    subtitle: '',
    image: 'https://images.dailyobjects.com/marche/colllectionPage/puft/PUFT-UNIT_Desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: '/product/category/6578853f-a315-4c27-acd2-d1ca33f55135'
  },
  {
    title: 'WATCHBANDS',
    subtitle: 'Upgrade your watch drobe with our latest styles.',
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/watchbands-carousals-banner-desktop.jpg?tr=cm-pad_crop,v-3,w-1440,dpr-2',
    link: 'product/category/6578853f-a315-4c27-acd2-d1ca33f55135'
  },
  {

    title: 'LOOP POWER BANKS',
    subtitle: 'Qi2-Certified, Next-Gen Fast Wireless Charging.',
    image: 'https://images.dailyobjects.com/marche/assets/images/other-2/desktop_herobanner_loop.jpg?tr=cm-pad_crop,v-3,w-360,dpr-4',
    link: '/product/category/8c9213f1-2ce7-4066-80f1-3dad45afab17'
  },
];

interface Subcategory {
  id: string;
  name: string;
  imageUrl: string;
  parentId: string;
  createdAt: string;
}

interface SubcategoriesResponse {
  success: boolean;
  message: string;
  subcategories: Subcategory[];
}


export default function DailyObjectsReplica() {
  const [userId, setUserId] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi]: any = useState(null);
  const router = useRouter();
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const topCategorySliderRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE}/category/get/all/subcategory`);
      const data: SubcategoriesResponse = await response.json();
      if (data.success) {
        setSubcategories(data.subcategories);
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };


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

  const scrollSlider = (direction: 'left' | 'right', sliderRef: React.RefObject<HTMLDivElement>) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left'
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;

      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (subcategory: Subcategory) => {
    const categoryId = subcategory.parentId;
    const subcategoryId = subcategory.id;
    const subcategoryName = subcategory.name.toLowerCase().replace(/\s+/g, '-');

    window.location.href = `/product/category/${categoryId}/subcategory/${subcategoryId}/${subcategoryName}`;
  };

  const shopByCategories = [
    {
      title: 'TECH ACCESSORIES',
      image: 'https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3',
      link: 'product/category/cfd5c887-cfc6-4224-9da6-bb8fc85096a1'
    },
    {
      title: 'BAGS & WALLETS',
      image: 'https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3',
      link: 'product/category/e60bc235-8d04-4c31-b229-ba3a71f25fb0'
    },
    {
      title: 'WORK ESSENTIALS',
      image: 'https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3',
      link: 'product/category/8c9213f1-2ce7-4066-80f1-3dad45afab17'
    }
  ];


  return (
    <div className="bg-white">
      {/* Header */}
      <Navbar page={"Home"} />

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
                      className={`h-1.5 sm:h-2 rounded-full transition-all ${idx === index ? 'bg-white w-6 sm:w-8' : 'bg-white/50 w-1.5 sm:w-2'
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
        <h2 className="text-xl sm:text-2xl md:text-[25px] font-sans ml-2 sm:ml-3 md:ml-5 text-black mb-4 sm:mb-5 tracking-tight uppercase">
          SHOP BY CATEGORY
        </h2>

        {/* Mobile Horizontal Slider */}
        <div className="sm:hidden relative group">
          <button
            onClick={() => scrollSlider('left', categorySliderRef)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-full p-2 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div
            ref={categorySliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {shopByCategories.map((category, index) => (
              <Link key={index} href={category.link} className="flex-shrink-0 w-[85vw] snap-center">
                <div className="group/item relative rounded-xl cursor-pointer overflow-hidden">
                  <div className="aspect-[3/5] relative overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-6 left-6 right-20 flex items-center justify-between">
                      <h3 className="text-white text-lg font-black uppercase tracking-tight">
                        {category.title}
                      </h3>
                      <button className="absolute -right-14 rounded-full border-1 border-white w-10 h-10 flex items-center justify-center transition-transform group-hover/item:scale-110 flex-shrink-0">
                        <ArrowRight className='text-white w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scrollSlider('right', categorySliderRef)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-full p-2 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-3">
          {shopByCategories.map((category, index) => (
            <Link key={index} href={category.link}>
              <div className="group relative rounded-xl sm:rounded-2xl cursor-pointer overflow-hidden">
                <div className="aspect-[4.5/5] sm:aspect-[3.3/5] lg:aspect-[3/5] relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-16 sm:right-20 md:right-24 flex items-center justify-between">
                    <h3 className="text-white text-lg sm:text-xl md:text-[25px] font-black uppercase tracking-tight">
                      {category.title}
                    </h3>
                    <button className="absolute -right-12 sm:-right-14 md:-right-16 rounded-full border-1 border-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
                      <ArrowRight className='text-white w-4 h-4 sm:w-5 sm:h-5' />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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

      {/* Top Categories Section - Enhanced */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16">
        <h2 className="text-xl sm:text-2xl md:text-[25px] font-sans ml-2 sm:ml-3 md:ml-5 text-black mb-6 sm:mb-8 tracking-tight ">
          Top Categories
        </h2>

        {isLoadingCategories ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scrollSlider('left', topCategorySliderRef)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 sm:p-4 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-2 hover:scale-110 border border-gray-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Slider Container */}
            <div
              ref={topCategorySliderRef}
              className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {subcategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="flex-shrink-0 w-28 sm:w-32 md:w-36 flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full overflow-hidden mb-3 sm:mb-4 group-hover/item:shadow-2xl transition-all duration-300 ring-2 ring-transparent group-hover/item:ring-black group-hover/item:ring-offset-4">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 text-center leading-tight px-2 group-hover/item:text-black transition-colors">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollSlider('right', topCategorySliderRef)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 sm:p-4 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-2 hover:scale-110 border border-gray-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Trending Collections Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-8 ml-2 sm:ml-3 md:ml-5">
          <h2 className="text-xl sm:text-2xl md:text-[25px] font-sans text-black tracking-tight uppercase">
            TRENDING COLLECTIONS
          </h2>
         
        </div>


        {/* Mobile Slider */}
        <div className="sm:hidden relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory">
            {[
              {
                title: 'REFLECTIVE',
                description: 'Carryalls that mirror your urban spirit of transience',
                image: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1767611737/Shop-by-category-1reflective_zsi3kc.avif',
                link: '/collection/reflective'
              },
              {
                title: 'CANVAS',
                description: 'Classic staples for every day carry',
                image: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1767611737/Shop-by-category-1canvas_u6oaeu.avif',
                link: '/collection/canvas'
              },
              {
                title: 'CARBON BLACK',
                description: 'Comfort carryalls in a quintessentially classic colour',
                image: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1767611737/Shop-by-category-1carbon-black_xbdc38.avif',
                link: '/collection/carbon-black'
              }
            ].map((collection, index) => (
              <div key={index} className="flex-shrink-0 w-[85vw] snap-center">
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-[500px]">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-6 right-6">
                    <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-3">
                      {collection.title}
                    </h3>
                    <p className="text-white/90 text-sm font-light mb-5 leading-relaxed">
                      {collection.description}
                    </p>
                    <button className="flex items-center gap-2 text-white font-semibold text-sm group/btn hover:gap-3 transition-all">
                      Shop now!
                      <div className="rounded-full border-2 border-white w-8 h-8 flex items-center justify-center group-hover/btn:bg-white transition-all">
                        <ArrowRight className="w-4 h-4 group-hover/btn:text-black transition-colors" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-3">
          {[
            {
              title: 'REFLECTIVE',
              description: 'Carryalls that mirror your urban spirit of transience',
              image: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1767611737/Shop-by-category-1reflective_zsi3kc.avif',
              link: '/collection/reflective'
            },
            {
              title: 'CANVAS',
              description: 'Classic staples for every day carry',
              image: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1767611737/Shop-by-category-1canvas_u6oaeu.avif',
              link: '/collection/canvas'
            },
            {
              title: 'CARBON BLACK',
              description: 'Comfort carryalls in a quintessentially classic colour',
              image: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1767611737/Shop-by-category-1carbon-black_xbdc38.avif',
              link: '/collection/carbon-black'
            }
          ].map((collection, index) => (
            <Link key={index} href={collection.link}>
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-[3/5]">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-6 sm:left-8 right-6 sm:right-8">
                  <h3 className="text-white text-xl sm:text-2xl md:text-[28px] font-black uppercase tracking-tight mb-2 sm:mb-3">
                    {collection.title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm md:text-base font-light mb-4 sm:mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                  
                  <button className="flex items-center gap-2 text-white font-light text-sm sm:text-base group/btn hover:gap-3 transition-all">
                   
                    Shop now!
                    <div className="rounded-full border-1 border-white w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center group-hover/btn:bg-white transition-all">
                      <ArrowRight className="w-3 h-4 sm:w-5 sm:h-5 group-hover/btn:text-black transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      
      <section>
        <Footer />
      </section>
    </div>
  );
}