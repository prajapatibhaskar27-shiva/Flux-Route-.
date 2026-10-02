import React from 'react';
import { RouteData } from '../types/route';
import { Sparkles, Plus, Navigation, Settings2 } from 'lucide-react';

interface RoutePlannerViewProps {
  routeA: RouteData;
  routeB: RouteData;
  onOpenAddStop: (routeId: 'route-a' | 'route-b') => void;
  onOptimizeRoutes: () => void;
  onOpenAddCustomRoute?: (targetRouteId?: 'route-a' | 'route-b') => void;
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({
  routeA,
  routeB,
  onOpenAddStop,
  onOptimizeRoutes,
  onOpenAddCustomRoute,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Dynamic Indian Corridor Optimization Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare and solve Traveling Salesperson multi-stop corridors with real-time FASTag toll and fuel balancing
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenAddCustomRoute && (
            <button
              onClick={() => onOpenAddCustomRoute('route-a')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>+ Add / Customize Route</span>
            </button>
          )}

          <button
            onClick={onOptimizeRoutes}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Re-Optimize Dual Corridors (AI TSP)</span>
          </button>
        </div>
      </div>

      {/* DUAL PATH CORRIDOR STRATEGY CARD */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
            📍
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">Shared Start Point</span>
            <p className="text-sm font-bold text-white">{routeA.origin.name}</p>
            <p className="text-[11px] text-slate-400">{routeA.origin.address}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-center shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            2 DIVERGING PATHS
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Path A (Blue: {routeA.distanceKm} km) vs Path B (Green: {routeB.distanceKm} km)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
            🏁
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">Shared End Point</span>
            <p className="text-sm font-bold text-white">{routeA.destination.name}</p>
            <p className="text-[11px] text-slate-400">{routeA.destination.address}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route A Planner Card */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-blue-500/30 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3B82F6]" />
              <div>
                <h3 className="text-base font-bold text-white">{routeA.name}</h3>
                <span className="text-[11px] font-mono text-blue-400">{routeA.code} • Priority Corridor</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAddCustomRoute && (
                <button
                  type="button"
                  onClick={() => onOpenAddCustomRoute('route-a')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                  title="Customize places, origin, destination and stops for Route A"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Customize Route</span>
                </button>
              )}
              <button
                onClick={() => onOpenAddStop('route-a')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Sequential Stops</div>
            
            <div className="flex items-center gap-3 text-xs py-2 border-b border-slate-850">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">A</div>
              <div>
                <p className="font-semibold text-white">{routeA.origin.name}</p>
                <p className="text-[10px] text-slate-400">{routeA.origin.address}</p>
              </div>
            </div>

            {routeA.waypoints.map((wp, idx) => (
              <div key={wp.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-850">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                    wp.status === 'completed' ? 'bg-emerald-600' : wp.status === 'current' ? 'bg-amber-600' : 'bg-slate-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{wp.name}</p>
                    <p className="text-[10px] text-slate-400">{wp.address} • {wp.packagesCount} packages</p>
                  </div>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">{wp.eta}</span>
              </div>
            ))}

            <div className="flex items-center gap-3 text-xs py-2">
              <div className="w-6 h-6 rounded-full bg-indigo-900 border border-indigo-500 text-cyan-300 flex items-center justify-center font-bold text-[10px]">🏁</div>
              <div>
                <p className="font-semibold text-white">{routeA.destination.name}</p>
                <p className="text-[10px] text-slate-400">{routeA.destination.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Route B Planner Card */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-500/30 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
              <div>
                <h3 className="text-base font-bold text-white">{routeB.name}</h3>
                <span className="text-[11px] font-mono text-emerald-400">{routeB.code} • Eco Corridor</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAddCustomRoute && (
                <button
                  type="button"
                  onClick={() => onOpenAddCustomRoute('route-b')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                  title="Customize places, origin, destination and stops for Route B"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Customize Route</span>
                </button>
              )}
              <button
                onClick={() => onOpenAddStop('route-b')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Sequential Stops</div>
            
            <div className="flex items-center gap-3 text-xs py-2 border-b border-slate-850">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">B</div>
              <div>
                <p className="font-semibold text-white">{routeB.origin.name}</p>
                <p className="text-[10px] text-slate-400">{routeB.origin.address}</p>
              </div>
            </div>

            {routeB.waypoints.map((wp, idx) => (
              <div key={wp.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-850">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                    wp.status === 'completed' ? 'bg-emerald-600' : wp.status === 'current' ? 'bg-amber-600' : 'bg-slate-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{wp.name}</p>
                    <p className="text-[10px] text-slate-400">{wp.address} • {wp.packagesCount} packages</p>
                  </div>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">{wp.eta}</span>
              </div>
            ))}

            <div className="flex items-center gap-3 text-xs py-2">
              <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold text-[10px]">🏁</div>
              <div>
                <p className="font-semibold text-white">{routeB.destination.name}</p>
                <p className="text-[10px] text-slate-400">{routeB.destination.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
