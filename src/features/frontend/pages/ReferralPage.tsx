import React from 'react';
import { ArrowLeft, Share2, Copy, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const ReferralPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/wallet" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <h1 className="text-3xl font-display font-semibold text-slate-900 dark:text-white tracking-tight">Refer & Earn</h1>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold mb-2">Give ₹100, Get ₹50</h2>
          <p className="text-emerald-50 max-w-md">Invite friends to shop. They get ₹100 off their first order, and you get ₹50 in your wallet when their order is delivered!</p>
          
          <div className="mt-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 flex items-center justify-between">
             <div className="font-mono text-2xl font-bold tracking-widest">
                SHOPX50
             </div>
             <Button variant="outline" className="rounded-full bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-none">
                <Copy className="w-4 h-4 mr-2" /> Copy Code
             </Button>
          </div>
        </div>
        <Users className="absolute -right-8 -bottom-8 w-64 h-64 text-white opacity-10" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
         <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">How it works</h3>
         <div className="space-y-6">
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">1</div>
               <div>
                  <div className="font-medium text-slate-900 dark:text-white">Share your code</div>
                  <div className="text-sm text-slate-500">Send your unique code to friends who have never shopped with us.</div>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">2</div>
               <div>
                  <div className="font-medium text-slate-900 dark:text-white">Friend places order</div>
                  <div className="text-sm text-slate-500">They get ₹100 promotional balance to use instantly on their first order over ₹299.</div>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle className="w-4 h-4" />
               </div>
               <div>
                  <div className="font-medium text-slate-900 dark:text-white">You get rewarded!</div>
                  <div className="text-sm text-slate-500">Once their order is delivered, you get ₹50 added to your referral wallet bucket.</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
