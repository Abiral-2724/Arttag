'use client'
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What products do you offer?",
      answer: "Premium skins for laptops, mobiles, and gadgets."
    },
    {
      question: "Are the skins easy to apply?",
      answer: "Yes, they come with bubble-free adhesive."
    },
    {
      question: "Will skins damage my device?",
      answer: "No, they use safe, residue-free adhesive."
    },
    {
      question: "Can I order a custom design?",
      answer: "Yes."
    },
    {
      question: "Delivery time?",
      answer: "5–7 working days."
    },
    {
      question: "What if I receive a damaged product?",
      answer: "Contact us within 7 days with proof."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
   <div>
    <Navbar></Navbar>
    <div className="min-h-screen bg-white">
      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        
        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-12 sm:mb-16">
          FAQs
        </h1>

        {/* FAQ Items */}
        <div className="space-y-4 sm:space-y-5">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 pr-4">
                  {index + 1}. {faq.question}
                </h2>
                <ChevronDown 
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
   </div>
  );
}