import Navbar from '@/components/Navbar';
import React from 'react';

export default function WarrantyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div>
        <Navbar></Navbar>
        <div className="min-h-screen bg-white">
      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        
        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
          WARRANTY POLICY
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mb-12 sm:mb-16">
          Last Updated: {lastUpdated}
        </p>

        {/* Intro */}
        <div className="mb-12 sm:mb-16">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            We offer a 7-day replacement warranty for issues like misprints, manufacturing defects, or incorrect items sent.
          </p>
        </div>

        {/* Section 1 - Warranty Does Not Cover */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            WARRANTY DOES NOT COVER:
          </h2>
          <ul className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed">
            <li className="flex items-start">
              <span className="mr-3 mt-1.5">-</span>
              <span>Wrong model selected by customer</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1.5">-</span>
              <span>Damage caused during application</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1.5">-</span>
              <span>Daily usage wear & tear</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1.5">-</span>
              <span>Color variations due to device screens</span>
            </li>
          </ul>
        </div>

        {/* Section 2 - Replacement Process */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            REPLACEMENT PROCESS:
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            Contact us within 7 days with order ID and proof.
          </p>
        </div>

        {/* Privacy & Security Title */}
       
      </div>
    </div>
    </div>
   
  );
}