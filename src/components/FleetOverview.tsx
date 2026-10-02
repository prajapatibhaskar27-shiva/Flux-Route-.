import React from 'react';
import { RouteData } from '../types/route';
import { Truck, Zap, Thermometer, Battery, Shield, Eye, AlertTriangle } from 'lucide-react';

interface FleetOverviewProps {
  routeA: RouteData;
  routeB: RouteData;
  onSelectRoute: (routeId: 'route-a' | 'route-b') => void;
  onOpenVehicleModal?: (routeId: 'route-a' | 'route-b') => void;
  onOpenEyeDetection?: (routeId: 'route-a' | 'route-b') => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
  routeA,
  routeB,
  onSelectRoute,
  onOpenVehicleModal,
  onOpenEyeDetection,
}) => {
  const fleet = [routeA, routeB];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Active Indian Fleet Diagnostics & Telematics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Live sensor feeds, battery SoC, reefer temperature, and payload telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenVehicleModal && (
            <button
              type="button"
              onClick={() => onOpenVehicleModal('route-a')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Choose / Assign Vehicle</span>
            </button>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            2 Commercial Vehicles Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fleet.map((r) => {
          const isRouteA = r.id === 'route-a';
          return (
            <div
              key={r.id}
              className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                    isRouteA ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      {r.driver.plate}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{r.driver.vehicle}</h3>
                    <p className="text-xs text-slate-400">Assigned Driver: <strong className="text-slate-200">{r.driver.name}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {onOpenEyeDetection && (
                    <button
                      type="button"
                      onClick={() => onOpenEyeDetection(r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                        r.driver.eyeDetection?.isSleepy
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-rose-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                      }`}
                      title="Driver Eye Detection & Drowsiness Telematics HUD"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{r.driver.eyeDetection?.isSleepy ? '⚠️ Sleepy Alert' : 'Eye DMS HUD'}</span>
                    </button>
                  )}
                  {onOpenVehicleModal && (
                    <button
                      type="button"
                      onClick={() => onOpenVehicleModal(r.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                    >
                      Change Vehicle
                    </button>
                  )}
                  <button
                    onClick={() => onSelectRoute(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isRouteA ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    Track Live
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery SoC</span>
                  </div>
                  <p className="font-mono text-base font-bold text-white mt-1">{r.fuelLevelPct}%</p>
                  <span className="text-[10px] text-emerald-400 font-mono">220 km range</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reefer Cargo</span>
                  </div>
                  <p className="font-mono text-base font-bold text-cyan-300 mt-1">
                    {r.temperatureCelsius ? `${r.temperatureCelsius}°C` : 'Ambient'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Optimal</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speed</span>
                  </div>
                  <p className="font-mono text-base font-bold text-white mt-1">{r.currentSpeedKmh} <span className="text-xs text-slate-400">km/h</span></p>
                  <span className="text-[10px] text-amber-400 font-mono">Cruise Safe</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>Payload</span>
                  </div>
                  <p className="font-mono text-base font-bold text-white mt-1">
                    {r.waypoints.reduce((sum, wp) => sum + wp.packagesCount, 0)} <span className="text-xs text-slate-400">pkgs</span>
                  </p>
                  <span className="text-[10px] text-blue-400 font-mono">E-Way Bill Ready</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Waypoint Dispatch Manifest:</span>
                {r.waypoints.map((wp) => (
                  <div key={wp.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        wp.status === 'completed' ? 'bg-emerald-400' : wp.status === 'current' ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                      }`} />
                      <span className="text-white font-medium">{wp.name}</span>
                      <span className="text-slate-400 text-[11px]">({wp.recipient})</span>
                    </div>
                    <span className="font-mono text-slate-400">{wp.eta}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
