import React from 'react';
import { RouteData, Waypoint } from '../types/route';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  Zap, 
  Leaf, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Phone, 
  Award,
  AlertCircle,
  PackageCheck,
  CheckCircle2,
  CircleDot,
  Eye
} from 'lucide-react';

interface DualRouteMetricsProps {
  routeA: RouteData;
  routeB: RouteData;
  activeFilter: 'both' | 'route-a' | 'route-b';
  onSelectRoute: (routeId: 'route-a' | 'route-b') => void;
  onOpenDriverModal?: (driver: RouteData['driver']) => void;
  onOpenStopsList?: (route: RouteData) => void;
  onOpenVehicleModal?: (routeId: 'route-a' | 'route-b') => void;
  onOpenAddCustomRoute?: (routeId: 'route-a' | 'route-b') => void;
  onApplySameRouteEvVsDiesel?: () => void;
  onOpenEyeDetection?: (routeId: 'route-a' | 'route-b') => void;
  currencySymbol?: string;
}

export const DualRouteMetrics: React.FC<DualRouteMetricsProps> = ({
  routeA,
  routeB,
  activeFilter,
  onSelectRoute,
  onOpenDriverModal,
  onOpenStopsList,
  onOpenVehicleModal,
  onOpenAddCustomRoute,
  onApplySameRouteEvVsDiesel,
  onOpenEyeDetection,
  currencySymbol = '₹',
}) => {
  const routes = [routeA, routeB];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {routes.map((route) => {
        const isRouteA = route.id === 'route-a';
        const isFocused = activeFilter === route.id || activeFilter === 'both';
        const completedStops = route.waypoints.filter((w) => w.status === 'completed').length;
        const totalStops = route.waypoints.length;
        const currentStop = route.waypoints.find((w) => w.status === 'current') || route.waypoints[0];

        return (
          <div
            key={route.id}
            className={`relative rounded-2xl transition-all duration-300 border overflow-hidden ${
              isRouteA
                ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/30 border-blue-500/30 hover:border-blue-500/60 shadow-[0_4px_24px_rgba(59,130,246,0.12)]'
                : 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_4px_24px_rgba(16,185,129,0.12)]'
            } ${!isFocused ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}
          >
            {/* Top Accent Line */}
            <div
              className={`h-1.5 w-full ${
                isRouteA ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
            />

            <div className="p-6">
              {/* Header with Code, Tag, and Dispatch Status */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                      isRouteA ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold tracking-tight text-white">{route.code}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isRouteA
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {route.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{route.name}</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    In Transit
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{route.eta}</p>
                </div>
              </div>

              {/* Real-time Progress Bar */}
              <div className="my-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                    Delivery Progress: <strong className="text-slate-200">{completedStops} of {totalStops} stops completed</strong>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{route.currentProgressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isRouteA ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                    }`}
                    style={{ width: `${route.currentProgressPct}%` }}
                  />
                </div>

                {/* Waypoint micro-breadcrumbs */}
                <div className="mt-3 flex items-center justify-between gap-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 truncate max-w-[45%]">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{route.origin.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <div className="flex items-center gap-1 truncate max-w-[45%] text-slate-300 font-medium">
                    <MapPin className={`w-3 h-3 ${isRouteA ? 'text-blue-400' : 'text-emerald-400'} shrink-0`} />
                    <span className="truncate">{route.destination.name}</span>
                  </div>
                </div>
              </div>

              {/* Current Active Stop Highlight */}
              {currentStop && (
                <div className={`p-3 rounded-xl border mb-4 text-xs ${
                  isRouteA ? 'bg-blue-950/20 border-blue-900/50' : 'bg-emerald-950/20 border-emerald-900/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <CircleDot className={`w-3.5 h-3.5 animate-pulse ${isRouteA ? 'text-blue-400' : 'text-emerald-400'}`} />
                      Approaching Current Stop:
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 font-semibold">ETA: {currentStop.eta}</span>
                  </div>
                  <p className="text-white font-semibold mt-1 text-sm">{currentStop.name}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 truncate">{currentStop.address}</p>
                  {currentStop.notes && (
                    <div className="mt-1.5 text-[11px] text-amber-300/90 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40 inline-block">
                      Note: {currentStop.notes}
                    </div>
                  )}
                </div>
              )}

              {/* 4 Metric Badges: Distance, Cost, Speed/Fuel, Carbon Efficiency */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Navigation className="w-3 h-3 text-slate-400" />
                    <span>Distance</span>
                  </div>
                  <p className="font-mono text-base font-bold text-white mt-1">{route.distanceKm} <span className="text-xs font-normal text-slate-400">km</span></p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{route.durationMins} mins trip</p>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>Fare & Tolls</span>
                  </div>
                  <p className="font-mono text-base font-bold text-emerald-400 mt-1">{currencySymbol}{route.fareAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">+{currencySymbol}{route.tollAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })} automated toll</p>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Telemetry</span>
                  </div>
                  <p className="font-mono text-base font-bold text-white mt-1">{route.currentSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span></p>
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">{route.fuelLevelPct}% battery remaining</p>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Leaf className="w-3 h-3 text-emerald-400" />
                    <span>Eco Impact</span>
                  </div>
                  <p className="font-mono text-base font-bold text-white mt-1">{route.carbonSavedKg} <span className="text-xs font-normal text-slate-400">kg</span></p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{route.efficiencyScore}% efficiency</p>
                </div>
              </div>

              {/* Driver & Action Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => onOpenDriverModal?.(route.driver)}
                >
                  <img
                    src={route.driver.avatar}
                    alt={route.driver.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-blue-500 transition-all"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      {route.driver.name}
                      <span className="text-[10px] text-amber-400 font-mono">★ {route.driver.rating}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{route.driver.vehicle}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVehicleModal?.(route.id);
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenEyeDetection && (
                    <button
                      type="button"
                      onClick={() => onOpenEyeDetection(route.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        route.driver.eyeDetection?.isSleepy
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse'
                          : isRouteA
                          ? 'bg-blue-950/70 text-blue-300 border-blue-500/40 hover:bg-blue-900/60'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                      }`}
                      title="Driver Eye Detection & Drowsiness Telematics"
                    >
                      <Eye className={`w-3.5 h-3.5 ${route.driver.eyeDetection?.isSleepy ? 'text-rose-400' : 'text-cyan-400'}`} />
                      <span>Eye Detection</span>
                      {route.driver.eyeDetection?.isSleepy ? (
                        <span className="text-[10px] font-mono px-1 py-0.2 bg-rose-600 text-white rounded font-bold">SLEEPY</span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">Alert</span>
                      )}
                    </button>
                  )}

                  {onOpenAddCustomRoute && (
                    <button
                      type="button"
                      onClick={() => onOpenAddCustomRoute(route.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                        isRouteA
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                      title={`Customize ${isRouteA ? 'Route A' : 'Route B'} and align map to your selected places`}
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ Custom Route</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenVehicleModal?.(route.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                      isRouteA
                        ? 'bg-blue-950/60 text-blue-300 border-blue-500/40 hover:bg-blue-900/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                    }`}
                    title={`Choose or change vehicle for ${isRouteA ? 'Route A' : 'Route B'}`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Choose</span>
                    <span>Vehicle</span>
                  </button>

                  <button
                    onClick={() => onOpenStopsList?.(route)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1"
                  >
                    <span>All Stops ({totalStops})</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onSelectRoute(route.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isRouteA
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    Focus Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
