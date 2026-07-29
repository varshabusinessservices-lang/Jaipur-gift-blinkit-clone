import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Gift, History, Plus, AlertCircle, Info, Coins, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const WalletPage = () => {
  // Mock data for initial rendering. In a real app, fetch from wallet.service endpoints
  const [summary, setSummary] = useState({
    totalBalance: 1480,
    selfLoaded: 800,
    reward: 180,
    referral: 400,
    refund: 100,
    promotional: 0,
    expiringSoon: 75,
    onHold: 0
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-display font-semibold text-slate-900 dark:text-white tracking-tight mb-2">My Wallet</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your balances, top up, and view history.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Total Balance</span>
              <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                ₹{summary.totalBalance.toFixed(2)}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Money
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Added Money */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">Added Money</span>
                </div>
                <div className="text-xs text-slate-500">Never expires</div>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">₹{summary.selfLoaded.toFixed(2)}</div>
            </div>

            {/* Refund Money */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">Refund Money</span>
                </div>
                <div className="text-xs text-slate-500">No expiry</div>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">₹{summary.refund.toFixed(2)}</div>
            </div>

            {/* Reward Money */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">Reward Money</span>
                </div>
                <div className="text-xs text-indigo-600/70 dark:text-indigo-400">
                  {summary.expiringSoon > 0 ? `₹${summary.expiringSoon.toFixed(2)} expires soon` : 'Promotional balance'}
                </div>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">₹{summary.reward.toFixed(2)}</div>
            </div>

            {/* Referral Money */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">Referral Money</span>
                </div>
                <div className="text-xs text-indigo-600/70 dark:text-indigo-400">Promotional balance</div>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">₹{summary.referral.toFixed(2)}</div>
            </div>

          </div>

          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p>Added money and eligible refund balance do not expire. Reward, referral and promotional balances may expire according to their validity and are subject to usage slabs per order.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/rewards" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">View Rewards</div>
              <div className="text-xs text-slate-500">Claim pending coins</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </Link>
        
        <Link to="/refer" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Refer & Earn</div>
              <div className="text-xs text-slate-500">Get ₹50 per friend</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Recent Transactions</h2>
          <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {/* Mock Transactions */}
          <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <History className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Order Payment</div>
                <div className="text-xs text-slate-500 mt-0.5">Reward ₹180 + Added Money ₹419.40</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900 dark:text-white">−₹599.40</div>
              <div className="text-xs text-slate-500 mt-0.5">2 days ago</div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Money Added</div>
                <div className="text-xs text-slate-500 mt-0.5">Added Money • Never expires</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">+₹500.00</div>
              <div className="text-xs text-slate-500 mt-0.5">5 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
