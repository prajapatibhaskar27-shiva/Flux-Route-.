import React, { useState } from 'react';
import { RouteData, Waypoint, LatLng } from '../types/route';
import { POPULAR_PLACES } from '../data/popularPlaces';
import { geocodePlaceAddress } from '../services/routeDirectionsService';
import { MapPin, Plus, Sparkles } from 'lucide-react';

interface RoutePlannerModalProps {
  route: RouteData;
  isOpen: boolean;
  onClose: () => void;
  onAddWaypoint: (routeId: 'route-a' | 'route-b', waypoint: Omit<Waypoint, 'id'>) => void;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  route,
  isOpen,
  onClose,
  onAddWaypoint,
}) => {
  const [stopName, setStopName] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [packagesCount, setPackagesCount] = useState<number>(5);
  const [customLocation, setCustomLocation] = useState<LatLng | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  if (!isOpen) return null;

  const handleSelectPresetPlace = (placeId: string) => {
    const place = POPULAR_PLACES.find((p) => p.id === placeId);
    if (place) {
      setStopName(place.name);
      setStopAddress(place.address);
      setCustomLocation({ lat: place.lat, lng: place.lng });
    }
  };

  const handleVerifyAddress = async () => {
    if (!stopAddress.trim()) return;
    setIsGeocoding(true);
    const coords = await geocodePlaceAddress(stopAddress);
    setIsGeocoding(false);
    if (coords) {
      setCustomLocation(coords);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName.trim() || !stopAddress.trim()) return;

    let finalLoc: LatLng;
    if (customLocation) {
      finalLoc = customLocation;
    } else {
      // Interpolate along route coordinates if not explicitly set
      const progressRatio = 0.35 + Math.random() * 0.35;
      const baseLat = route.origin.location.lat + (route.destination.location.lat - route.origin.location.lat) * progressRatio;
      const baseLng = route.origin.location.lng + (route.destination.location.lng - route.origin.location.lng) * progressRatio;
      finalLoc = {
        lat: Number(baseLat.toFixed(5)),
        lng: Number(baseLng.toFixed(5)),
      };
    }

    onAddWaypoint(route.id, {
      name: stopName,
      address: stopAddress,
      location: finalLoc,
      status: 'pending',
      eta: 'Next Scheduled Stop',
      packagesCount: Number(packagesCount) || 1,
      recipient: recipient || 'Logistics Receiving Bay',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${route.id === 'route-a' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            <h3 className="text-base font-bold text-white">
              Add Waypoint / Stop to {route.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        {/* Quick Pick Known Logistics Hub */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Known Hub or Industrial Zone</span>
          </label>
          <select
            onChange={(e) => handleSelectPresetPlace(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
          >
            <option value="">-- Choose place from catalog --</option>
            {POPULAR_PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.city})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Stop / Warehouse Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rewari Industrial Logistics Hub"
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Location Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. NH 48, Sector 12, Rewari, Haryana"
                value={stopAddress}
                onChange={(e) => setStopAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleVerifyAddress}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-semibold transition shrink-0 cursor-pointer"
              >
                {isGeocoding ? 'Verifying...' : 'Verify Pin'}
              </button>
            </div>
            {customLocation && (
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                ✓ Pinned at {customLocation.lat.toFixed(4)}, {customLocation.lng.toFixed(4)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Recipient / Business</label>
              <input
                type="text"
                placeholder="e.g. Haryana Freight Co."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Package Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={packagesCount}
                onChange={(e) => setPackagesCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg transition-all cursor-pointer ${
                route.id === 'route-a' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              Add Stop & Align Route
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
