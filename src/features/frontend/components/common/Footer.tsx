import React from 'react';
import { ShieldCheck, Zap, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Trust Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">10-Minute Lightning Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Express instant dispatch across all zones in Jaipur.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Authentic & Fresh</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sourced directly from finest artisan bakeries & sweets kitchens.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Personalised Gift Messages</h4>
              <p className="text-xs text-slate-400 mt-0.5">Custom gift cards, handwritten notes & photo memories.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                JG
              </div>
              <span className="font-extrabold text-white text-lg">Jaipur Gifting</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Jaipur's premier ultra-fast gifting and luxury hamper service. Delivering smiles in 10 minutes across Malviya Nagar, C-Scheme, Vaishali Nagar, and Raja Park.
            </p>
            <div className="space-y-1 text-xs text-slate-400">
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-indigo-400" /> C-12, Malviya Nagar, Jaipur, Rajasthan 302017</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-indigo-400" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-indigo-400" /> support@jaipurgifting.com</p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Categories</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Luxury Mithai</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Birthday Cakes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Diwali Hampers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fresh Flowers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Personalised Gifts</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Customer Policies</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Return & Refund</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Delivery FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security & Razorpay</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Experience App</h5>
            <p className="text-xs text-slate-400 mb-3">Download for Android & iOS for exclusive 10-min instant delivery discounts.</p>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-xs font-semibold text-white">
              📱 Google Play / App Store Ready
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 Jaipur Gifting Enterprise. All rights reserved. Powered by Blinkit Architecture & Google Maps.
        </div>
      </div>
    </footer>
  );
};
