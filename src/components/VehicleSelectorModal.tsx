import React, { useState } from 'react';
import { VehicleOption } from '../types/route';
import { VEHICLE_OPTIONS } from '../data/mockVehicles';
import { 
  Truck, 
  Zap, 
  Leaf, 
  ShieldCheck, 
  Thermometer, 
  Gauge, 
  Search, 
  X, 
  Check, 
  ArrowRightLeft,
  Sparkles,
  Info,
  Scale,
  BatteryCharging,
  Fuel,
  ChevronRight
} from 'lucide-react';

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRouteId: 'route-a' | 'route-b';
  onSelectRouteTarget: (routeId: 'route-a' | 'route-b') => void;
  onAssignVehicle: (routeId: 'route-a' | 'route-b', vehicle: VehicleOption) => void;
  currentVehicleAId: string;
  currentVehicleBId: string;
  routeAName: string;
  routeBName: string;
}

export const VehicleSelectorModal: React.FC<VehicleSelectorModalProps> = ({
  isOpen,
  onClose,
  targetRouteId,
  onSelectRouteTarget,
  onAssignVehicle,
  currentVehicleAId,
  currentVehicleBId,
  routeAName,
  routeBName,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Fleet Vehicles' },
    { id: 'electric', label: '⚡ 100% Electric EV' },
    { id: 'heavy', label: '🚛 Heavy Haulers (28T-55T)' },
    { id: 'reefer', label: '❄️ Cold-Chain Reefer' },
    { id: 'medium', label: '📦 Medium & Urban Delivery' },
  ];

  const filteredVehicles = VEHICLE_OPTIONS.filter((veh) => {
    const matchesCategory = 
      activeCategory === 'all' ? true :
      activeCategory === 'electric' ? (veh.category === 'electric_van' || veh.category === 'ev_semi' || veh.fuelType.includes('Electric')) :
      activeCategory === 'heavy' ? (veh.category === 'heavy_truck' || veh.category === 'container_trailer') :
      activeCategory === 'reefer' ? veh.hasReefer :
      activeCategory === 'medium' ? (veh.category === 'medium_truck' || veh.category === 'electric_van') : true;

    const matchesSearch = 
      veh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.cargoType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.fuelType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleApplyVehicle = (vehicle: VehicleOption, routeId: 'route-a' | 'route-b') => {
    onAssignVehicle(routeId, vehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-white">Choose Fleet Vehicle</h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                8 Ready for Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Select and assign commercial haulers, electric vans, or cold-chain reefers to Route A or Route B
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close vehicle selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Route Switcher Banner */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Assign Selected Vehicle To:</span>
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => onSelectRouteTarget('route-a')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  targetRouteId === 'route-a'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Route A (Blue Corridor)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRouteTarget('route-b')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  targetRouteId === 'route-b'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Route B (Emerald Corridor)</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono hidden md:block">
            Currently on Route A: <span className="text-blue-400 font-semibold">{VEHICLE_OPTIONS.find(v => v.id === currentVehicleAId)?.name.split(' ')[0] || 'BharatBenz'}</span>
            {' • '}
            Route B: <span className="text-emerald-400 font-semibold">{VEHICLE_OPTIONS.find(v => v.id === currentVehicleBId)?.name.split(' ')[0] || 'Tata Prima'}</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:px-6 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle model, plate, fuel..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Vehicle Grid (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[58vh] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVehicles.map((vehicle) => {
              const isAssignedToRouteA = currentVehicleAId === vehicle.id;
              const isAssignedToRouteB = currentVehicleBId === vehicle.id;
              const isSelectedTarget = targetRouteId === 'route-a' ? isAssignedToRouteA : isAssignedToRouteB;

              return (
                <div
                  key={vehicle.id}
                  className={`relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isSelectedTarget
                      ? targetRouteId === 'route-a'
                        ? 'bg-blue-950/30 border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                        : 'bg-emerald-950/30 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    {/* Top Row: Tag, Plate, Assignment Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {vehicle.plate}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            vehicle.fuelType.includes('Electric')
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : vehicle.fuelType.includes('LNG') || vehicle.fuelType.includes('CNG')
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {vehicle.fuelType}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1 leading-snug">{vehicle.name}</h3>
                        <p className="text-[11px] text-slate-400">{vehicle.model}</p>
                      </div>

                      {/* Current Assignment Badges */}
                      <div className="flex flex-col items-end gap-1">
                        {isAssignedToRouteA && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Route A Active
                          </span>
                        )}
                        {isAssignedToRouteB && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Route B Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spec Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-850 text-xs">
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Payload</span>
                        <span className="font-mono font-bold text-white text-xs">{vehicle.capacityFormatted.split('(')[0]}</span>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Est. Range</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">{vehicle.rangeKm} km</span>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Avg Speed</span>
                        <span className="font-mono font-bold text-amber-300 text-xs">{vehicle.avgSpeedKmh} km/h</span>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Toll Class</span>
                        <span className="font-mono font-bold text-slate-300 text-[10px] truncate block" title={vehicle.tollClass}>
                          {vehicle.tollClass.split('(')[0].trim()}
                        </span>
                      </div>
                    </div>

                    {/* Cargo & Features */}
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                      <div>
                        <strong className="text-slate-300">Optimal Cargo:</strong> {vehicle.cargoType}
                      </div>
                      {vehicle.hasReefer && (
                        <div className="text-cyan-300 flex items-center gap-1 font-medium">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>Active Reefer Sensor: Set to {vehicle.reeferTempCelsius}°C</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vehicle.features.slice(0, 3).map((f, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-850 text-slate-400 border border-slate-750">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-3 bg-slate-950 border-t border-slate-850 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      Eco Score: <strong className="text-emerald-400">{vehicle.efficiencyScore}%</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyVehicle(vehicle, 'route-a')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isAssignedToRouteA
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        <span>{isAssignedToRouteA ? 'Assigned A' : 'Assign to Route A'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyVehicle(vehicle, 'route-b')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isAssignedToRouteB
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        <span>{isAssignedToRouteB ? 'Assigned B' : 'Assign to Route B'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12 text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Truck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-white">No vehicles match your search filter</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for &quot;Electric&quot;, &quot;Trailer&quot;, or &quot;Tata&quot;</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Changing vehicles automatically recalculates live speed, eco score, tolls, and cargo telemetry.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
