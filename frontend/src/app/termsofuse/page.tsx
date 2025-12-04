import React from 'react';
import { Scale, ShieldCheck, FileText, Package, CreditCard, Truck, RefreshCcw, Copyright, AlertCircle, Edit3 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function TermsOfUsePage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const sections = [
    {
      icon: ShieldCheck,
      title: "1. Acceptance of Terms",
      content: "By visiting Arttag.in, placing an order, or interacting with our services, you acknowledge that you have read, understood, and agreed to these terms."
    },
    {
      icon: FileText,
      title: "2. Use of Website",
      points: [
        "You must use the website for lawful purposes only.",
        "You may not attempt to modify, distribute, or misuse any part of the website.",
        "All product images, descriptions, and content are the intellectual property of Arttag."
      ]
    },
    {
      icon: CreditCard,
      title: "3. Orders & Payments",
      points: [
        "All orders placed through Arttag.in are subject to availability and confirmation.",
        "Prices may change without prior notice.",
        "Arttag reserves the right to cancel any order in case of payment issues, stock unavailability, or suspicious activity."
      ]
    },
    {
      icon: Truck,
      title: "4. Shipping & Delivery",
      content: "Delivery timelines may vary based on location and order volume."
    },
    {
      icon: RefreshCcw,
      title: "5. Returns, Refunds & Exchanges",
      content: "Customized products are non-refundable unless a verified defect exists."
    },
    {
      icon: Copyright,
      title: "6. Intellectual Property",
      content: "All content belongs exclusively to Arttag."
    },
    {
      icon: AlertCircle,
      title: "7. Limitation of Liability",
      content: "Arttag is not responsible for any damages resulting from use of the website or products."
    },
    {
      icon: Edit3,
      title: "8. Modification of Terms",
      content: "Arttag may update these terms at any time."
    }
  ];

  return (
    <div>
        <Navbar></Navbar>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Image Section */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <img 
          src="https://images.dailyobjects.com/marche/icons/home-page/15521/terms-of-use-desktop.png?tr=cm-pad_resize,v-3" 
          alt="Shopping bags and accessories" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <Scale className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              TERMS OF USE
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-200">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-8 sm:mb-12 border-t-4 border-teal-600">
          <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed">
            Welcome to <span className="font-bold text-teal-600">Arttag.in</span>. By accessing or using our website, products, or services, you agree to comply with the following Terms of Use.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
                        {section.title}
                      </h2>
                      {section.content && (
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                          {section.content}
                        </p>
                      )}
                      {section.points && (
                        <ul className="space-y-2 sm:space-y-3">
                          {section.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-600 mt-2"></span>
                              <span className="text-sm sm:text-base text-slate-700 leading-relaxed flex-1">
                                {point}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Footer */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 text-white text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Questions About Our Terms?
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-teal-50 mb-4 sm:mb-6 max-w-2xl mx-auto">
            If you have any questions or concerns about these Terms of Use, please don't hesitate to contact us.
          </p>
          <a 
            href="mailto:support@arttag.in"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-teal-600 rounded-full font-semibold text-sm sm:text-base hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Contact Support
          </a>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl mx-auto">
            By continuing to use Arttag.in, you acknowledge and accept these terms in their entirety. 
            We reserve the right to update these terms at any time without prior notice.
          </p>
        </div>
      </div>
    </div>
    </div>
   
  );
}