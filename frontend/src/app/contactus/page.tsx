import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ContactUsPage() {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@arttag.in",
      link: "mailto:support@arttag.in"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+91 9407068809",
      link: "tel:+919407068809"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Smart City, Gwalior, Madhya Pradesh – 474001",
      link: null
    },
    {
      icon: Clock,
      label: "Support Hours",
      value: "Mon–Sat, 10 AM – 7 PM",
      link: null
    }
  ];

  return (
    <div>
<Navbar></Navbar>
<div className="min-h-screen bg-white">
      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">
          CONTACT US
        </h1>
        <p className="text-lg sm:text-2xl text-slate-700 font-medium mb-10 sm:mb-12">
          Arttag Support Team
        </p>

        {/* Contact Information */}
        <div className="space-y-3 sm:space-y-5">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const content = (
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    {info.label}
                  </h2>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed break-words">
                    {info.value}
                  </p>
                </div>
              </div>
            );

            return (
              <div key={index} className="border-b border-slate-200 pb-8 sm:pb-10 last:border-b-0">
                {info.link ? (
                  <a 
                    href={info.link}
                    className="block hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="-mx-2 px-2 py-2">
                    {content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
    </div>
    
  );
}