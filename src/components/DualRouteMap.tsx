import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { RouteData, Waypoint, LatLng } from '../types/route';
import { GoogleRouteMap } from './GoogleRouteMap';
import { GOOGLE_MAPS_API_KEY } from '../services/googleMapsLoader';
import { 
  Play, 
  Pause, 
  Layers, 
  Compass, 
  Maximize2, 
  Minimize2, 
  PlusCircle, 
  Navigation2, 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Sparkles,
  Info,
  Radio,
  Eye,
  Key,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  Minus
} from 'lucide-react';

interface DualRouteMapProps {
  routeA: RouteData;
  routeB: RouteData;
  activeFilter: 'both' | 'route-a' | 'route-b';
  onFilterChange: (filter: 'both' | 'route-a' | 'route-b') => void;
  onSelectWaypoint?: (waypoint: Waypoint, routeId: 'route-a' | 'route-b') => void;
  onAddStopModalOpen?: (routeId: 'route-a' | 'route-b') => void;
  onOpenVehicleModal?: (routeId: 'route-a' | 'route-b') => void;
  onOpenAddCustomRoute?: (targetRouteId?: 'route-a' | 'route-b') => void;
  onRoadGeometryAligned?: (alignedA: LatLng[], alignedB: LatLng[]) => void;
  recenterTrigger?: number;
  focusLocation?: { lat: number; lng: number; title: string; timestamp: number } | null;
  onApplySameRouteEvVsDiesel?: () => void;
  onOpenEyeDetection?: (routeId: 'route-a' | 'route-b') => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  centerCoords?: { lat: number; lng: number };
  cityName?: string;
  currencySymbol?: string;
}

export type MapMode = 'google-roadmap' | 'google-hybrid' | 'real-dark' | 'real-street' | 'real-satellite' | 'schematic-radar';

const TILE_LAYERS: Record<string, { url: string; attribution: string; maxZoom: number }> = {
  'real-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  'real-street': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  'real-satellite': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

export const DualRouteMap: React.FC<DualRouteMapProps> = ({
  routeA,
  routeB,
  activeFilter,
  onFilterChange,
  onSelectWaypoint,
  onAddStopModalOpen,
  onOpenVehicleModal,
  onOpenAddCustomRoute,
  onRoadGeometryAligned,
  recenterTrigger = 0,
  focusLocation,
  onApplySameRouteEvVsDiesel,
  onOpenEyeDetection,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onChangeSpeed,
  centerCoords,
  cityName = 'India Logistics Corridor',
  currencySymbol = '₹'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapMode, setMapMode] = useState<MapMode>('google-roadmap');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showTrafficOverlay, setShowTrafficOverlay] = useState<boolean>(true);
  const [recenterCounter, setRecenterCounter] = useState<number>(0);
  const [zoomTrigger, setZoomTrigger] = useState<{ type: 'in' | 'out'; timestamp: number } | null>(null);
  const [radarScale, setRadarScale] = useState<number>(1);
  const leafletFittedRef = useRef<string>('');

  const [selectedPin, setSelectedPin] = useState<{
    routeId: 'route-a' | 'route-b';
    title: string;
    description: string;
    status?: string;
    lat: number;
    lng: number;
    packages?: number;
    recipient?: string;
  } | null>(null);

  // SVG Radar projection bounds calculation (for 'schematic-radar' / fake map mode)
  const minMaxCoords = useMemo(() => {
    const allCoords: LatLng[] = [
      ...routeA.pathCoordinates,
      ...routeB.pathCoordinates,
    ];
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    allCoords.forEach((c) => {
      if (c.lat < minLat) minLat = c.lat;
      if (c.lat > maxLat) maxLat = c.lat;
      if (c.lng < minLng) minLng = c.lng;
      if (c.lng > maxLng) maxLng = c.lng;
    });
    const latPadding = Math.max((maxLat - minLat) * 0.25, 0.05);
    const lngPadding = Math.max((maxLng - minLng) * 0.25, 0.05);
    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [routeA, routeB]);

  const projectCoord = (coord: LatLng) => {
    const { minLat, maxLat, minLng, maxLng } = minMaxCoords;
    const x = ((coord.lng - minLng) / (maxLng - minLng)) * 1000;
    const y = 600 - ((coord.lat - minLat) / (maxLat - minLat)) * 600;
    return { x, y };
  };

  const svgPathA = useMemo(() => {
    return routeA.pathCoordinates
      .map((c, i) => {
        const p = projectCoord(c);
        return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      })
      .join(' ');
  }, [routeA, minMaxCoords]);

  const svgPathB = useMemo(() => {
    return routeB.pathCoordinates
      .map((c, i) => {
        const p = projectCoord(c);
        return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      })
      .join(' ');
  }, [routeB, minMaxCoords]);

  // Initialize or re-target Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapMode === 'schematic-radar' || mapMode.startsWith('google-')) return;

    if (!leafletMapRef.current) {
      const initialCenter: [number, number] = centerCoords 
        ? [centerCoords.lat, centerCoords.lng] 
        : [28.5355, 77.3000];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = leafletMapRef.current;

    // Handle Tile Layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_LAYERS[mapMode] || TILE_LAYERS['real-dark'];
    const newTileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = newTileLayer;

    // Invalidate map size after DOM paints
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [mapMode]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Route Layers, Markers & Polylines on the Leaflet Map
  useEffect(() => {
    const map = leafletMapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group || mapMode === 'schematic-radar' || mapMode.startsWith('google-')) return;

    group.clearLayers();

    const bounds = L.latLngBounds([]);

    const isSharedOrigin = 
      Math.abs(routeA.origin.location.lat - routeB.origin.location.lat) < 0.005 &&
      Math.abs(routeA.origin.location.lng - routeB.origin.location.lng) < 0.005;

    const isSharedDestination = 
      Math.abs(routeA.destination.location.lat - routeB.destination.location.lat) < 0.005 &&
      Math.abs(routeA.destination.location.lng - routeB.destination.location.lng) < 0.005;

    // 1. RENDER ROUTE A POLYLINES (Electric Blue)
    if (activeFilter === 'both' || activeFilter === 'route-a') {
      const latLngsA: [number, number][] = routeA.pathCoordinates.map(c => [c.lat, c.lng]);
      latLngsA.forEach(pt => bounds.extend(pt));

      // Glow effect background line
      const glowLineA = L.polyline(latLngsA, {
        color: '#60A5FA',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      });
      group.addLayer(glowLineA);

      // Core crisp polyline
      const lineA = L.polyline(latLngsA, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      group.addLayer(lineA);

      // Mid-path label for Path A
      const midIdxA = Math.floor(routeA.pathCoordinates.length / 2);
      const midA = routeA.pathCoordinates[midIdxA];
      if (midA) {
        const midIconA = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="px-2 py-0.5 rounded-full bg-blue-900/90 border border-blue-400 text-white font-mono text-[9px] font-bold shadow-2xl pointer-events-none flex items-center gap-1.5 whitespace-nowrap backdrop-blur">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              <span>Path A: ${routeA.tag || 'Expressway Corridor'}</span>
            </div>
          `,
          iconSize: [140, 22],
          iconAnchor: [70, 11],
        });
        group.addLayer(L.marker([midA.lat, midA.lng], { icon: midIconA }));
      }
    }

    // 2. RENDER ROUTE B POLYLINES (Emerald Green)
    if (activeFilter === 'both' || activeFilter === 'route-b') {
      const latLngsB: [number, number][] = routeB.pathCoordinates.map(c => [c.lat, c.lng]);
      latLngsB.forEach(pt => bounds.extend(pt));

      // Glow effect background line
      const glowLineB = L.polyline(latLngsB, {
        color: '#34D399',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      });
      group.addLayer(glowLineB);

      // Core crisp polyline
      const lineB = L.polyline(latLngsB, {
        color: '#10B981',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      group.addLayer(lineB);

      // Mid-path label for Path B
      const midIdxB = Math.floor(routeB.pathCoordinates.length / 2);
      const midB = routeB.pathCoordinates[midIdxB];
      if (midB) {
        const midIconB = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="px-2 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-400 text-white font-mono text-[9px] font-bold shadow-2xl pointer-events-none flex items-center gap-1.5 whitespace-nowrap backdrop-blur">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Path B: ${routeB.tag || 'Bypass Corridor'}</span>
            </div>
          `,
          iconSize: [140, 22],
          iconAnchor: [70, 11],
        });
        group.addLayer(L.marker([midB.lat, midB.lng], { icon: midIconB }));
      }
    }

    // 3. COMMON OR INDIVIDUAL START MARKERS
    if (activeFilter === 'both' && isSharedOrigin) {
      const sharedOriginIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group">
            <div class="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition animate-pulse pointer-events-none"></div>
            <div class="relative flex items-center bg-slate-950 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-2xl gap-1.5 text-white whitespace-nowrap">
              <span class="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                START POINT
              </span>
              <div class="flex items-center gap-1 ml-0.5">
                <span class="px-1.5 py-0.2 rounded-full bg-blue-600 text-[9px] font-black text-white shadow">Path A</span>
                <span class="px-1.5 py-0.2 rounded-full bg-emerald-600 text-[9px] font-black text-white shadow">Path B</span>
              </div>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700/80 text-[9px] font-bold text-slate-200 shadow-xl whitespace-nowrap pointer-events-none">
              Common Origin (Both Routes)
            </div>
          </div>
        `,
        iconSize: [150, 48],
        iconAnchor: [75, 24],
      });

      const sharedOriginMarker = L.marker([routeA.origin.location.lat, routeA.origin.location.lng], { icon: sharedOriginIcon })
        .on('click', () => {
          setSelectedPin({
            routeId: 'route-a',
            title: `📍 COMMON START POINT: ${routeA.origin.name}`,
            description: `${routeA.origin.address} • Dual Departure Hub for Route A (${routeA.name.split('(')[0].trim()}) and Route B (${routeB.name.split('(')[0].trim()})`,
            lat: routeA.origin.location.lat,
            lng: routeA.origin.location.lng,
          });
        });
      group.addLayer(sharedOriginMarker);
    } else {
      if (activeFilter === 'both' || activeFilter === 'route-a') {
        const originIconA = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="absolute w-7 h-7 bg-blue-500/30 rounded-full animate-ping"></div>
              <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                A
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-[10px] font-mono font-bold text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/40 shadow pointer-events-none">
                START A
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const originMarkerA = L.marker([routeA.origin.location.lat, routeA.origin.location.lng], { icon: originIconA })
          .on('click', () => {
            setSelectedPin({
              routeId: 'route-a',
              title: `📍 START POINT (Route A): ${routeA.origin.name}`,
              description: routeA.origin.address,
              lat: routeA.origin.location.lat,
              lng: routeA.origin.location.lng,
            });
          });
        group.addLayer(originMarkerA);
      }

      if (activeFilter === 'both' || activeFilter === 'route-b') {
        const originIconB = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="absolute w-7 h-7 bg-emerald-500/30 rounded-full animate-ping"></div>
              <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                B
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-[10px] font-mono font-bold text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 shadow pointer-events-none">
                START B
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const originMarkerB = L.marker([routeB.origin.location.lat, routeB.origin.location.lng], { icon: originIconB })
          .on('click', () => {
            setSelectedPin({
              routeId: 'route-b',
              title: `📍 START POINT (Route B): ${routeB.origin.name}`,
              description: routeB.origin.address,
              lat: routeB.origin.location.lat,
              lng: routeB.origin.location.lng,
            });
          });
        group.addLayer(originMarkerB);
      }
    }

    // 4. COMMON OR INDIVIDUAL END/DESTINATION MARKERS
    if (activeFilter === 'both' && isSharedDestination) {
      const sharedDestIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group">
            <div class="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition animate-pulse pointer-events-none"></div>
            <div class="relative flex items-center bg-slate-950 border-2 border-cyan-400 rounded-full px-2.5 py-1 shadow-2xl gap-1.5 text-white whitespace-nowrap">
              <span class="text-xs">🏁</span>
              <span class="text-[10px] font-black uppercase tracking-wider text-cyan-300">END POINT</span>
              <div class="flex items-center gap-1 ml-0.5">
                <span class="px-1.5 py-0.2 rounded-full bg-blue-600 text-[9px] font-black text-white shadow">Path A</span>
                <span class="px-1.5 py-0.2 rounded-full bg-emerald-600 text-[9px] font-black text-white shadow">Path B</span>
              </div>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700/80 text-[9px] font-bold text-slate-200 shadow-xl whitespace-nowrap pointer-events-none">
              Common Destination (Both Routes)
            </div>
          </div>
        `,
        iconSize: [150, 48],
        iconAnchor: [75, 24],
      });

      const sharedDestMarker = L.marker([routeA.destination.location.lat, routeA.destination.location.lng], { icon: sharedDestIcon })
        .on('click', () => {
          setSelectedPin({
            routeId: 'route-a',
            title: `🏁 COMMON END POINT: ${routeA.destination.name}`,
            description: `${routeA.destination.address} • Terminal for Route A (${routeA.distanceKm} km) and Route B (${routeB.distanceKm} km)`,
            lat: routeA.destination.location.lat,
            lng: routeA.destination.location.lng,
          });
        });
      group.addLayer(sharedDestMarker);
    } else {
      if (activeFilter === 'both' || activeFilter === 'route-a') {
        const destIconA = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <div class="w-7 h-7 rounded-full bg-slate-900 border-2 border-blue-400 shadow-xl flex items-center justify-center text-blue-400 text-[11px] font-bold">
                🏁
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-blue-950 text-[9px] font-bold text-blue-300 px-1 py-0.5 rounded border border-blue-800 shadow pointer-events-none">
                END A
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const destMarkerA = L.marker([routeA.destination.location.lat, routeA.destination.location.lng], { icon: destIconA })
          .on('click', () => {
            setSelectedPin({
              routeId: 'route-a',
              title: `🏁 END POINT (Route A): ${routeA.destination.name}`,
              description: routeA.destination.address,
              lat: routeA.destination.location.lat,
              lng: routeA.destination.location.lng,
            });
          });
        group.addLayer(destMarkerA);
      }

      if (activeFilter === 'both' || activeFilter === 'route-b') {
        const destIconB = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <div class="w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400 text-[11px] font-bold">
                🏁
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-emerald-950 text-[9px] font-bold text-emerald-300 px-1 py-0.5 rounded border border-emerald-800 shadow pointer-events-none">
                END B
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const destMarkerB = L.marker([routeB.destination.location.lat, routeB.destination.location.lng], { icon: destIconB })
          .on('click', () => {
            setSelectedPin({
              routeId: 'route-b',
              title: `🏁 END POINT (Route B): ${routeB.destination.name}`,
              description: routeB.destination.address,
              lat: routeB.destination.location.lat,
              lng: routeB.destination.location.lng,
            });
          });
        group.addLayer(destMarkerB);
      }
    }

    // 5. WAYPOINTS FOR ROUTE A
    if (activeFilter === 'both' || activeFilter === 'route-a') {
      routeA.waypoints.forEach((wp, index) => {
        bounds.extend([wp.location.lat, wp.location.lng]);

        const statusBg = wp.status === 'completed' ? 'bg-emerald-600' : wp.status === 'current' ? 'bg-amber-500' : 'bg-blue-600';
        const ringBorder = wp.status === 'current' ? 'ring-4 ring-amber-400/40 animate-pulse' : 'ring-2 ring-white/80';

        const wpIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-6 h-6 rounded-full ${statusBg} ${ringBorder} border border-white/60 shadow-lg flex items-center justify-center text-white text-[11px] font-bold">
                ${index + 1}
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-slate-950/95 text-[9px] font-mono text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Stop ${index + 1}: ${wp.name.slice(0, 20)}...
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const wpMarker = L.marker([wp.location.lat, wp.location.lng], { icon: wpIcon })
          .on('click', () => {
            setSelectedPin({
              routeId: 'route-a',
              title: `Stop ${index + 1}: ${wp.name}`,
              description: `${wp.address} • ETA: ${wp.eta}`,
              status: wp.status,
              lat: wp.location.lat,
              lng: wp.location.lng,
              packages: wp.packagesCount,
              recipient: wp.recipient,
            });
            onSelectWaypoint?.(wp, 'route-a');
          });
        group.addLayer(wpMarker);
      });

      // Moving Vehicle Marker A
      const vehicleIconA = L.divIcon({
        className: 'custom-leaflet-vehicle',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="relative px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg border-2 border-white shadow-xl flex items-center gap-1.5 text-white">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              <span class="text-[10px] font-mono font-bold tracking-tight">${routeA.driver.vehicle.slice(0, 10)}</span>
            </div>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const vehicleMarkerA = L.marker([routeA.currentVehiclePos.lat, routeA.currentVehiclePos.lng], { icon: vehicleIconA })
        .on('click', () => {
          setSelectedPin({
            routeId: 'route-a',
            title: `Active Vehicle: ${routeA.driver.vehicle}`,
            description: `Driver: ${routeA.driver.name} (${routeA.driver.phone}) • Speed: ${routeA.currentSpeedKmh} km/h • Battery: ${routeA.fuelLevelPct}%`,
            status: routeA.status,
            lat: routeA.currentVehiclePos.lat,
            lng: routeA.currentVehiclePos.lng,
          });
        });
      group.addLayer(vehicleMarkerA);
    }

    // 6. WAYPOINTS FOR ROUTE B
    if (activeFilter === 'both' || activeFilter === 'route-b') {
      routeB.waypoints.forEach((wp, index) => {
        bounds.extend([wp.location.lat, wp.location.lng]);

        const statusBg = wp.status === 'completed' ? 'bg-emerald-600' : wp.status === 'current' ? 'bg-amber-500' : 'bg-emerald-600';
        const ringBorder = wp.status === 'current' ? 'ring-4 ring-amber-400/40 animate-pulse' : 'ring-2 ring-white/80';

        const wpIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-6 h-6 rounded-full ${statusBg} ${ringBorder} border border-white/60 shadow-lg flex items-center justify-center text-white text-[11px] font-bold">
                ${index + 1}
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-slate-950/95 text-[9px] font-mono text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Stop ${index + 1}: ${wp.name.slice(0, 20)}...
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const wpMarker = L.marker([wp.location.lat, wp.location.lng], { icon: wpIcon })
          .on('click', () => {
            setSelectedPin({
              routeId: 'route-b',
              title: `Stop ${index + 1}: ${wp.name}`,
              description: `${wp.address} • ETA: ${wp.eta}`,
              status: wp.status,
              lat: wp.location.lat,
              lng: wp.location.lng,
              packages: wp.packagesCount,
              recipient: wp.recipient,
            });
            onSelectWaypoint?.(wp, 'route-b');
          });
        group.addLayer(wpMarker);
      });

      // Moving Vehicle Marker B
      const vehicleIconB = L.divIcon({
        className: 'custom-leaflet-vehicle',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute w-10 h-10 bg-emerald-500/30 rounded-full animate-ping"></div>
            <div class="relative px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg border-2 border-white shadow-xl flex items-center gap-1.5 text-white">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              <span class="text-[10px] font-mono font-bold tracking-tight">${routeB.driver.vehicle.slice(0, 10)}</span>
            </div>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const vehicleMarkerB = L.marker([routeB.currentVehiclePos.lat, routeB.currentVehiclePos.lng], { icon: vehicleIconB })
        .on('click', () => {
          setSelectedPin({
            routeId: 'route-b',
            title: `Active Vehicle: ${routeB.driver.vehicle}`,
            description: `Driver: ${routeB.driver.name} (${routeB.driver.phone}) • Speed: ${routeB.currentSpeedKmh} km/h • Battery: ${routeB.fuelLevelPct}%`,
            status: routeB.status,
            lat: routeB.currentVehiclePos.lat,
            lng: routeB.currentVehiclePos.lng,
          });
        });
      group.addLayer(vehicleMarkerB);
    }
  }, [routeA, routeB, activeFilter, mapMode]);

  // Fit Leaflet bounds on corridor change, route places change, filter change, or explicit recenter
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || mapMode.startsWith('google-') || mapMode === 'schematic-radar') return;

    const corridorKey = `${routeA.name}-${routeA.origin.location.lat},${routeA.origin.location.lng}-${routeA.destination.location.lat},${routeA.destination.location.lng}-${routeA.waypoints.length}-${routeB.name}-${routeB.origin.location.lat},${routeB.origin.location.lng}-${routeB.destination.location.lat},${routeB.destination.location.lng}-${routeB.waypoints.length}-${activeFilter}-${recenterCounter}-${recenterTrigger}`;
    if (leafletFittedRef.current === corridorKey && recenterCounter === 0 && !recenterTrigger) return;
    leafletFittedRef.current = corridorKey;

    const bounds = L.latLngBounds([]);
    if (activeFilter === 'both' || activeFilter === 'route-a') {
      bounds.extend([routeA.origin.location.lat, routeA.origin.location.lng]);
      bounds.extend([routeA.destination.location.lat, routeA.destination.location.lng]);
      routeA.waypoints.forEach((w) => bounds.extend([w.location.lat, w.location.lng]));
      routeA.pathCoordinates.forEach((c) => bounds.extend([c.lat, c.lng]));
    }
    if (activeFilter === 'both' || activeFilter === 'route-b') {
      bounds.extend([routeB.origin.location.lat, routeB.origin.location.lng]);
      bounds.extend([routeB.destination.location.lat, routeB.destination.location.lng]);
      routeB.waypoints.forEach((w) => bounds.extend([w.location.lat, w.location.lng]));
      routeB.pathCoordinates.forEach((c) => bounds.extend([c.lat, c.lng]));
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }
  }, [routeA, routeB, activeFilter, mapMode, recenterCounter, recenterTrigger]);

  // Recenter helper
  const handleRecenter = () => {
    setRecenterCounter((prev) => prev + 1);
    if (leafletMapRef.current) {
      const bounds = L.latLngBounds([]);
      if (activeFilter === 'both' || activeFilter === 'route-a') {
        bounds.extend([routeA.origin.location.lat, routeA.origin.location.lng]);
        bounds.extend([routeA.destination.location.lat, routeA.destination.location.lng]);
        routeA.waypoints.forEach((w) => bounds.extend([w.location.lat, w.location.lng]));
        routeA.pathCoordinates.forEach((c) => bounds.extend([c.lat, c.lng]));
      }
      if (activeFilter === 'both' || activeFilter === 'route-b') {
        bounds.extend([routeB.origin.location.lat, routeB.origin.location.lng]);
        bounds.extend([routeB.destination.location.lat, routeB.destination.location.lng]);
        routeB.waypoints.forEach((w) => bounds.extend([w.location.lat, w.location.lng]));
        routeB.pathCoordinates.forEach((c) => bounds.extend([c.lat, c.lng]));
      }
      if (bounds.isValid()) {
        leafletMapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
      }
    }
    if (mapMode === 'schematic-radar') {
      setRadarScale(1);
    }
  };

  const handleZoomIn = () => {
    if (mapMode.startsWith('google-')) {
      setZoomTrigger({ type: 'in', timestamp: Date.now() });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    } else if (mapMode === 'schematic-radar') {
      setRadarScale((prev) => Math.min(prev + 0.25, 2.5));
    }
  };

  const handleZoomOut = () => {
    if (mapMode.startsWith('google-')) {
      setZoomTrigger({ type: 'out', timestamp: Date.now() });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    } else if (mapMode === 'schematic-radar') {
      setRadarScale((prev) => Math.max(prev - 0.25, 0.5));
    }
  };

  // Center & focus map when an individual location from the locations set is chosen
  useEffect(() => {
    if (!focusLocation) return;
    if (leafletMapRef.current && !mapMode.startsWith('google-')) {
      leafletMapRef.current.setView([focusLocation.lat, focusLocation.lng], 14, { animate: true });
    }
    setSelectedPin({
      routeId: 'route-a',
      title: focusLocation.title,
      description: `GPS Coordinates: ${focusLocation.lat.toFixed(5)}, ${focusLocation.lng.toFixed(5)} • Part of Active Location Itinerary`,
      lat: focusLocation.lat,
      lng: focusLocation.lng,
    });
  }, [focusLocation, mapMode]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[520px] lg:h-[620px]'}`}>
      
      {/* 1. REAL GOOGLE MAPS CANVAS (Powered by newly added Google Maps API Key) */}
      {mapMode.startsWith('google-') && (
        <div className="w-full h-full relative">
          <GoogleRouteMap
            routeA={routeA}
            routeB={routeB}
            activeFilter={activeFilter}
            centerCoords={centerCoords}
            mapTypeId={mapMode === 'google-hybrid' ? 'hybrid' : 'roadmap'}
            recenterTrigger={recenterCounter + (recenterTrigger || 0)}
            zoomTrigger={zoomTrigger}
            onSelectWaypoint={onSelectWaypoint}
            onSelectPin={(pin) => setSelectedPin(pin)}
            onFallbackToLeaflet={() => setMapMode('real-dark')}
            onRoadGeometryAligned={onRoadGeometryAligned}
            focusLocation={focusLocation}
          />
        </div>
      )}

      {/* 2. REAL INTERACTIVE LEAFLET CANVAS (Dark Matter, OSM, or Esri Satellite) */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full ${mapMode.startsWith('google-') || mapMode === 'schematic-radar' ? 'hidden' : 'block'}`}
      />

      {/* 3. TACTICAL RADAR CANVAS */}
      {mapMode === 'schematic-radar' && (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 flex items-center justify-center select-none">
          {/* Subtle tactical grid lines & radar sweeps */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b25_1px,transparent_1px),linear-gradient(to_bottom,#1e293b25_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#3b82f630_0%,transparent_75%)]" />

          {/* Animated circular radar ping rings */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-blue-500/20 pointer-events-none animate-pulse" />
          <div className="absolute w-[700px] h-[700px] rounded-full border border-emerald-500/10 pointer-events-none" />

          <svg 
            className="w-full h-full relative z-10 transition-transform duration-300" 
            viewBox="0 0 1000 600" 
            preserveAspectRatio="xMidYMid meet"
            style={{ transform: `scale(${radarScale})`, transformOrigin: 'center center' }}
          >
            <defs>
              <linearGradient id="gradRouteA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="gradRouteB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <filter id="glowA" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowB" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Tactical Grid Overlay Lines */}
            <g stroke="#1e293b" strokeWidth="0.8" opacity="0.4">
              <line x1="0" y1="300" x2="1000" y2="300" strokeDasharray="6 4" />
              <line x1="500" y1="0" x2="500" y2="600" strokeDasharray="6 4" />
              <circle cx="500" cy="300" r="160" fill="none" strokeDasharray="4 6" />
              <circle cx="500" cy="300" r="280" fill="none" strokeDasharray="4 8" />
            </g>

            {/* Route A Path */}
            {(activeFilter === 'both' || activeFilter === 'route-a') && (
              <>
                <path
                  d={svgPathA}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  opacity="0.3"
                  filter="url(#glowA)"
                />
                <path
                  d={svgPathA}
                  fill="none"
                  stroke="url(#gradRouteA)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Route A Waypoints */}
                {routeA.waypoints.map((wp, i) => {
                  const pt = projectCoord(wp.location);
                  return (
                    <g 
                      key={wp.id} 
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => {
                        setSelectedPin({
                          routeId: 'route-a',
                          title: `Stop ${i + 1}: ${wp.name}`,
                          description: `${wp.address} • ETA: ${wp.eta}`,
                          status: wp.status,
                          lat: wp.location.lat,
                          lng: wp.location.lng,
                          packages: wp.packagesCount,
                          recipient: wp.recipient,
                        });
                        onSelectWaypoint?.(wp, 'route-a');
                      }}
                    >
                      <circle cx={pt.x} cy={pt.y} r="14" fill="#1e3a8a" opacity="0.4" />
                      <circle cx={pt.x} cy={pt.y} r="8" fill="#3B82F6" stroke="#ffffff" strokeWidth="2" />
                      <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* Route B Path */}
            {(activeFilter === 'both' || activeFilter === 'route-b') && (
              <>
                <path
                  d={svgPathB}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  opacity="0.3"
                  filter="url(#glowB)"
                />
                <path
                  d={svgPathB}
                  fill="none"
                  stroke="url(#gradRouteB)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Route B Waypoints */}
                {routeB.waypoints.map((wp, i) => {
                  const pt = projectCoord(wp.location);
                  return (
                    <g 
                      key={wp.id} 
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => {
                        setSelectedPin({
                          routeId: 'route-b',
                          title: `Stop ${i + 1}: ${wp.name}`,
                          description: `${wp.address} • ETA: ${wp.eta}`,
                          status: wp.status,
                          lat: wp.location.lat,
                          lng: wp.location.lng,
                          packages: wp.packagesCount,
                          recipient: wp.recipient,
                        });
                        onSelectWaypoint?.(wp, 'route-b');
                      }}
                    >
                      <circle cx={pt.x} cy={pt.y} r="14" fill="#064e3b" opacity="0.4" />
                      <circle cx={pt.x} cy={pt.y} r="8" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                      <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* Common Start Point Node in Tactical Radar */}
            {(() => {
              const startPt = projectCoord(routeA.origin.location);
              return (
                <g 
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => {
                    setSelectedPin({
                      routeId: 'route-a',
                      title: `📍 COMMON START POINT: ${routeA.origin.name}`,
                      description: `${routeA.origin.address} • Dual Departure Hub for Route A (${routeA.name.split('(')[0].trim()}) and Route B (${routeB.name.split('(')[0].trim()})`,
                      lat: routeA.origin.location.lat,
                      lng: routeA.origin.location.lng,
                    });
                  }}
                >
                  <circle cx={startPt.x} cy={startPt.y} r="20" fill="#f59e0b" opacity="0.2" className="animate-pulse" />
                  <circle cx={startPt.x} cy={startPt.y} r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x={startPt.x - 48} y={startPt.y - 28} width="96" height="16" rx="4" fill="#090d16" stroke="#f59e0b" strokeWidth="1" />
                  <text x={startPt.x} y={startPt.y - 17} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="bold">
                    START (A & B)
                  </text>
                </g>
              );
            })()}

            {/* Common Destination Point Node in Tactical Radar */}
            {(() => {
              const destPt = projectCoord(routeA.destination.location);
              return (
                <g 
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => {
                    setSelectedPin({
                      routeId: 'route-a',
                      title: `🏁 COMMON END POINT: ${routeA.destination.name}`,
                      description: `${routeA.destination.address} • Terminal for Route A and Route B`,
                      lat: routeA.destination.location.lat,
                      lng: routeA.destination.location.lng,
                    });
                  }}
                >
                  <circle cx={destPt.x} cy={destPt.y} r="20" fill="#06b6d4" opacity="0.2" className="animate-pulse" />
                  <circle cx={destPt.x} cy={destPt.y} r="10" fill="#06b6d4" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x={destPt.x - 48} y={destPt.y - 28} width="96" height="16" rx="4" fill="#090d16" stroke="#06b6d4" strokeWidth="1" />
                  <text x={destPt.x} y={destPt.y - 17} textAnchor="middle" fill="#a5f3fc" fontSize="8.5" fontWeight="bold">
                    🏁 END (A & B)
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Radar HUD watermark */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 backdrop-blur text-xs font-mono text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>RADAR OPS MODE • TACTICAL INDIA MATRIX ACTIVE</span>
          </div>
        </div>
      )}

      {/* TOP HEADER OVERLAYS */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Route Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md pointer-events-auto">
          <button
            type="button"
            onClick={() => onFilterChange('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'both'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('route-a')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'route-a'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Route A</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('route-b')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'route-b'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Route B</span>
          </button>

          {onOpenVehicleModal && (
            <button
              type="button"
              onClick={() => onOpenVehicleModal(activeFilter === 'route-b' ? 'route-b' : 'route-a')}
              title="Choose or change vehicle for Route A / Route B"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 border-l border-slate-800 pl-2 ml-0.5"
            >
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Choose Vehicle</span>
            </button>
          )}

          {onOpenAddCustomRoute && (
            <button
              type="button"
              onClick={() => onOpenAddCustomRoute(activeFilter === 'route-b' ? 'route-b' : 'route-a')}
              title="Add route corridor and align map to your selected places"
              className="px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500/25 via-amber-500/20 to-orange-500/25 hover:from-amber-500 hover:to-orange-500 text-amber-300 hover:text-slate-950 border border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ml-1"
            >
              <Navigation2 className="w-3.5 h-3.5" />
              <span>+ Add Route (Align Places)</span>
            </button>
          )}

          {onApplySameRouteEvVsDiesel && (
            <button
              type="button"
              onClick={onApplySameRouteEvVsDiesel}
              title="Sync same route on Route A (⚡ EV) and Route B (⛽ Diesel) to compare CO₂ diff"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600/25 via-teal-600/20 to-blue-600/25 hover:from-emerald-600 hover:to-teal-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ml-1"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Same Route (EV vs CO₂ Diff)</span>
            </button>
          )}

          {onOpenEyeDetection && (
            <button
              type="button"
              onClick={() => onOpenEyeDetection(routeA.driver.eyeDetection?.isSleepy ? 'route-a' : routeB.driver.eyeDetection?.isSleepy ? 'route-b' : (activeFilter === 'route-b' ? 'route-b' : 'route-a'))}
              title="Driver Eye Detection & Sleepiness Telematics HUD"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ml-1 border ${
                routeA.driver.eyeDetection?.isSleepy || routeB.driver.eyeDetection?.isSleepy
                  ? 'bg-rose-600 text-white animate-pulse border-rose-400 shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>
                {routeA.driver.eyeDetection?.isSleepy || routeB.driver.eyeDetection?.isSleepy
                  ? '⚠️ Sleepy Driver Alert'
                  : 'Eye Detection'}
              </span>
            </button>
          )}

          {/* Highway Snapping Badge */}
          {!mapMode.startsWith('google-') && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-[10px] font-mono text-emerald-300 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Highway Aligned</span>
            </div>
          )}
        </div>

        {/* MAP STYLE TOGGLE: Google Map, Google Satellite, Real Dark, Real Street, Tactical Radar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md pointer-events-auto">
          <button
            type="button"
            title="Google Maps Roadmap (Live API)"
            onClick={() => setMapMode('google-roadmap')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapMode === 'google-roadmap' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Map</span>
          </button>

          <button
            type="button"
            title="Google Maps Satellite Hybrid"
            onClick={() => setMapMode('google-hybrid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapMode === 'google-hybrid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛰️ Satellite</span>
          </button>

          <button
            type="button"
            title="Real Map Dark Ops (Leaflet)"
            onClick={() => setMapMode('real-dark')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              mapMode === 'real-dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌙 Dark</span>
          </button>

          <button
            type="button"
            title="Real Street Map (OpenStreetMap)"
            onClick={() => setMapMode('real-street')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              mapMode === 'real-street' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛣️ Street</span>
          </button>

          <button
            type="button"
            title="Tactical Radar ('Fake' Vector Map)"
            onClick={() => setMapMode('schematic-radar')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              mapMode === 'schematic-radar' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar</span>
          </button>
        </div>

        {/* CONTROLS (Simulation, Recenter, Key indicator, Fullscreen) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Active API Key badge */}
          <div 
            title={`Active Google Maps API Key: ${GOOGLE_MAPS_API_KEY}`}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 backdrop-blur-md shadow-lg"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span className="text-slate-500">API:</span>
            <span className="text-emerald-400 font-bold">{GOOGLE_MAPS_API_KEY.slice(0, 8)}...{GOOGLE_MAPS_API_KEY.slice(-4)}</span>
          </div>

          {/* Simulation Toggle */}
          <button
            type="button"
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Sim Live</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Sim</span>
              </>
            )}
          </button>

          {/* Speed Switcher */}
          <button
            type="button"
            onClick={() => onChangeSpeed(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 5 : 1)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold cursor-pointer backdrop-blur-md"
            title="Cycle simulation speed"
          >
            {simulationSpeed}x
          </button>

          {/* Recenter button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer shadow-lg backdrop-blur-md"
            title="Fit Both Routes to View (Recenter)"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Zoom In button */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 font-bold"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out button */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 font-bold"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer shadow-lg backdrop-blur-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* DUAL PATH ROUTE CORRIDOR HUD: Clearly shows Common Start, Two Different Paths, and Common End */}
      <div className="absolute top-16 left-3 right-3 z-20 pointer-events-none flex justify-center">
        <div className="max-w-3xl w-full bg-slate-950/92 border border-slate-800/90 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Start Point */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">START POINT</span>
                <span className="text-[9px] bg-amber-950/80 text-amber-300 px-1 py-0.2 rounded border border-amber-800/60 font-mono">Shared Origin</span>
              </div>
              <p className="text-white font-semibold text-[11px] sm:text-xs truncate max-w-[170px] sm:max-w-[200px]" title={routeA.origin.name}>
                {routeA.origin.name.split('(')[0].trim()}
              </p>
            </div>
          </div>

          {/* Diverging Paths Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => onFilterChange(activeFilter === 'route-a' ? 'both' : 'route-a')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'both' || activeFilter === 'route-a'
                  ? 'bg-blue-600/90 text-white shadow-md border border-blue-400/30'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
              title="Click to view Path A"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Path A: {routeA.tag || 'Expressway'}</span>
            </button>

            <span className="text-slate-600 font-mono font-bold text-[10px]">vs</span>

            <button
              type="button"
              onClick={() => onFilterChange(activeFilter === 'route-b' ? 'both' : 'route-b')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'both' || activeFilter === 'route-b'
                  ? 'bg-emerald-600/90 text-white shadow-md border border-emerald-400/30'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
              title="Click to view Path B"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Path B: {routeB.tag || 'Bypass'}</span>
            </button>
          </div>

          {/* End Point */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
              <span className="text-xs">🏁</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">END POINT</span>
                <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-1 py-0.2 rounded border border-cyan-800/60 font-mono">Shared Terminus</span>
              </div>
              <p className="text-white font-semibold text-[11px] sm:text-xs truncate max-w-[170px] sm:max-w-[200px]" title={routeA.destination.name}>
                {routeA.destination.name.split('(')[0].trim()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT LIVE TELEMETRICS STATUS BAR */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-200">
              {cityName}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Route A Quick Stats */}
          {(activeFilter === 'both' || activeFilter === 'route-a') && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-400">A:</span>
              <span className="text-blue-300 font-bold">{routeA.currentSpeedKmh} km/h</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{routeA.eta}</span>
            </div>
          )}

          {/* Route B Quick Stats */}
          {(activeFilter === 'both' || activeFilter === 'route-b') && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">B:</span>
              <span className="text-emerald-300 font-bold">{routeB.currentSpeedKmh} km/h</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{routeB.eta}</span>
            </div>
          )}
        </div>
      </div>

      {/* PIN DETAIL MODAL / DRAWER IF SELECTED */}
      {selectedPin && (
        <div className="absolute bottom-4 right-4 z-30 max-w-sm w-full bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                selectedPin.routeId === 'route-a' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedPin.routeId === 'route-a' ? 'Route A Dispatch' : 'Route B Dispatch'}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">{selectedPin.title}</h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPin(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300 mb-3">{selectedPin.description}</p>
          {selectedPin.recipient && (
            <div className="text-[11px] text-slate-400 mb-2">
              Recipient: <strong className="text-slate-200">{selectedPin.recipient}</strong> ({selectedPin.packages} pkgs)
            </div>
          )}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
            <span>Lat: {selectedPin.lat.toFixed(4)}</span>
            <span>Lng: {selectedPin.lng.toFixed(4)}</span>
          </div>
        </div>
      )}

    </div>
  );
};
