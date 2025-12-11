'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Spinner } from '@/components/ui/spinner';
import FooterPart from '@/components/FooterPart';
import Link from 'next/link';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError]: any = useState(null);
  const router = useRouter();

  const handleclicksubcategory = (subcategoryId: string) => {
    router.push(`${categoryId}/subcategory/${subcategoryId}/${categoryName}`)
  }

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/category/get/${categoryId}/all/subcategory`
        );
        setCategoryName(response.data.parentCategory.name)
        if (response.data.success) {
          setSubcategories(response.data.subcategories);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('Failed to load subcategories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div>
        <Navbar></Navbar>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
          <Link href={'/'} className="mb-4">
            <div className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="w-auto h-14">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 270 54"
                  className="h-full w-auto drop-shadow-sm"
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

          <div className="flex flex-col items-center gap-4">
            <Spinner className='text-blue-600 text-5xl'></Spinner>
            <p className="text-gray-700 text-base font-medium">Loading subcategories...</p>
          </div>
        </div>
      </div>

    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-red-100 rounded-full mb-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 text-xl font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-white">
        <Navbar></Navbar>
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 py-10">
            <h1 className="text-2xl md:text-3xl font-mono text-center tracking-tight text-gray-800">
              {categoryName}
            </h1>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="max-w-[900px] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-14">
            {subcategories.map((subcategory: any) => (
              <button
                key={subcategory.id}
                onClick={() => handleclicksubcategory(subcategory.id)}
              >
                <div
                  className="group cursor-pointer flex flex-col items-center"
                  onClick={() => console.log('Clicked:', subcategory.name)}
                >
                  {/* Circular image background */}
                  <div className="w-35 h-35 md:w-42 md:h-42 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={subcategory.imageUrl}
                      alt={subcategory.name}
                      className="w-3/4 h-3/4 object-contain transition-transform duration-300 group-hover:scale-110"
                      onError={(e: any) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-center font-medium text-sm md:text-lg uppercase tracking-wide text-gray-900">
                    {subcategory.name}
                  </h3>
                </div>
              </button>

            ))}
          </div>

          {/* Empty State */}
          {subcategories.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-xl font-semibold">
                No subcategories available
              </p>
              <p className="text-gray-500 mt-2">
                Check back later for new categories
              </p>
            </div>
          )}
        </div>

        {/* Decorative line at bottom */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-12"></div>


      </div>

      <div className="border-t border-gray-300 my-0"></div>
      <FooterPart></FooterPart>
    </div>


  );
};

export default CategoryPage;