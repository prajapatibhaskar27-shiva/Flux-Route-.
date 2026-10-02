import React, { useState } from 'react';
import { RouteData } from '../types/route';
import { Phone, ShieldCheck, Send, Eye, AlertTriangle } from 'lucide-react';

interface DriverDispatchDrawerProps {
  driver: RouteData['driver'] | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEyeDetection?: () => void;
}

export const DriverDispatchDrawer: React.FC<DriverDispatchDrawerProps> = ({
  driver,
  isOpen,
  onClose,
  onOpenEyeDetection,
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([
    'Dispatch center: Toll plaza clearance verified on NH48. Proceed safely.',
    'Driver: Roger, crossing toll plaza now with zero delays.',
  ]);

  if (!isOpen || !driver) return null;

  const isSleepy = driver.eyeDetection?.isSleepy;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages([...messages, `Dispatcher: ${chatMessage}`]);
    setChatMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {driver.name}
                <span className="text-xs text-amber-400 font-mono">★ {driver.rating}</span>
              </h3>
              <p className="text-xs text-slate-400">{driver.vehicle}</p>
              <p className="text-[10px] font-mono text-slate-500">{driver.plate}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Eye Detection Status & Wake-Up Option Strip */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
          isSleepy
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200 animate-pulse'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isSleepy ? 'bg-rose-600 text-white' : 'bg-blue-600/20 text-cyan-400'}`}>
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold block">
                {isSleepy ? '⚠️ Driver Sleepiness Alert!' : '👁️ Cabin Eye Detection: Active'}
              </span>
              <p className="text-[10px] text-slate-400">
                {isSleepy ? 'Continuous eye closure > 2.0s detected' : 'Blink & PERCLOS within normal range (94% alert)'}
              </p>
            </div>
          </div>

          {onOpenEyeDetection && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEyeDetection();
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition shrink-0 cursor-pointer shadow"
            >
              Eye HUD
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${driver.phone}`}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Driver ({driver.phone})</span>
          </a>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300">Live Driver Comm Line</span>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 h-40 overflow-y-auto space-y-2 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-slate-200 ${
                  msg.startsWith('Dispatcher:')
                    ? 'bg-blue-900/40 border border-blue-800/50 ml-6 text-right'
                    : 'bg-slate-900 border border-slate-800 mr-6'
                }`}
              >
                {msg}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Send instruction or priority update..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
