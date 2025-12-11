'use client'
import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrderSuccessPage() {
  const [showContent, setShowContent] = useState(false);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 900000) + 100000);
  const [estimatedDelivery] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });
  const router = useRouter() ;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleGoHome = () => {
    // console.log('Navigating to home page...');
    // In your actual app, use: navigate('/') or window.location.href = '/'
    router.push('/') ;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div 
        className={`max-w-2xl w-full transition-all duration-700 transform ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-white rounded-full p-2 shadow-xl">
              <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

        
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Additional Actions */}
         
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-600 mt-8 text-sm">
          Need help? Contact our support team at support@yourstore.com
        </p>
      </div>
    </div>
  );
}