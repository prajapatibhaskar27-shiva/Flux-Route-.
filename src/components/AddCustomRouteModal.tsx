import React, { useState } from 'react';
import { RouteData, Waypoint, LatLng, VehicleOption } from '../types/route';
import { POPULAR_PLACES, PresetPlace } from '../data/popularPlaces';
import { VEHICLE_OPTIONS } from '../data/mockVehicles';
import { geocodePlaceAddress } from '../services/routeDirectionsService';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Search, 
  Compass, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  CornerDownRight,
  ChevronDown,
  Building,
  Flag
} from 'lucide-react';

interface AddCustomRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRouteA: RouteData;
  currentRouteB: RouteData;
  initialTargetRouteId?: 'route-a' | 'route-b' | 'both_ev_vs_diesel';
  onApplyCustomRoute: (
    targetRouteId: 'route-a' | 'route-b' | 'both_ev_vs_diesel',
    routeData: {
      name: string;
      code: string;
      tag: string;
      origin: { name: string; address: string; location: LatLng };
      destination: { name: string; address: string; location: LatLng };
      waypoints: Waypoint[];
      vehicleId?: string;
    }
  ) => Promise<void> | void;
}

interface StopDraft {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  packagesCount: number;
  recipient: string;
}

export const AddCustomRouteModal: React.FC<AddCustomRouteModalProps> = ({
  isOpen,
  onClose,
  currentRouteA,
  currentRouteB,
  initialTargetRouteId = 'route-a',
  onApplyCustomRoute,
}) => {
  const [targetRouteId, setTargetRouteId] = useState<'route-a' | 'route-b' | 'both_ev_vs_diesel'>(initialTargetRouteId);
  const [routeName, setRouteName] = useState<string>('Delhi to Jaipur Golden Expressway');
  const [routeCode, setRouteCode] = useState<string>('FX-DEL-JAI-1');
  const [routeTag, setRouteTag] = useState<string>('NH-48 Golden Corridor');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('bharatbenz-2823r');

  React.useEffect(() => {
    if (initialTargetRouteId) {
      setTargetRouteId(initialTargetRouteId);
    }
  }, [initialTargetRouteId, isOpen]);

  // Origin Place
  const [originName, setOriginName] = useState<string>('Delhi NCR Central Logistics Park (Okhla)');
  const [originAddress, setOriginAddress] = useState<string>('Okhla Industrial Area Phase-III, New Delhi 110020');
  const [originLocation, setOriginLocation] = useState<LatLng>({ lat: 28.5200, lng: 77.2900 });

  // Destination Place
  const [destName, setDestName] = useState<string>('Jaipur Sitapura Industrial Logistics Terminal');
  const [destAddress, setDestAddress] = useState<string>('RIICO Industrial Area, Sitapura, Jaipur, Rajasthan 302022');
  const [destLocation, setDestLocation] = useState<LatLng>({ lat: 26.7820, lng: 75.8280 });

  // Intermediate Stops (Selected Places)
  const [stops, setStops] = useState<StopDraft[]>([
    {
      id: 'stop-1',
      name: 'Gurgaon-Manesar IMT Auto Freight Yard',
      address: 'IMT Manesar Sector 8, NH-48, Haryana 122051',
      location: { lat: 28.3580, lng: 76.9280 },
      packagesCount: 18,
      recipient: 'Maruti Suzuki Ancillary Staging',
    },
    {
      id: 'stop-2',
      name: 'Neemrana Multi-Modal Dry Port & Japanese Zone',
      address: 'Delhi-Jaipur Highway NH-48, Neemrana, Rajasthan 301705',
      location: { lat: 27.9950, lng: 76.3880 },
      packagesCount: 24,
      recipient: 'Daikin India Export Facility',
    },
  ]);

  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Preset Corridor Templates for instant testing
  const handleApplyTemplate = (
    templateKey: 'delhi_jaipur' | 'delhi_agra' | 'mumbai_pune' | 'blr_mysuru' | 'sf_bay' | 'nyc_metro'
  ) => {
    if (templateKey === 'delhi_jaipur') {
      setRouteName('Delhi to Jaipur NH-48 Golden Freight Highway');
      setRouteCode('FX-DEL-JAI-1');
      setRouteTag('NH-48 Express Corridor');
      setOriginName('Delhi NCR Central Logistics Park (Okhla)');
      setOriginAddress('Okhla Industrial Area Phase-III, New Delhi 110020');
      setOriginLocation({ lat: 28.5200, lng: 77.2900 });
      setDestName('Jaipur Sitapura Industrial Logistics Terminal');
      setDestAddress('RIICO Industrial Area, Sitapura, Jaipur, Rajasthan 302022');
      setDestLocation({ lat: 26.7820, lng: 75.8280 });
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          name: 'Gurgaon-Manesar IMT Auto Freight Yard',
          address: 'IMT Manesar Sector 8, NH-48, Haryana 122051',
          location: { lat: 28.3580, lng: 76.9280 },
          packagesCount: 20,
          recipient: 'Honda Motorcycle Warehouse',
        },
        {
          id: `stop-${Date.now()}-2`,
          name: 'Neemrana Multi-Modal Dry Port & Japanese Zone',
          address: 'Delhi-Jaipur Highway NH-48, Neemrana, Rajasthan 301705',
          location: { lat: 27.9950, lng: 76.3880 },
          packagesCount: 26,
          recipient: 'Japanese Industrial Corridor Depot',
        },
      ]);
    } else if (templateKey === 'delhi_agra') {
      setRouteName('Yamuna Expressway Smart Freight Corridor');
      setRouteCode('FX-DEL-AGR-X');
      setRouteTag('Yamuna Expressway (6-Lanes)');
      setOriginName('Delhi NCR Central Logistics Park (Okhla)');
      setOriginAddress('Okhla Industrial Area Phase-III, New Delhi 110020');
      setOriginLocation({ lat: 28.5200, lng: 77.2900 });
      setDestName('Agra Taj Inland Container Depot (ICD)');
      setDestAddress('NH-19 Transport Nagar, Agra, UP 282007');
      setDestLocation({ lat: 27.1767, lng: 78.0081 });
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          name: 'Noida Expressway Sector 128 Tech Annex',
          address: 'Jaypee Wish Town, Noida, UP 201304',
          location: { lat: 28.5150, lng: 77.3750 },
          packagesCount: 16,
          recipient: 'Samsung India R&D Staging',
        },
        {
          id: `stop-${Date.now()}-2`,
          name: 'Jewar International Airport Cargo Terminal',
          address: 'Yamuna Expressway Mile 40, Jewar, UP 203135',
          location: { lat: 28.1800, lng: 77.6200 },
          packagesCount: 30,
          recipient: 'Noida International Airport Air Cargo Hub',
        },
      ]);
    } else if (templateKey === 'mumbai_pune') {
      setRouteName('Mumbai-Pune Industrial Highway Logistics');
      setRouteCode('FX-MUM-PUN-3');
      setRouteTag('Expressway & MIDC Corridor');
      setOriginName('JNPT Nhava Sheva International Port Terminal');
      setOriginAddress('Nhava Sheva Port, Navi Mumbai, Maharashtra 400707');
      setOriginLocation({ lat: 18.9499, lng: 72.9511 });
      setDestName('Hinjawadi IT Park Logistics Hub (Pune)');
      setDestAddress('Phase-2 Tech Zone, Hinjawadi, Pune, Maharashtra 411057');
      setDestLocation({ lat: 18.5913, lng: 73.7389 });
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          name: 'Panvel Multi-Modal Logistics Yard',
          address: 'Old Mumbai-Pune Highway, Panvel, Maharashtra 410206',
          location: { lat: 18.9902, lng: 73.1200 },
          packagesCount: 15,
          recipient: 'Panvel Dry Port Depot',
        },
        {
          id: `stop-${Date.now()}-2`,
          name: 'Chakan Industrial Auto Corridor',
          address: 'MIDC Phase-III, Chakan, Pune 410501',
          location: { lat: 18.7550, lng: 73.8650 },
          packagesCount: 22,
          recipient: 'Bajaj Auto Ancillary Staging',
        },
      ]);
    } else if (templateKey === 'blr_mysuru') {
      setRouteName('Bengaluru to Mysuru 10-Lane Expressway');
      setRouteCode('FX-BLR-MYS-1');
      setRouteTag('NH-275 Express Corridor');
      setOriginName('Bengaluru Electronic City Logistics Depot');
      setOriginAddress('Hosur Road, Electronic City Phase 1, Bengaluru 560100');
      setOriginLocation({ lat: 12.8450, lng: 77.6650 });
      setDestName('Mysuru Hebbal Industrial Area Cargo Hub');
      setDestAddress('Hebbal Industrial Estate, Ring Road, Mysuru 570018');
      setDestLocation({ lat: 12.3650, lng: 76.6150 });
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          name: 'Bidadi Toyota Auto Ancillary Zone',
          address: 'Bidadi Industrial Area, Ramanagara, Karnataka 562109',
          location: { lat: 12.7950, lng: 77.3850 },
          packagesCount: 28,
          recipient: 'Toyota Kirloskar Components',
        },
      ]);
    } else if (templateKey === 'sf_bay') {
      setRouteName('SF to Silicon Valley Express Logistics');
      setRouteCode('FX-SF-SJC-1');
      setRouteTag('US-101 Freight Corridor');
      setOriginName('Port of San Francisco Intermodal Terminal');
      setOriginAddress('Pier 27 The Embarcadero, San Francisco, CA 94111');
      setOriginLocation({ lat: 37.8010, lng: -122.4005 });
      setDestName('San Jose Innovation Freight Yard');
      setDestAddress('N 1st St & Component Dr, San Jose, CA 95134');
      setDestLocation({ lat: 37.3860, lng: -121.9290 });
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          name: 'South San Francisco Biotech Logistics Hub',
          address: 'Oyster Point Blvd, South San Francisco, CA 94080',
          location: { lat: 37.6620, lng: -122.3850 },
          packagesCount: 19,
          recipient: 'Genentech Distribution Wing',
        },
        {
          id: `stop-${Date.now()}-2`,
          name: 'Palo Alto Stanford Industrial Staging',
          address: 'Page Mill Rd, Palo Alto, CA 94304',
          location: { lat: 37.4200, lng: -122.1400 },
          packagesCount: 22,
          recipient: 'Tesla / Stanford Research Park',
        },
      ]);
    } else if (templateKey === 'nyc_metro') {
      setRouteName('NYC Metro to Port Newark Heavy Freight');
      setRouteCode('FX-NYC-NWK-1');
      setRouteTag('I-278 & NJ Turnpike Corridor');
      setOriginName('JFK International Airport Air Cargo Center');
      setOriginAddress('North Boundary Rd, Jamaica, NY 11430');
      setOriginLocation({ lat: 40.6413, lng: -73.7781 });
      setDestName('Port Newark Container Terminal (PNCT)');
      setDestAddress('Corbin St, Port Newark, NJ 07114');
      setDestLocation({ lat: 40.6895, lng: -74.1502 });
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          name: 'Brooklyn Navy Yard Logistics Hub',
          address: 'Flushing Ave, Brooklyn, NY 11205',
          location: { lat: 40.7010, lng: -73.9730 },
          packagesCount: 24,
          recipient: 'Steiner Studios Freight Staging',
        },
      ]);
    }
  };

  const handleSelectOriginPreset = (place: PresetPlace) => {
    setOriginName(place.name);
    setOriginAddress(place.address);
    setOriginLocation({ lat: place.lat, lng: place.lng });
  };

  const handleSelectDestPreset = (place: PresetPlace) => {
    setDestName(place.name);
    setDestAddress(place.address);
    setDestLocation({ lat: place.lat, lng: place.lng });
  };

  const handleAddStop = (place?: PresetPlace) => {
    const defaultPlace = place || POPULAR_PLACES[0];
    const newStop: StopDraft = {
      id: `stop-${Date.now()}`,
      name: defaultPlace.name,
      address: defaultPlace.address,
      location: { lat: defaultPlace.lat, lng: defaultPlace.lng },
      packagesCount: 15,
      recipient: 'Cargo Staging Dock',
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id: string, updates: Partial<StopDraft>) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Try to geocode if user inputs custom address
  const handleGeocodeAddress = async (type: 'origin' | 'dest' | string, addressToGeocode: string) => {
    if (!addressToGeocode.trim()) return;
    setIsGeocoding(true);
    const coords = await geocodePlaceAddress(addressToGeocode);
    setIsGeocoding(false);
    if (coords) {
      if (type === 'origin') {
        setOriginLocation(coords);
      } else if (type === 'dest') {
        setDestLocation(coords);
      } else {
        handleUpdateStop(type, { location: coords });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedWaypoints: Waypoint[] = stops.map((s, idx) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        location: s.location,
        status: idx === 0 ? 'current' : 'pending',
        eta: `Stop ${idx + 1}`,
        packagesCount: s.packagesCount,
        recipient: s.recipient,
        notes: `Selected route stop: ${s.name}`,
      }));

      await onApplyCustomRoute(targetRouteId, {
        name: routeName,
        code: routeCode,
        tag: routeTag,
        origin: {
          name: originName,
          address: originAddress,
          location: originLocation,
        },
        destination: {
          name: destName,
          address: destAddress,
          location: destLocation,
        },
        waypoints: formattedWaypoints,
        vehicleId: selectedVehicleId,
      });

      onClose();
    } catch (err) {
      console.error('Error applying custom route:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlaces = POPULAR_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Add Route & Align Map to Selected Places</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Highway Snapping
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure your starting hub, stops, and terminal. The map camera will automatically frame and snap driving lines to your selected places.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Quick Corridor Templates */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Corridor Presets (Instant Populate)</span>
            </span>
            <span className="text-[10px] text-slate-500">Click to load route & places</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate('delhi_jaipur')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 text-left transition group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-blue-400">Delhi ➔ Jaipur</div>
              <div className="text-[10px] text-slate-400 truncate">NH-48 Golden Hub</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyTemplate('delhi_agra')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 text-left transition group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-blue-400">Delhi ➔ Agra</div>
              <div className="text-[10px] text-slate-400 truncate">Yamuna Expressway</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyTemplate('mumbai_pune')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-900/40 border border-slate-800 hover:border-emerald-500/50 text-left transition group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-emerald-400">Mumbai ➔ Pune</div>
              <div className="text-[10px] text-slate-400 truncate">Expressway & MIDC</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyTemplate('blr_mysuru')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500/50 text-left transition group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-indigo-400">Bangalore ➔ Mysuru</div>
              <div className="text-[10px] text-slate-400 truncate">NH-275 Expressway</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyTemplate('sf_bay')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-900/40 border border-slate-800 hover:border-cyan-500/50 text-left transition group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-400">SF ➔ San Jose</div>
              <div className="text-[10px] text-slate-400 truncate">US-101 Silicon Valley</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyTemplate('nyc_metro')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-amber-900/40 border border-slate-800 hover:border-amber-500/50 text-left transition group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-amber-400">NYC ➔ Newark</div>
              <div className="text-[10px] text-slate-400 truncate">I-278 & Port Newark</div>
            </button>
          </div>
        </div>

        {/* Live Alignment Visual Sequence of Selected Places */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/40 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Map Alignment Sequence ({stops.length + 2} Selected Places)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Camera Auto-Frames All Pins
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin text-xs">
            {/* Origin */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0 font-medium">
              <span>📍 Origin:</span>
              <span className="font-bold text-white truncate max-w-[130px]">{originName || 'Select Origin'}</span>
            </div>

            {/* Intermediate stops */}
            {stops.map((stop, sIdx) => (
              <React.Fragment key={stop.id}>
                <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 shrink-0 font-medium">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {sIdx + 1}
                  </span>
                  <span className="font-bold text-white truncate max-w-[130px]">{stop.name}</span>
                </div>
              </React.Fragment>
            ))}

            {/* Destination */}
            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0 font-medium">
              <span>🏁 Destination:</span>
              <span className="font-bold text-white truncate max-w-[130px]">{destName || 'Select Dest'}</span>
            </div>
          </div>
        </div>

        {/* Places Library & Instant Add */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search & Assign Places Directly</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Click buttons to assign to Origin, Stop, or Destination
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logistics hubs, ICDs, tech parks, ports, cities (e.g. Okhla, Panvel, Jewar, San Jose, Newark)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {filteredPlaces.slice(0, 6).map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs"
              >
                <div className="truncate">
                  <div className="font-bold text-white truncate">{place.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{place.city}, {place.region} • {place.address}</div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectOriginPreset(place)}
                    className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition cursor-pointer"
                    title="Set as starting place"
                  >
                    Set Origin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStop(place)}
                    className="px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold transition cursor-pointer"
                    title="Add as intermediate stop"
                  >
                    + Add Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDestPreset(place)}
                    className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold transition cursor-pointer"
                    title="Set as destination terminal"
                  >
                    Set Dest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Target Route & Basic Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1 text-xs">Corridor Target & Comparison Mode</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetRouteId('route-a')}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                    targetRouteId === 'route-a'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Route A</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRouteId('route-b')}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                    targetRouteId === 'route-b'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Route B</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRouteId('both_ev_vs_diesel')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                    targetRouteId === 'both_ev_vs_diesel'
                      ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white border-amber-400 shadow-md'
                      : 'bg-slate-950 text-amber-300 border-slate-800 hover:bg-slate-900'
                  }`}
                  title="Configure both Route A as ⚡ EV and Route B as ⛽ Diesel on the exact same locations"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>EV vs Diesel</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 text-xs">Route Name</label>
              <input
                type="text"
                required
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Delhi to Jaipur Golden Expressway"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 text-xs">Assigned Fleet Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.fuelType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. ORIGIN PLACE */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  📍
                </div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Starting Point (Origin Place)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Lat: {originLocation.lat.toFixed(4)}, Lng: {originLocation.lng.toFixed(4)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Pick Known Logistics Hub</label>
                <select
                  onChange={(e) => {
                    const found = POPULAR_PLACES.find((p) => p.id === e.target.value);
                    if (found) handleSelectOriginPreset(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer"
                >
                  <option value="">-- Choose Starting Hub --</option>
                  {POPULAR_PLACES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Hub / Terminal Name</label>
                <input
                  type="text"
                  required
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Physical Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handleGeocodeAddress('origin', originAddress)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-[11px] font-semibold transition shrink-0 cursor-pointer"
                  title="Verify & Geocode Coordinates via Google Maps"
                >
                  {isGeocoding ? 'Verifying...' : 'Verify Pin'}
                </button>
              </div>
            </div>
          </div>

          {/* 3. INTERMEDIATE STOPS (Selected Places to align on map) */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                  {stops.length}
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                    Intermediate Stops / Waypoints ({stops.length} Places Selected)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    The road polyline and vehicle simulation will visit each stop in sequential order.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddStop()}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Place / Stop</span>
              </button>
            </div>

            {stops.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                No intermediate stops. Direct express non-stop corridor between Origin and Destination.
              </div>
            ) : (
              <div className="space-y-3">
                {stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 relative group hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-white">Stop #{index + 1}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({stop.location.lat.toFixed(4)}, {stop.location.lng.toFixed(4)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                          title="Remove Stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          required
                          value={stop.name}
                          onChange={(e) => handleUpdateStop(stop.id, { name: e.target.value })}
                          placeholder="Warehouse / Depot Name"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={stop.address}
                          onChange={(e) => handleUpdateStop(stop.id, { address: e.target.value })}
                          placeholder="Location Address"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleGeocodeAddress(stop.id, stop.address)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-[10px] font-semibold transition shrink-0 cursor-pointer"
                          title="Geocode Stop Address"
                        >
                          Verify
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Recipient / Business:</span>
                        <input
                          type="text"
                          value={stop.recipient}
                          onChange={(e) => handleUpdateStop(stop.id, { recipient: e.target.value })}
                          placeholder="Recipient Company"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                        />
                      </div>

                      <div>
                        <span className="text-slate-500 block">Packages to Unload:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={stop.packagesCount}
                          onChange={(e) => handleUpdateStop(stop.id, { packagesCount: Number(e.target.value) || 1 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. DESTINATION PLACE */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-bold">
                  🏁
                </div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  Arrival Point (Destination Place)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Lat: {destLocation.lat.toFixed(4)}, Lng: {destLocation.lng.toFixed(4)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Pick Known Logistics Hub</label>
                <select
                  onChange={(e) => {
                    const found = POPULAR_PLACES.find((p) => p.id === e.target.value);
                    if (found) handleSelectDestPreset(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer"
                >
                  <option value="">-- Choose Arrival Terminal --</option>
                  {POPULAR_PLACES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Terminal Name</label>
                <input
                  type="text"
                  required
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Physical Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handleGeocodeAddress('dest', destAddress)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-[11px] font-semibold transition shrink-0 cursor-pointer"
                  title="Verify & Geocode Coordinates via Google Maps"
                >
                  {isGeocoding ? 'Verifying...' : 'Verify Pin'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. ALL LOCATIONS IN THIS SET OVERVIEW */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                  📍
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    All Locations in This Set ({stops.length + 2} Locations)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Sequential itinerary from Start to End destination. All locations will be pinned and road-aligned on the map.
                  </p>
                </div>
              </div>

              {targetRouteId === 'both_ev_vs_diesel' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ EV vs ⛽ Diesel Comparative Mode
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {/* Origin Location Card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{originName}</strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        📍 START LOCATION
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{originAddress}</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 shrink-0 text-right">
                  {originLocation.lat.toFixed(4)}, {originLocation.lng.toFixed(4)}
                </div>
              </div>

              {/* Intermediate Stops */}
              {stops.map((stop, sIdx) => (
                <div key={stop.id} className="p-3 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {sIdx + 2}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{stop.name}</strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          📦 STOP #{sIdx + 1}
                        </span>
                        {stop.packagesCount > 0 && (
                          <span className="text-[10px] text-slate-400">
                            • {stop.packagesCount} pkgs ({stop.recipient})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{stop.address}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 shrink-0 text-right">
                    {stop.location.lat.toFixed(4)}, {stop.location.lng.toFixed(4)}
                  </div>
                </div>
              ))}

              {/* Destination Location Card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {stops.length + 2}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{destName}</strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        🏁 END DESTINATION
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{destAddress}</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 shrink-0 text-right">
                  {destLocation.lat.toFixed(4)}, {destLocation.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Applying to <strong className="text-white">
                  {targetRouteId === 'both_ev_vs_diesel' 
                    ? 'Both Routes (⚡ EV vs ⛽ Diesel on Same Locations)' 
                    : targetRouteId === 'route-a' ? 'Route A' : 'Route B'}
                </strong> • Map will frame all {stops.length + 2} locations in set
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>
                  {isSubmitting 
                    ? 'Calculating Roads...' 
                    : targetRouteId === 'both_ev_vs_diesel' 
                    ? '⚡ Compare EV vs Diesel (Same Route)' 
                    : 'Add Route & Align Map'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
