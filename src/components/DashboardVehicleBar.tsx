import React from 'react';
import { RouteData, VehicleOption } from '../types/route';
import { VEHICLE_OPTIONS } from '../data/mockVehicles';
import { 
  Truck, 
  Zap, 
  ArrowRightLeft, 
  ChevronDown, 
  Settings2, 
  Sparkles, 
  BatteryCharging, 
  Fuel, 
  Thermometer, 
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface DashboardVehicleBarProps {
  routeA: RouteData;
  routeB: RouteData;
  onOpenVehicleModal: (routeId: 'route-a' | 'route-b') => void;
  onQuickSelectVehicle: (routeId: 'route-a' | 'route-b', vehicleId: string) => void;
  onSwapVehicles: () => void;
  selectedVehicleAId: string;
  selectedVehicleBId: string;
  onOpenAddCustomRoute?: (routeId: 'route-a' | 'route-b') => void;
  onOpenEyeDetection?: (routeId: 'route-a' | 'route-b') => void;
}

export const DashboardVehicleBar: React.FC<DashboardVehicleBarProps> = ({
  routeA,
  routeB,
  onOpenVehicleModal,
  onQuickSelectVehicle,
  onSwapVehicles,
  selectedVehicleAId,
  selectedVehicleBId,
  onOpenAddCustomRoute,
  onOpenEyeDetection,
}) => {
  const currentVehA = VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleAId) || VEHICLE_OPTIONS[0];
  const currentVehB = VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleBId) || VEHICLE_OPTIONS[1];

  const hasSleepyAlert = routeA.driver.eyeDetection?.isSleepy || routeB.driver.eyeDetection?.isSleepy;

  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-white">Active Fleet Dispatch Selection</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                CHOOSE VEHICLE
              </span>
              {hasSleepyAlert && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold animate-pulse">
                  ⚠️ SLEEPY DRIVER ALERT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Change vehicles dynamically for Route A or Route B to simulate payload, eco scores, and toll fees.
            </p>
          </div>
        </div>

        {/* Action Button to Open Full Fleet Catalog Modal */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {onOpenEyeDetection && (
            <button
              type="button"
              onClick={() => onOpenEyeDetection(routeA.driver.eyeDetection?.isSleepy ? 'route-a' : routeB.driver.eyeDetection?.isSleepy ? 'route-b' : 'route-a')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                hasSleepyAlert
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse shadow-rose-600/30'
                  : 'bg-gradient-to-r from-cyan-600/30 via-blue-600/20 to-indigo-600/30 hover:from-cyan-600/50 hover:to-blue-600/40 text-cyan-200 border-cyan-500/40'
              }`}
              title="Driver Eye Detection & Sleepiness Telematics HUD"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{hasSleepyAlert ? '⚠️ Driver Sleepy Alert' : 'Driver Eye Detection'}</span>
            </button>
          )}

          {onOpenAddCustomRoute && (
            <button
              type="button"
              onClick={() => onOpenAddCustomRoute('route-a')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/25"
              title="Add a custom route corridor with your selected places"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>+ Add / Customize Route</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSwapVehicles}
            title="Swap vehicles between Route A and Route B"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700/60 shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Swap Vehicles</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenVehicleModal('route-a')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700/60 shadow-sm"
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vehicles (8)</span>
          </button>
        </div>
      </div>

      {/* Two Side-by-Side Quick Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80">
        
        {/* Route A Vehicle Picker Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-500/50 transition-all space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Route A Assigned Vehicle</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAddCustomRoute && (
                <button
                  type="button"
                  onClick={() => onOpenAddCustomRoute('route-a')}
                  className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-lg cursor-pointer flex items-center gap-1 transition"
                >
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span>Places</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenVehicleModal('route-a')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer flex items-center gap-1"
              >
                <span>Change</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white leading-tight">{currentVehA.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {currentVehA.plate} • <span className="text-blue-300">{currentVehA.categoryLabel}</span>
              </p>
            </div>

            {/* Quick Dropdown Selector for Route A */}
            <div className="relative min-w-[170px]">
              <select
                aria-label="Choose vehicle for Route A"
                value={selectedVehicleAId}
                onChange={(e) => onQuickSelectVehicle('route-a', e.target.value)}
                className="w-full bg-slate-900 border border-blue-500/40 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-400 cursor-pointer appearance-none pr-7 shadow-sm"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.name.split(' ')[0]} {v.name.split(' ')[1]} ({v.fuelType.includes('Electric') ? '⚡ EV' : '🚛 Hauler'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Micro Specs */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300 pt-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              Payload: <strong className="text-white">{currentVehA.capacityFormatted.split('(')[0]}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              Powertrain: <strong className="text-emerald-400">{currentVehA.fuelType}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              Range: <strong className="text-cyan-400">{currentVehA.rangeKm} km</strong>
            </span>
            {currentVehA.hasReefer && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
                ❄️ Reefer: {currentVehA.reeferTempCelsius}°C
              </span>
            )}
            {onOpenEyeDetection && (
              <button
                type="button"
                onClick={() => onOpenEyeDetection('route-a')}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  routeA.driver.eyeDetection?.isSleepy
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700/80 text-cyan-300 hover:text-white'
                }`}
                title="Open Route A Driver Eye Detection & Sleepiness Telematics"
              >
                <Eye className="w-3 h-3" />
                <span>
                  {routeA.driver.eyeDetection?.isSleepy
                    ? '⚠️ Sleepy Warning'
                    : `Eye DMS: ${routeA.driver.eyeDetection?.eyeClosurePct ?? 9}% PERCLOS`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Route B Vehicle Picker Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/50 transition-all space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Route B Assigned Vehicle</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAddCustomRoute && (
                <button
                  type="button"
                  onClick={() => onOpenAddCustomRoute('route-b')}
                  className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-lg cursor-pointer flex items-center gap-1 transition"
                >
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>Places</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenVehicleModal('route-b')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer flex items-center gap-1"
              >
                <span>Change</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white leading-tight">{currentVehB.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {currentVehB.plate} • <span className="text-emerald-300">{currentVehB.categoryLabel}</span>
              </p>
            </div>

            {/* Quick Dropdown Selector for Route B */}
            <div className="relative min-w-[170px]">
              <select
                aria-label="Choose vehicle for Route B"
                value={selectedVehicleBId}
                onChange={(e) => onQuickSelectVehicle('route-b', e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer appearance-none pr-7 shadow-sm"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.name.split(' ')[0]} {v.name.split(' ')[1]} ({v.fuelType.includes('Electric') ? '⚡ EV' : '🚛 Hauler'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Micro Specs */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300 pt-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              Payload: <strong className="text-white">{currentVehB.capacityFormatted.split('(')[0]}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              Powertrain: <strong className="text-emerald-400">{currentVehB.fuelType}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              Range: <strong className="text-cyan-400">{currentVehB.rangeKm} km</strong>
            </span>
            {currentVehB.hasReefer && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
                ❄️ Reefer: {currentVehB.reeferTempCelsius}°C
              </span>
            )}
            {onOpenEyeDetection && (
              <button
                type="button"
                onClick={() => onOpenEyeDetection('route-b')}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  routeB.driver.eyeDetection?.isSleepy
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700/80 text-emerald-300 hover:text-white'
                }`}
                title="Open Route B Driver Eye Detection & Sleepiness Telematics"
              >
                <Eye className="w-3 h-3" />
                <span>
                  {routeB.driver.eyeDetection?.isSleepy
                    ? '⚠️ Sleepy Warning'
                    : `Eye DMS: ${routeB.driver.eyeDetection?.eyeClosurePct ?? 11}% PERCLOS`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
