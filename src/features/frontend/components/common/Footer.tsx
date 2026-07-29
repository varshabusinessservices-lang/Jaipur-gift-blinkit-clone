import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Clock, Gift, ChevronDown, ChevronUp, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (sec: string) => {
    setOpenSection(openSection === sec ? null : sec);
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Trust Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">10-Minute Delivery</h4>
              <p className="text-[11px] text-slate-500">Lightning quick delivery across Jaipur</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">100% Authentic</h4>
              <p className="text-[11px] text-slate-500">Handcrafted premium quality gifts</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Free Gift Message</h4>
              <p className="text-[11px] text-slate-500">Luxurious gift wrapping included</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Personalisation Experts</h4>
              <p className="text-[11px] text-slate-500">Precision engraving & photo printing</p>
            </div>
          </div>
        </div>

        {/* Footer Links & Accordions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-b border-slate-200 dark:border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">Jaipur Gifting</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jaipur's premier express gifting platform. Delivering smiles in 10 minutes with exquisite customised gifts, fresh flowers, cakes, jewellery, and photo frames.
            </p>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-600" /> C-12, Malviya Nagar, Jaipur, Rajasthan 302017</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-indigo-600" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-600" /> support@jaipurgifting.com</div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Popular Categories</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="/category/customised" className="hover:text-indigo-600">Customised Gifts</a></li>
              <li><a href="/category/jewellery" className="hover:text-indigo-600">Exquisite Jewellery</a></li>
              <li><a href="/category/mugs" className="hover:text-indigo-600">Photo Mugs & Sippers</a></li>
              <li><a href="/category/photo-frame" className="hover:text-indigo-600">Personalised Frames & Lamps</a></li>
              <li><a href="/category/bottle" className="hover:text-indigo-600">Steel Bottles</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Customer Services</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="/profile/orders" className="hover:text-indigo-600">Track Order Status</a></li>
              <li><a href="/profile" className="hover:text-indigo-600">My Account & Wallet</a></li>
              <li><a href="#" className="hover:text-indigo-600">Express Delivery Zones</a></li>
              <li><a href="#" className="hover:text-indigo-600">Corporate & Bulk Gifting</a></li>
              <li><a href="#" className="hover:text-indigo-600">FAQ & Help Center</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Policies & Safety</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-600">Cancellation & Refund Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Secure Razorpay Payments</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Jaipur Gifting Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
