import React, { useState } from 'react';
import { CustomerWallet, InvoiceItem, PaymentMethod } from '../types/route';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  Coins, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Download, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  FileText,
  DollarSign,
  TrendingUp,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MoneySectionProps {
  wallet: CustomerWallet;
  invoices: InvoiceItem[];
  paymentMethods: PaymentMethod[];
  onPayAll: (invoiceIds: string[], paymentMethodId: string) => Promise<void>;
  onPaySingle: (invoiceId: string) => Promise<void>;
  onUpdateWalletSettings: (updated: Partial<CustomerWallet>) => void;
  onAddPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  onViewReceipt: (invoice: InvoiceItem) => void;
  currencySymbol?: string;
}

export const MoneySection: React.FC<MoneySectionProps> = ({
  wallet,
  invoices,
  paymentMethods,
  onPayAll,
  onPaySingle,
  onUpdateWalletSettings,
  onAddPaymentMethod,
  onViewReceipt,
  currencySymbol = '₹',
}) => {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(
    invoices.filter((inv) => inv.status === 'pending').map((inv) => inv.id)
  );
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(
    wallet.preferredPaymentMethodId || paymentMethods[0]?.id || ''
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [showAddMethodModal, setShowAddMethodModal] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  
  // Custom Top-Up Amount State (Customer can set any amount)
  const defaultInitialAmount = currencySymbol === '₹' ? 2000 : 250;
  const [topUpAmount, setTopUpAmount] = useState<number>(defaultInitialAmount);
  const [customTopUpInput, setCustomTopUpInput] = useState<string>(String(defaultInitialAmount));
  const [topUpMethodId, setTopUpMethodId] = useState<string>(paymentMethods[0]?.id || '');
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [depositHistory, setDepositHistory] = useState<Array<{ id: string; amount: number; date: string; method: string }>>([
    { id: 'dep-1', amount: currencySymbol === '₹' ? 10000 : 500, date: '2026-09-27 14:32', method: 'UPI (GPay / PhonePe)' },
    { id: 'dep-2', amount: currencySymbol === '₹' ? 5000 : 250, date: '2026-09-25 09:15', method: 'FASTag Auto-Debit' }
  ]);

  // New Payment Method Form State
  const [newMethodType, setNewMethodType] = useState<'card' | 'bank' | 'crypto'>('card');
  const [newMethodName, setNewMethodName] = useState<string>('');
  const [newMethodDetails, setNewMethodDetails] = useState<string>('');

  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending');
  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Selected invoices total
  const selectedTotal = invoices
    .filter((inv) => selectedInvoiceIds.includes(inv.id) && inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedInvoiceIds.length === pendingInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(pendingInvoices.map((inv) => inv.id));
    }
  };

  const handleToggleInvoice = (id: string) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter((invId) => invId !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  // Trigger Pay All Things
  const handleExecutePayAll = async () => {
    if (selectedInvoiceIds.length === 0) return;
    setIsProcessingPayment(true);

    try {
      await onPayAll(selectedInvoiceIds, selectedPaymentMethodId);
      
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#60A5FA', '#34D399']
        });
      } catch (e) {
        // Safe if confetti fails
      }

      setPaymentSuccessMessage(`Successfully settled ${selectedInvoiceIds.length} item(s) totalling ${currencySymbol}${selectedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
      setSelectedInvoiceIds([]);
      setTimeout(() => setPaymentSuccessMessage(null), 5000);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Customer Wallet Top-up (Customer Sets Custom Amount)
  const handleTopUpWallet = (explicitAmount?: number) => {
    const rawVal = explicitAmount !== undefined ? explicitAmount : parseFloat(customTopUpInput);
    if (isNaN(rawVal) || rawVal <= 0) {
      alert('Please enter a valid deposit amount greater than 0.');
      return;
    }

    const chosenMethod = paymentMethods.find((p) => p.id === topUpMethodId) || paymentMethods[0];
    const newBalance = wallet.availableBalance + rawVal;

    onUpdateWalletSettings({
      availableBalance: newBalance,
    });

    // Add to deposit history
    setDepositHistory((prev) => [
      {
        id: `dep-${Date.now()}`,
        amount: rawVal,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        method: chosenMethod ? `${chosenMethod.name} (${chosenMethod.details})` : 'Direct Top-Up',
      },
      ...prev,
    ]);

    // Celebrate with confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#3B82F6', '#60A5FA', '#F59E0B']
      });
    } catch (e) {}

    setPaymentSuccessMessage(`🎉 Added ${currencySymbol}${rawVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to customer wallet balance! Current balance: ${currencySymbol}${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
    setShowTopUpModal(false);
    setTimeout(() => setPaymentSuccessMessage(null), 5000);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-300">
      
      {/* Success Notification Banner */}
      {paymentSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{paymentSuccessMessage}</span>
          </div>
          <button onClick={() => setPaymentSuccessMessage(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Financial Balance & "Pay All Things" Hero Box */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Customer Financial Overview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Customer Financial Command
              </span>
              <span className="text-xs text-slate-400">• Real-Time Settlement</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Customer Money & Route Payments
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Consolidated billing for dual-route deliveries, highway FastTrak tolls, dynamic fuel surcharges, and rapid driver bonuses. Set payment preferences or settle everything in one click.
            </p>

            {/* Quick Balance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">Available Wallet</span>
                    <button
                      type="button"
                      onClick={() => setShowTopUpModal(true)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Money</span>
                    </button>
                  </div>
                  <p className="font-mono text-xl sm:text-2xl font-black text-white mt-1">
                    {currencySymbol}{wallet.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Credit line active</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30">
                <span className="text-[11px] font-medium text-amber-300/90">Total Pending Due</span>
                <p className="font-mono text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  {currencySymbol}{totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {pendingInvoices.length} invoices outstanding
                </span>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-slate-400">Paid This Month</span>
                <p className="font-mono text-xl sm:text-2xl font-black text-slate-200 mt-1">
                  {currencySymbol}{wallet.totalPaidThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">100% On-Time</span>
              </div>
            </div>
          </div>

          {/* Pay All Action Card */}
          <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-400" />
                One-Click Settlement
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Zero Fees
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Selected Items ({selectedInvoiceIds.length} of {pendingInvoices.length})</span>
                <button
                  onClick={handleToggleSelectAll}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  {selectedInvoiceIds.length === pendingInvoices.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-semibold text-slate-200">Total To Settle:</span>
                <span className="font-mono text-3xl font-black text-white">
                  {currencySymbol}{selectedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Pay Using:</label>
              <select
                value={selectedPaymentMethodId}
                onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.details})
                  </option>
                ))}
              </select>
            </div>

            {/* "PAY ALL THINGS" Primary Button */}
            <button
              onClick={handleExecutePayAll}
              disabled={selectedInvoiceIds.length === 0 || isProcessingPayment}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                selectedInvoiceIds.length > 0 && !isProcessingPayment
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Settling Invoices...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <span>Pay All Selected (${selectedTotal.toFixed(2)})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                256-bit Encrypted Settlement
              </span>
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                Auto-Pay Rules
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Pay & Customer Wallet Threshold Controls (Collapsible or visible) */}
      {showSettingsDrawer && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Customer Auto-Pay & Auto-Reload Configuration
            </h3>
            <button onClick={() => setShowSettingsDrawer(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Auto Pay Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Auto-Pay Completed Routes</span>
                <input
                  type="checkbox"
                  checked={wallet.autoPayEnabled}
                  onChange={(e) => onUpdateWalletSettings({ autoPayEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When enabled, route charges, automated tolls, and driver fees settle instantly upon final waypoint completion.
              </p>
            </div>

            {/* Threshold Trigger */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Auto-Reload Threshold (${wallet.autoPayThreshold})
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={wallet.autoPayThreshold}
                onChange={(e) => onUpdateWalletSettings({ autoPayThreshold: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Trigger replenishment if wallet balance falls below ${wallet.autoPayThreshold}.
              </p>
            </div>

            {/* Reload Amount */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Replenish Amount (${wallet.autoPayReloadAmount})
              </label>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={wallet.autoPayReloadAmount}
                onChange={(e) => onUpdateWalletSettings({ autoPayReloadAmount: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Adds ${wallet.autoPayReloadAmount} from default payment card automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Grid & Wallet Top-up */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Methods */}
        <div className="lg:col-span-8 bg-slate-900/60 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Payment Options & Wallets</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage credit cards, direct ACH, and instant Solana SPL settlement</p>
            </div>
            <button
              onClick={() => setShowAddMethodModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {paymentMethods.map((pm) => {
              const isSelected = selectedPaymentMethodId === pm.id;
              return (
                <div
                  key={pm.id}
                  onClick={() => setSelectedPaymentMethodId(pm.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-950/30 border-blue-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                      {pm.type === 'card' && <CreditCard className="w-4 h-4" />}
                      {pm.type === 'bank' && <Building2 className="w-4 h-4" />}
                      {pm.type === 'crypto' && <Coins className="w-4 h-4 text-purple-400" />}
                      {pm.type === 'wallet' && <Wallet className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pm.name}</span>
                        {pm.isDefault && (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">Default</span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">{pm.details}</p>
                      {pm.expiry && <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">Exp: {pm.expiry}</span>}
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Add Money & Custom Wallet Deposit Card */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                Add Money (Set Custom Amount)
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Instant Top-Up
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Set any deposit amount to maintain positive balance for automated tolls & dispatch
            </p>

            {/* Custom Amount Input Field */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Enter Amount to Deposit:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-lg font-black text-emerald-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customTopUpInput}
                  onChange={(e) => {
                    setCustomTopUpInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setTopUpAmount(val);
                  }}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 text-white font-mono text-lg font-bold rounded-xl pl-8 pr-16 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                />
                {customTopUpInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTopUpInput('');
                      setTopUpAmount(0);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Quick Amount Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {(currencySymbol === '₹' ? [500, 1000, 2500, 5000, 10000, 25000] : [25, 50, 100, 250, 500, 1000]).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCustomTopUpInput(String(amt));
                      setTopUpAmount(amt);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                      parseFloat(customTopUpInput) === amt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    +{currencySymbol}{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Fund Via Selector */}
            <div className="mt-3.5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Fund From Payment Source:
              </label>
              <select
                value={topUpMethodId}
                onChange={(e) => setTopUpMethodId(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.details})
                  </option>
                ))}
              </select>
            </div>

            {/* Balance Preview */}
            <div className="mt-3.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Balance After Deposit:</span>
              <span className="font-mono font-bold text-emerald-400">
                {currencySymbol}
                {(
                  wallet.availableBalance + (parseFloat(customTopUpInput) || 0)
                ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleTopUpWallet()}
            disabled={!parseFloat(customTopUpInput) || parseFloat(customTopUpInput) <= 0}
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
              parseFloat(customTopUpInput) > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer scale-[1.01]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              Add {currencySymbol}
              {parseFloat(customTopUpInput)
                ? parseFloat(customTopUpInput).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                : '0.00'}{' '}
              to Wallet
            </span>
          </button>

          {/* Recent Deposit Records */}
          {depositHistory.length > 0 && (
            <div className="border-t border-slate-800/80 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Recent Deposits:
              </span>
              <div className="space-y-1.5">
                {depositHistory.slice(0, 2).map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{dep.method.slice(0, 18)}</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      +{currencySymbol}{dep.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices & Charges Table */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Itemized Invoices & Route Tolls</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and pay freight shipments, toll road charges, driver tips, and fuel surcharges
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({invoices.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterStatus === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({pendingInvoices.length})
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paid ({invoices.filter((i) => i.status === 'paid').length})
              </button>
            </div>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={pendingInvoices.length > 0 && selectedInvoiceIds.length === pendingInvoices.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Invoice / Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Issued</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredInvoices.map((inv) => {
                const isSelected = selectedInvoiceIds.includes(inv.id);
                const isPending = inv.status === 'pending';

                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected && isPending ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      {isPending ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleInvoice(inv.id)}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                      <div className="text-slate-300 font-normal truncate max-w-xs">{inv.description}</div>
                      {inv.routeTitle && (
                        <div className="text-[10px] text-blue-400 truncate mt-0.5">{inv.routeTitle}</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                        {inv.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      {inv.issuedDate}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-sm text-white">
                      ${inv.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      {inv.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Check className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending ? (
                          <button
                            onClick={() => onPaySingle(inv.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-all"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewReceipt(inv)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                            title="View Receipt Statement"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Payment Option */}
      {showAddMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Add Customer Payment Method
              </h4>
              <button onClick={() => setShowAddMethodModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Payment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setNewMethodType('card')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      newMethodType === 'card' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    onClick={() => setNewMethodType('bank')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      newMethodType === 'bank' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    ACH Bank
                  </button>
                  <button
                    onClick={() => setNewMethodType('crypto')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      newMethodType === 'crypto' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    Solana Escrow
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Account or Card Name</label>
                <input
                  type="text"
                  placeholder={newMethodType === 'card' ? 'e.g. Wells Fargo Business Visa' : 'e.g. Chase Operating ACH'}
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Details / Masked Number</label>
                <input
                  type="text"
                  placeholder={newMethodType === 'card' ? '•••• •••• •••• 9812' : 'Acct ending in 4920'}
                  value={newMethodDetails}
                  onChange={(e) => setNewMethodDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddMethodModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newMethodName.trim()) return;
                  onAddPaymentMethod({
                    type: newMethodType,
                    name: newMethodName,
                    details: newMethodDetails || '•••• •••• 1234',
                    iconName: newMethodType === 'card' ? 'CreditCard' : newMethodType === 'bank' ? 'Building2' : 'Coins',
                    isDefault: false,
                  });
                  setNewMethodName('');
                  setNewMethodDetails('');
                  setShowAddMethodModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
              >
                Save Payment Option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-Up Wallet Modal (Customer can set any amount) */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Top Up Customer Wallet</h3>
                  <p className="text-xs text-slate-400">Set any custom deposit amount</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Custom Amount input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Enter Amount to Deposit:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xl font-black text-emerald-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  autoFocus
                  value={customTopUpInput}
                  onChange={(e) => {
                    setCustomTopUpInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setTopUpAmount(val);
                  }}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 text-white font-mono text-xl font-bold rounded-2xl pl-9 pr-16 py-3 border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                />
                {customTopUpInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTopUpInput('');
                      setTopUpAmount(0);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick Amount Presets:</span>
              <div className="grid grid-cols-3 gap-2">
                {(currencySymbol === '₹' ? [1000, 2500, 5000, 10000, 25000, 50000] : [50, 100, 250, 500, 1000, 2500]).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCustomTopUpInput(String(amt));
                      setTopUpAmount(amt);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      parseFloat(customTopUpInput) === amt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    +{currencySymbol}{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Fund Via Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Payment Source:</label>
              <select
                value={topUpMethodId}
                onChange={(e) => setTopUpMethodId(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.details})
                  </option>
                ))}
              </select>
            </div>

            {/* Preview of New Balance */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current: {currencySymbol}{wallet.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className="text-slate-300 font-bold">➔</span>
              <span className="font-mono font-bold text-emerald-400">
                New: {currencySymbol}{(wallet.availableBalance + (parseFloat(customTopUpInput) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTopUpWallet()}
                disabled={!parseFloat(customTopUpInput) || parseFloat(customTopUpInput) <= 0}
                className={`flex-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                  parseFloat(customTopUpInput) > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add {currencySymbol}{parseFloat(customTopUpInput) ? parseFloat(customTopUpInput).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
