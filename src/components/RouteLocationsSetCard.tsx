import React, { useState } from 'react';
import { RouteData, LatLng, Waypoint } from '../types/route';
import { POPULAR_PLACES } from '../data/popularPlaces';
import { 
  MapPin, 
  Zap, 
  Leaf, 
  Fuel, 
  Truck, 
  ArrowRight, 
  Crosshair, 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Navigation, 
  Package, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';

interface RouteLocationsSetCardProps {
  routeA: RouteData;
  routeB: RouteData;
  currencySymbol: string;
  onSelectLocationOnMap?: (loc: LatLng, title: string) => void;
  onApplySameRouteEvVsDiesel?: () => void;
  onOpenAddCustomRoute?: (targetRouteId?: 'route-a' | 'route-b') => void;
  onFitAllLocations?: () => void;
  onQuickSetStartAndStop?: (
    startPlace: { name: string; address: string; lat: number; lng: number },
    destPlace: { name: string; address: string; lat: number; lng: number }
  ) => void;
}

export const RouteLocationsSetCard: React.FC<RouteLocationsSetCardProps> = ({
  routeA,
  routeB,
  currencySymbol = '₹',
  onSelectLocationOnMap,
  onApplySameRouteEvVsDiesel,
  onOpenAddCustomRoute,
  onFitAllLocations,
  onQuickSetStartAndStop,
}) => {
  const [activeTab, setActiveTab] = useState<'locations_set' | 'ev_vs_diesel_diff'>('ev_vs_diesel_diff');
  const [selectedRouteForLocations, setSelectedRouteForLocations] = useState<'route-a' | 'route-b'>('route-a');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showStartStopPicker, setShowStartStopPicker] = useState<boolean>(false);
  const [quickStartId, setQuickStartId] = useState<string>('place-del-okhla');
  const [quickDestId, setQuickDestId] = useState<string>('place-jaipur-vkia');

  const activeRoute = selectedRouteForLocations === 'route-a' ? routeA : routeB;

  // Compile all locations in the set
  const allLocationsInSet = [
    {
      id: 'origin',
      type: 'start' as const,
      label: 'Start Location (Origin)',
      name: activeRoute.origin.name,
      address: activeRoute.origin.address,
      location: activeRoute.origin.location,
      badge: 'Origin Hub',
      evFeature: 'DC Megawatt Fast Charging Depot & Battery Pre-conditioning',
      dieselFeature: 'Bulk High-Speed Diesel Dispenser & Automated Weighbridge',
      packages: 0,
      recipient: 'Departure Terminal',
    },
    ...activeRoute.waypoints.map((wp, idx) => ({
      id: wp.id,
      type: 'stop' as const,
      label: `Stop #${idx + 1}`,
      name: wp.name,
      address: wp.address,
      location: wp.location,
      badge: `Stop ${idx + 1} • ${wp.status.toUpperCase()}`,
      evFeature: 'Regenerative Braking Zone & 150kW Top-Up Charger',
      dieselFeature: 'Toll Corridor Checkpoint & Intermediate Transit Dock',
      packages: wp.packagesCount,
      recipient: wp.recipient,
      eta: wp.eta,
    })),
    {
      id: 'destination',
      type: 'destination' as const,
      label: 'End Location (Destination)',
      name: activeRoute.destination.name,
      address: activeRoute.destination.address,
      location: activeRoute.destination.location,
      badge: 'Arrival Terminal',
      evFeature: 'Overnight Depot Grid Balancing & Zero-Emission Offloading',
      dieselFeature: 'Freight Marshalling Yard & Idling Exhaust Management',
      packages: 0,
      recipient: 'Final Consignee',
    },
  ];

  // Environmental & Cost Differential Calculation
  const isRouteAEv = routeA.driver.vehicle.toLowerCase().includes('electric') || 
                     routeA.driver.vehicle.toLowerCase().includes('ev') || 
                     routeA.tag.toLowerCase().includes('electric') || 
                     routeA.tag.toLowerCase().includes('ev');

  const isRouteBDiesel = !routeB.driver.vehicle.toLowerCase().includes('electric') && 
                         !routeB.driver.vehicle.toLowerCase().includes('ev');

  // Baseline calculations
  const distanceKm = Math.round((routeA.distanceKm + routeB.distanceKm) / 2);
  
  // Diesel emits ~185 - 220 g CO2/km
  const dieselCo2GramsPerKm = 195;
  const dieselTotalEmittedKg = Number(((distanceKm * dieselCo2GramsPerKm) / 1000).toFixed(1));
  const dieselLitersBurned = Math.round(distanceKm / 3.6);
  const dieselFuelCost = Math.round(dieselLitersBurned * (currencySymbol === '₹' ? 94 : 3.8));

  // EV emits 0 g tailpipe CO2, saving 100% of emissions
  const evCo2TailpipeGrams = 0;
  const evCo2SavedKg = Number((dieselTotalEmittedKg * 0.95).toFixed(1));
  const evKwhConsumed = Math.round(distanceKm * 0.92);
  const evElectricityCost = Math.round(evKwhConsumed * (currencySymbol === '₹' ? 7.5 : 0.18));

  const fuelCostSavings = Math.max(0, dieselFuelCost - evElectricityCost);
  const tollDiscountSavings = Math.round(routeB.tollAmount * 0.35); // Green Pass 35% toll discount
  const totalFinancialBenefit = fuelCostSavings + tollDiscountSavings;

  const handleApplyQuickStartStop = () => {
    const startPlace = POPULAR_PLACES.find((p) => p.id === quickStartId);
    const destPlace = POPULAR_PLACES.find((p) => p.id === quickDestId);
    if (!startPlace || !destPlace) return;

    if (onQuickSetStartAndStop) {
      onQuickSetStartAndStop(
        { name: startPlace.name, address: startPlace.address, lat: startPlace.lat, lng: startPlace.lng },
        { name: destPlace.name, address: destPlace.address, lat: destPlace.lat, lng: destPlace.lng }
      );
    } else if (onOpenAddCustomRoute) {
      onOpenAddCustomRoute('route-a');
    }
    setShowStartStopPicker(false);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Same Route Diff: ⚡ EV vs ⛽ Diesel & All Locations in Set
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {allLocationsInSet.length} LOCATIONS IN SET
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare CO₂ footprint, tailpipe emissions, fuel costs, and inspect all {allLocationsInSet.length} locations (Start, Waypoints, End).
            </p>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('ev_vs_diesel_diff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ev_vs_diesel_diff'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>⚡ EV vs ⛽ Diesel Diff</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('locations_set')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'locations_set'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span>All Locations in Set ({allLocationsInSet.length})</span>
            </button>
          </div>

          {onFitAllLocations && (
            <button
              type="button"
              onClick={onFitAllLocations}
              title="Align and fit map camera to frame all locations in the set"
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Align Map to Set</span>
            </button>
          )}

          {onApplySameRouteEvVsDiesel && (
            <button
              type="button"
              onClick={onApplySameRouteEvVsDiesel}
              title="Apply exact same Start, Stops and End across Route A (⚡ EV) and Route B (⛽ Diesel)"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync Same Route (EV vs Diesel)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowStartStopPicker(!showStartStopPicker)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700/80 flex items-center gap-1.5"
            title="Set origin and destination locations directly"
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>{showStartStopPicker ? 'Close Picker' : 'Set Start & Stop'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Collapse Section' : 'Expand Section'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QUICK START & STOP SELECTOR PANEL */}
      {showStartStopPicker && (
        <div className="p-4 bg-slate-950/90 border-b border-slate-800/80 animate-in fade-in duration-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Set Start & Stop Location (Corridor Generator)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Pick Start Hub & Stop Terminal to instantly generate the full locations set and map alignment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="lg:col-span-2">
              <label className="text-[11px] font-bold text-amber-400 block mb-1">
                📍 1. Start Location (Origin Hub)
              </label>
              <select
                value={quickStartId}
                onChange={(e) => setQuickStartId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none focus:border-amber-400"
              >
                {POPULAR_PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-[11px] font-bold text-cyan-400 block mb-1">
                🏁 2. Stop Location (Destination Terminal)
              </label>
              <select
                value={quickDestId}
                onChange={(e) => setQuickDestId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none focus:border-cyan-400"
              >
                {POPULAR_PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyQuickStartStop}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply & Show Set</span>
              </button>

              {onOpenAddCustomRoute && (
                <button
                  type="button"
                  onClick={() => onOpenAddCustomRoute('route-a')}
                  title="Open full interactive stops studio"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-cyan-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: EV VS DIESEL CO2 & OPERATIONAL DIFFERENCE */}
          {activeTab === 'ev_vs_diesel_diff' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Highlight Comparison Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-blue-950/40 border border-emerald-800/40 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* EV Metric Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      <span>Route A • 100% Electric EV</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      ZERO TAILPIPE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                      <span>+{evCo2SavedKg}</span>
                      <span className="text-xs font-bold text-emerald-400">kg CO₂ Saved</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      0 g/km tailpipe emissions • {evKwhConsumed} kWh battery energy used
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Electricity Energy Cost:</span>
                    <span className="font-mono font-bold text-emerald-400">{currencySymbol}{evElectricityCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Green Pass Fastag Toll:</span>
                    <span className="font-mono font-bold text-emerald-300">35% Discount Applied</span>
                  </div>
                </div>

                {/* Diesel Metric Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-rose-400 flex items-center gap-1.5">
                      <Fuel className="w-4 h-4" />
                      <span>Route B • Euro-VI Diesel</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                      {dieselCo2GramsPerKm} G/KM CO₂
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-black text-rose-300 font-mono flex items-baseline gap-1">
                      <span>{dieselTotalEmittedKg}</span>
                      <span className="text-xs font-bold text-rose-400">kg CO₂ Emitted</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      {dieselLitersBurned} Liters diesel fuel burned along corridor
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Diesel Fuel Expense:</span>
                    <span className="font-mono font-bold text-rose-400">{currencySymbol}{dieselFuelCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Standard Highway Toll:</span>
                    <span className="font-mono font-bold text-slate-300">{currencySymbol}{routeB.tollAmount.toLocaleString('en-IN')} (Full Fee)</span>
                  </div>
                </div>

                {/* Net Difference & Benefit Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Net Difference (EV vs Diesel)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                      SAME {distanceKm} KM ROUTE
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Clean Carbon Delta:</span>
                      <span className="font-mono font-black text-emerald-400">
                        {dieselTotalEmittedKg} kg CO₂ Eliminated
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Fuel & Energy Savings:</span>
                      <span className="font-mono font-black text-emerald-400">
                        {currencySymbol}{fuelCostSavings.toLocaleString('en-IN')} ({Math.round((fuelCostSavings / Math.max(1, dieselFuelCost)) * 100)}% cheaper)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Green Toll Exemption:</span>
                      <span className="font-mono font-black text-emerald-400">
                        +{currencySymbol}{tollDiscountSavings.toLocaleString('en-IN')} Saved
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-[11px] text-emerald-200 font-medium">
                      ✓ Choosing EV on this route prevents <strong>{dieselTotalEmittedKg} kg</strong> of greenhouse emissions and saves <strong>{currencySymbol}{totalFinancialBenefit.toLocaleString('en-IN')}</strong> overall.
                    </div>
                  </div>
                </div>
              </div>

              {/* Waypoint Energy & Emission Breakdown for the Route Set */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span>Locations in Set: EV Charging vs Diesel Fuel Stops Comparison</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Shared Path: {routeA.origin.name.split('(')[0]} ➔ {routeA.destination.name.split('(')[0]}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {allLocationsInSet.map((loc, idx) => (
                    <div 
                      key={loc.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {idx === 0 ? '📍 START' : idx === allLocationsInSet.length - 1 ? '🏁 END' : `📦 STOP #${idx}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectLocationOnMap?.(loc.location, loc.name)}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>View Map</span>
                        </button>
                      </div>

                      <div className="font-bold text-xs text-white truncate" title={loc.name}>
                        {loc.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate" title={loc.address}>
                        {loc.address}
                      </div>

                      <div className="pt-1.5 border-t border-slate-800/80 space-y-1 text-[10px]">
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Zap className="w-3 h-3 shrink-0" />
                          <span className="truncate">{loc.evFeature}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Fuel className="w-3 h-3 shrink-0 text-amber-500" />
                          <span className="truncate">{loc.dieselFeature}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLETE LIST OF ALL LOCATIONS IN SET */}
          {activeTab === 'locations_set' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              
              {/* Route Selector Pill */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Viewing Set For:</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedRouteForLocations('route-a')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        selectedRouteForLocations === 'route-a'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Route A ({routeA.waypoints.length + 2} Places)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRouteForLocations('route-b')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        selectedRouteForLocations === 'route-b'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Route B ({routeB.waypoints.length + 2} Places)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onFitAllLocations && (
                    <button
                      type="button"
                      onClick={onFitAllLocations}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3 text-blue-400" />
                      <span>Align Map to Set</span>
                    </button>
                  )}
                  <div className="text-xs text-slate-400 font-mono">
                    All {allLocationsInSet.length} coordinates pinned on map
                  </div>
                </div>
              </div>

              {/* Table / List of All Locations in Set */}
              <div className="space-y-2">
                {allLocationsInSet.map((loc, idx) => (
                  <div
                    key={loc.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        loc.type === 'start'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : loc.type === 'destination'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {idx === 0 ? '📍' : idx === allLocationsInSet.length - 1 ? '🏁' : idx}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{loc.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                            loc.type === 'start'
                              ? 'bg-amber-500/20 text-amber-300'
                              : loc.type === 'destination'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {loc.badge}
                          </span>
                          {loc.packages > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              📦 {loc.packages} pkgs • {loc.recipient}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5">{loc.address}</p>

                        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-500">
                          <span>Lat: {loc.location.lat.toFixed(5)}</span>
                          <span>Lng: {loc.location.lng.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => onSelectLocationOnMap?.(loc.location, loc.name)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-800 hover:border-blue-500 shadow"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Focus on Map</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
