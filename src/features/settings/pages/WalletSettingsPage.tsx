import React, { useState, useEffect } from 'react';
import { Save, Wallet, Coins, Users, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../frontend/components/ui/Button';

export const WalletSettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Use state to make it editable and persistant (mocked with localStorage for preview environment)
  const [settings, setSettings] = useState({
    minTopup: "100",
    maxTopup: "5000",
    maxDailyTopup: "10000",
    maxBalance: "20000",
    coinsEarned: "1.5",
    coinValue: "1.5",
    coolingPeriod: "3",
    rewardExpiry: "90",
    referrerReward: "50",
    newUserReward: "100",
    referrerExpiry: "90",
    newUserExpiry: "30",
    minOrderValue: "299"
  });

  useEffect(() => {
    const saved = localStorage.getItem('wallet_rewards_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSuccess(false);
    
    // Simulate API call & mock persistence
    setTimeout(() => {
      localStorage.setItem('wallet_rewards_settings', JSON.stringify(settings));
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet & Rewards Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Configure wallet limits, reward rates, and referral amounts</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuccess && <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Saved!</span>}
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Wallet Limits */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Wallet Limits</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Top-up Amount (₹)</label>
              <input type="number" name="minTopup" value={settings.minTopup} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maximum Top-up per Txn (₹)</label>
              <input type="number" name="maxTopup" value={settings.maxTopup} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maximum Daily Top-up (₹)</label>
              <input type="number" name="maxDailyTopup" value={settings.maxDailyTopup} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maximum Wallet Balance (₹)</label>
              <input type="number" name="maxBalance" value={settings.maxBalance} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Reward Coins */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reward Coins Engine</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Coins Earned per ₹100 Spent</label>
              <input type="number" step="0.5" name="coinsEarned" value={settings.coinsEarned} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Value of 1 Coin (₹)</label>
              <input type="number" step="0.5" name="coinValue" value={settings.coinValue} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cooling Period (Days)</label>
              <div className="text-xs text-slate-500 mb-1">Days after delivery before coins are claimable</div>
              <input type="number" name="coolingPeriod" value={settings.coolingPeriod} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reward Expiry (Days)</label>
              <input type="number" name="rewardExpiry" value={settings.rewardExpiry} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Referrals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Referral Program</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Referrer Reward (₹)</label>
              <input type="number" name="referrerReward" value={settings.referrerReward} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New User Promotional Reward (₹)</label>
              <input type="number" name="newUserReward" value={settings.newUserReward} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Referrer Reward Expiry (Days)</label>
              <input type="number" name="referrerExpiry" value={settings.referrerExpiry} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New User Reward Expiry (Days)</label>
              <input type="number" name="newUserExpiry" value={settings.newUserExpiry} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Order Value for New User (₹)</label>
              <input type="number" name="minOrderValue" value={settings.minOrderValue} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
