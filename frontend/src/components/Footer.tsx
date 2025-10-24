import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator"
import { 
  Star, 
  Package, 
  RotateCcw, 
  CheckCircle,
  ChevronDown,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  ArrowUp,
  AppleIcon
} from 'lucide-react';
import FooterPart from './FooterPart';

interface ExpandedSections {
  mostSearched: boolean;
  gifts: boolean;
  blogs: boolean;
}

type SectionKey = keyof ExpandedSections;

const Footer: React.FC = () => {
  const [expandedSections, setExpandedSections] = React.useState<ExpandedSections>({
    mostSearched: false,
    gifts: false,
    blogs: false
  });

  const toggleSection = (section: SectionKey): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="w-full bg-white">
      {/* Reviews Section */}
      <div className="border-b border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-center text-2xl font-medium mb-12">HONEST REVIEWS. NOTHING ELSE.</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* DailyObjects */}
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">DO</div>
              <div className="text-gray-600 mb-2">DailyObjects.com</div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg font-semibold">4.6</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <div className="text-sm text-gray-600">8.5k+ Reviews</div>
            </div>

            {/* App Store */}
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">
              <AppleIcon height={40} width={30}/>
              </div>
              <div className="text-gray-600 mb-2">App store</div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg font-semibold">4.6</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <div className="text-sm text-gray-600">7.7k+ Reviews</div>
            </div>

            {/* Play Store */}
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">▶</div>
              <div className="text-gray-600 mb-2">Play Store</div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg font-semibold">4.3</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <div className="text-sm text-gray-600">5.3k+ Reviews</div>
            </div>

            {/* Google */}
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2 font-bold">G</div>
              <div className="text-gray-600 mb-2">Google</div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg font-semibold">4.7</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <div className="text-sm text-gray-600">200+ Reviews</div>
            </div>
          </div>
          <div className="border-t border-gray-300 my-12"></div>
          {/* Features */}
          <div className=''>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-1 border-gray-400 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 hover:text-white">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-medium">Quick Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-1 border-gray-400 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 hover:text-white">
                <RotateCcw className="w-4 h-4" />
              </div>
              <span className="font-medium">Easy Returns</span>
            </div>
            <div className="flex items-center gap-3 ">
              <div className="w-11 h-11 rounded-full border-1 border-gray-400 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 hover:text-white">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="font-medium">Quality Assured</span>
            </div>
          </div>
          </div>
         
        </div>
      </div>
{/* Main Footer Content */}
<FooterPart></FooterPart>
     
    </footer>
  );
};

export default Footer;