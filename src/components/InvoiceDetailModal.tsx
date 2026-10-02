import React from 'react';
import { InvoiceItem } from '../types/route';
import { FileText, Printer, CheckCircle2, Clock } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: InvoiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  currencySymbol = '₹',
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tax Invoice Statement</h3>
              <p className="font-mono text-xs text-slate-400">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Billed Client</span>
              <p className="font-bold text-white mt-0.5">Bhaskar Prajapati</p>
              <p className="text-slate-400 text-[11px]">prajapatibhaskar27@gmail.com</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Settlement Status</span>
              <div className="mt-1">
                {invoice.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Paid & Cleared
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-bold uppercase tracking-wider text-[10px]">
                    <Clock className="w-3 h-3" /> Due for Settlement
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">{invoice.description}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{invoice.routeTitle || 'Corridor Transit Service'}</p>
              </div>
              <span className="font-mono font-bold text-base text-white">
                {currencySymbol}{invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono">{currencySymbol}{invoice.amount.toLocaleString('en-IN')}</span>
            </div>
            {invoice.paymentMethod && (
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode:</span>
                <span className="font-mono text-slate-300">{invoice.paymentMethod}</span>
              </div>
            )}
            {invoice.transactionHash && (
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-purple-400">{invoice.transactionHash}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
              <span>Amount Settle Total:</span>
              <span className="font-mono text-emerald-400">{currencySymbol}{invoice.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tax Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
