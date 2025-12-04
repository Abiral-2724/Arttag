import Navbar from '@/components/Navbar'
import React from 'react'

type Props = {}

const privacyAndSecurity = (props: Props) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        
        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
          PRIVACY & SECURITY POLICY
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mb-12 sm:mb-16">
          Last Updated: 30 November 2025
        </p>

        {/* Section 1 - Information We Collect */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            INFORMATION WE COLLECT:
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            Name, contact details, address, order info, device data.
          </p>
        </div>

        {/* Section 2 - How We Use Your Information */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            HOW WE USE YOUR INFORMATION:
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            To process orders, improve experience, and provide support.
          </p>
        </div>

        {/* Section 3 - Data Protection */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            DATA PROTECTION:
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            We use secure servers; payments are processed through trusted gateways.
          </p>
        </div>

        {/* Section 4 - Cookies */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            COOKIES:
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            Used to enhance website experience.
          </p>
        </div>

        {/* Section 5 - Your Rights */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            YOUR RIGHTS:
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            You may request correction or deletion of your data.
          </p>
        </div>

      </div>
    </div>
  )
}

export default privacyAndSecurity