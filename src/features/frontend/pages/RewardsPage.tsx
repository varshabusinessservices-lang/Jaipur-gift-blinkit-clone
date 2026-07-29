import React from 'react';
import { ArrowLeft, Gift, Coins, Share2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const RewardsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/wallet" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <h1 className="text-3xl font-display font-semibold text-slate-900 dark:text-white tracking-tight">My Rewards</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900 overflow-hidden shadow-sm">
        <div className="p-8 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-b border-amber-200 dark:border-amber-900">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                <Coins className="w-4 h-4" /> Available Coins
              </span>
              <div className="text-5xl font-display font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                120
              </div>
              <div className="text-sm text-slate-500 mt-2">Value: ₹180 (1 Coin = ₹1.5)</div>
            </div>
            
            <div className="flex gap-3">
              <Button className="rounded-full shadow-md bg-amber-500 hover:bg-amber-600 text-white">
                Convert to Wallet
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
           <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Pending Rewards</h2>
           <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                   <div className="font-medium text-slate-900 dark:text-white">Order #1042</div>
                   <div className="text-sm text-slate-500">Delivered. Cooling period ends in 2 days.</div>
                </div>
                <div className="font-semibold text-amber-500">+45 Coins</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
