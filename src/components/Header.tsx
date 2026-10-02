import React from 'react';
import { 
  Zap, 
  Map, 
  DollarSign, 
  Truck, 
  Compass, 
  Bell, 
  Layers, 
  Globe, 
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { CustomerWallet } from '../types/route';

interface HeaderProps {
  activeTab: 'dashboard' | 'money' | 'fleet' | 'planner';
  onTabChange: (tab: 'dashboard' | 'money' | 'fleet' | 'planner') => void;
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  wallet: CustomerWallet;
  pendingInvoicesCount: number;
  currencySymbol?: string;
  onOpenAddCustomRoute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedCity,
  onSelectCity,
  wallet,
  pendingInvoicesCount,
  currencySymbol = '₹',
  onOpenAddCustomRoute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            <Zap className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">FluxRoute</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30">
                Dual Ops
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Multi-Route Fleet Dispatch & Customer Money Settlement
            </p>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Dual Dashboard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          <button
            onClick={() => onTabChange('money')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'money'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Customer Money & Pay All</span>
            {pendingInvoicesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                {pendingInvoicesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('planner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Route Optimizer</span>
          </button>

          <button
            onClick={() => onTabChange('fleet')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'fleet'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet & Telematics</span>
          </button>
        </nav>

        {/* Right Section: Metro Switcher & Customer Balance Chip */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* City & Custom Route Preset Selector */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => {
                if (e.target.value === '__add_custom_route__') {
                  onOpenAddCustomRoute?.();
                } else {
                  onSelectCity(e.target.value);
                }
              }}
              className="bg-slate-900 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 border border-slate-700 hover:border-slate-600 focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="india_delhi">🇮🇳 Delhi NCR — Agra & Jaipur</option>
              <option value="india_mumbai">🇮🇳 Mumbai — Pune Expressway</option>
              <option value="sf">🇺🇸 San Francisco Bay Area</option>
              <option value="nyc">🇺🇸 New York Metro</option>
              <option value="__add_custom_route__">✨ + Add Custom Route (Align Map)...</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Add Route & Align Map Button */}
          {onOpenAddCustomRoute && (
            <button
              type="button"
              onClick={onOpenAddCustomRoute}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Add route and align map to your selected places"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Add Route</span>
            </button>
          )}

          {/* Customer Money Wallet Badge (Direct Jump to Money Section) */}
          <button
            onClick={() => onTabChange('money')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-850 hover:bg-slate-800 border border-slate-700/80 transition-all shadow-md group cursor-pointer"
            title="Customer Prepaid Wallet & Pay All"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] text-slate-400 font-medium">Customer Wallet</p>
              <p className="font-mono text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
                {currencySymbol}{wallet.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </p>
            </div>
            {pendingInvoicesCount > 0 && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                {pendingInvoicesCount} due
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-850 bg-slate-950 px-4 py-2 flex items-center justify-around gap-1">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange('money')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'money' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Pay All</span>
          {pendingInvoicesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => onTabChange('planner')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'planner' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Planner</span>
        </button>

        <button
          onClick={() => onTabChange('fleet')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'fleet' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Fleet</span>
        </button>
      </div>
    </header>
  );
};
