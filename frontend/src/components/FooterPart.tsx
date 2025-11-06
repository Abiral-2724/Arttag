import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Link from 'next/link'

type Props = {}

const FooterPart = (props: Props) => {
  return (
    <div>
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4">
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-gray-900 mb-3">Stay Connected</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get exclusive access to new products, deals & surprise treats
              </p>
              <div className="flex gap-2">
                <Input
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-white border-gray-300 focus:border-emerald-500"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 font-medium shadow-sm">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Know Us */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-gray-900 mb-3">Know Us</h3>
              <ul className="space-y-3">
                <li><a href="/aboutus" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">About Arttag</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Corporate Gifting</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Find a Store</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Helpdesk */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-gray-900 mb-3">Helpdesk</h3>
              <ul className="space-y-3">
                <li><a href="/contactus" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Contact Us</a></li>
                <li><a href="/faq" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">FAQs</a></li>
                <li><a href="/termsofuse" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Terms Of Use</a></li>
                <li><a href="/warrantypolicy" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Warranty Policy</a></li>
                <li><a href="/privacyandSecurity" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Privacy & Security Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-12"></div>

          {/* Social and App Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo */}
            <div className="flex justify-center md:justify-start">
            <Link href={'/'}>
            <div className="flex items-center gap-2">
  <div className="w-auto h-10">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 270 54"
      className="h-full w-auto"
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
            </div>

            {/* Social Media */}
            <div className="flex flex-col items-center">
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Follow Us On</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all duration-300 group">
                  <Instagram className="w-5 h-5 text-gray-700 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all duration-300 group">
                  <Facebook className="w-5 h-5 text-gray-700 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all duration-300 group">
                  <Youtube className="w-5 h-5 text-gray-700 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all duration-300 group">
                  <Twitter className="w-5 h-5 text-gray-700 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all duration-300 group">
                  <Linkedin className="w-5 h-5 text-gray-700 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* App Download */}
            <div className="flex flex-col items-center md:items-end">
              <h4 className="font-semibold text-sm mb-3 text-gray-900">Download Our App</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img src="https://images.dailyobjects.com/marche/icons/android.png?tr=cm-pad_resize,v-3,w-118,h-38,dpr-2" alt="Get it on Google Play" className="h-10 rounded-md shadow-sm"/>
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img src="https://images.dailyobjects.com/marche/icons/IOS.png?tr=cm-pad_resize,v-3,w-118,h-38,dpr-2" alt="Download on the App Store" className="h-10 rounded-md shadow-sm"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 text-gray-300 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            © 2012 - 2025 Firki Wholesale Pvt. Ltd.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Terms of use</a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FooterPart