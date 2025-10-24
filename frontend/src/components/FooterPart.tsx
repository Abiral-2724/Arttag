import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

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
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">About DailyObjects</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Corporate Gifting</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Find a Store</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Helpdesk */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-gray-900 mb-3">Helpdesk</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">FAQs</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Terms Of Use</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Warranty Policy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Privacy & Security Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-12"></div>

          {/* Social and App Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo */}
            <div className="flex justify-center md:justify-start">
            <div className="text-2xl sm:text-3xl font-black tracking-tighter">
                <span className="text-black">ARTTAG</span>
              </div>
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