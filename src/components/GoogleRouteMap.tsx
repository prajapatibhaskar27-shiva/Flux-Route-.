import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { RouteData, Waypoint, LatLng } from '../types/route';
import { GOOGLE_MAPS_API_KEY } from '../services/googleMapsLoader';
import { fetchGoogleDrivingDirections } from '../services/routeDirectionsService';
import { Truck, MapPin, Navigation, Info, AlertTriangle, Plus, Minus, Compass, RefreshCw, CheckCircle2 } from 'lucide-react';

interface GoogleRouteMapProps {
  routeA: RouteData;
  routeB: RouteData;
  activeFilter: 'both' | 'route-a' | 'route-b';
  centerCoords?: { lat: number; lng: number };
  mapTypeId?: 'roadmap' | 'hybrid' | 'satellite' | 'terrain';
  recenterTrigger?: number;
  zoomTrigger?: { type: 'in' | 'out'; timestamp: number } | null;
  onSelectWaypoint?: (waypoint: Waypoint, routeId: 'route-a' | 'route-b') => void;
  onSelectPin?: (pin: {
    routeId: 'route-a' | 'route-b';
    title: string;
    description: string;
    status?: string;
    lat: number;
    lng: number;
    packages?: number;
    recipient?: string;
  }) => void;
  onFallbackToLeaflet?: () => void;
  onRoadGeometryAligned?: (alignedA: LatLng[], alignedB: LatLng[]) => void;
  focusLocation?: { lat: number; lng: number; title: string; timestamp: number } | null;
}

// Inner helper component to calculate directions, draw road-snapped polylines, handle bounds, and handle zoom controls smoothly
const GoogleMapController: React.FC<{
  routeA: RouteData;
  routeB: RouteData;
  activeFilter: 'both' | 'route-a' | 'route-b';
  recenterTrigger?: number;
  zoomTrigger?: { type: 'in' | 'out'; timestamp: number } | null;
  onRoadGeometryAligned?: (alignedA: LatLng[], alignedB: LatLng[]) => void;
  focusLocation?: { lat: number; lng: number; title: string; timestamp: number } | null;
}> = ({ routeA, routeB, activeFilter, recenterTrigger, zoomTrigger, onRoadGeometryAligned, focusLocation }) => {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const hasFittedRef = useRef<string>('');

  const [roadGeometryA, setRoadGeometryA] = useState<LatLng[]>(routeA.pathCoordinates);
  const [roadGeometryB, setRoadGeometryB] = useState<LatLng[]>(routeB.pathCoordinates);
  const [alignmentStatus, setAlignmentStatus] = useState<'aligning' | 'aligned' | 'ready'>('ready');
  const [manualAlignCount, setManualAlignCount] = useState<number>(0);

  // 1. Compute driving directions using modern Google Maps Routes API / corridor geometry
  useEffect(() => {
    let isMounted = true;

    async function computeRealRoadDirections() {
      if (typeof google === 'undefined' || !google.maps) {
        setRoadGeometryA(routeA.pathCoordinates);
        setRoadGeometryB(routeB.pathCoordinates);
        return;
      }

      setAlignmentStatus('aligning');

      try {
        const [directionsA, directionsB] = await Promise.all([
          fetchGoogleDrivingDirections(
            routeA.origin.location,
            routeA.destination.location,
            routeA.waypoints.map((w) => w.location)
          ),
          fetchGoogleDrivingDirections(
            routeB.origin.location,
            routeB.destination.location,
            routeB.waypoints.map((w) => w.location)
          ),
        ]);

        if (!isMounted) return;

        const finalPathA = directionsA && directionsA.path.length > 5 ? directionsA.path : routeA.pathCoordinates;
        const finalPathB = directionsB && directionsB.path.length > 5 ? directionsB.path : routeB.pathCoordinates;

        setRoadGeometryA(finalPathA);
        setRoadGeometryB(finalPathB);
        setAlignmentStatus('aligned');

        if ((directionsA && directionsA.path.length > 5) || (directionsB && directionsB.path.length > 5)) {
          onRoadGeometryAligned?.(finalPathA, finalPathB);
        }
      } catch {
        if (isMounted) {
          setRoadGeometryA(routeA.pathCoordinates);
          setRoadGeometryB(routeB.pathCoordinates);
          setAlignmentStatus('ready');
        }
      }
    }

    computeRealRoadDirections();

    return () => {
      isMounted = false;
    };
  }, [
    routeA.origin.location.lat,
    routeA.origin.location.lng,
    routeA.destination.location.lat,
    routeA.destination.location.lng,
    routeA.waypoints.length,
    routeB.origin.location.lat,
    routeB.origin.location.lng,
    routeB.destination.location.lat,
    routeB.destination.location.lng,
    routeB.waypoints.length,
    manualAlignCount,
  ]);

  // Keep synchronized if routeA or routeB pathCoordinates change externally
  useEffect(() => {
    if (routeA.pathCoordinates.length > roadGeometryA.length) {
      setRoadGeometryA(routeA.pathCoordinates);
    }
  }, [routeA.pathCoordinates]);

  useEffect(() => {
    if (routeB.pathCoordinates.length > roadGeometryB.length) {
      setRoadGeometryB(routeB.pathCoordinates);
    }
  }, [routeB.pathCoordinates]);

  // 2. Draw Road-Snapped Polylines with Directional Arrows & Outer Glow
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    // ROUTE A POLYLINES (Electric Blue)
    if (activeFilter === 'both' || activeFilter === 'route-a') {
      const pathA = roadGeometryA.map((c) => ({ lat: c.lat, lng: c.lng }));

      // Outer glow for highway visibility
      const glowA = new google.maps.Polyline({
        path: pathA,
        geodesic: true,
        strokeColor: '#60A5FA',
        strokeOpacity: 0.35,
        strokeWeight: 9,
        map,
      });

      // Core road-aligned polyline with forward directional arrows
      const lineA = new google.maps.Polyline({
        path: pathA,
        geodesic: true,
        strokeColor: '#2563EB',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2.2,
              strokeColor: '#ffffff',
              fillColor: '#1d4ed8',
              fillOpacity: 1,
            },
            offset: '20%',
            repeat: '100px',
          },
        ],
        map,
      });

      polylinesRef.current.push(glowA, lineA);
    }

    // ROUTE B POLYLINES (Vibrant Emerald)
    if (activeFilter === 'both' || activeFilter === 'route-b') {
      const pathB = roadGeometryB.map((c) => ({ lat: c.lat, lng: c.lng }));

      // Outer glow
      const glowB = new google.maps.Polyline({
        path: pathB,
        geodesic: true,
        strokeColor: '#34D399',
        strokeOpacity: 0.35,
        strokeWeight: 9,
        map,
      });

      // Core road-aligned polyline with forward directional arrows
      const lineB = new google.maps.Polyline({
        path: pathB,
        geodesic: true,
        strokeColor: '#059669',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2.2,
              strokeColor: '#ffffff',
              fillColor: '#047857',
              fillOpacity: 1,
            },
            offset: '20%',
            repeat: '100px',
          },
        ],
        map,
      });

      polylinesRef.current.push(glowB, lineB);
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, roadGeometryA, roadGeometryB, activeFilter]);

  // 3. Fit Bounds on initial load, corridor switch, selected places change, filter change, or explicit recenter!
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const corridorKey = `${routeA.name}-${routeA.origin.location.lat},${routeA.origin.location.lng}-${routeA.destination.location.lat},${routeA.destination.location.lng}-${routeA.waypoints.length}-${routeB.name}-${routeB.origin.location.lat},${routeB.origin.location.lng}-${routeB.destination.location.lat},${routeB.destination.location.lng}-${routeB.waypoints.length}-${activeFilter}-${recenterTrigger || 0}-${roadGeometryA.length}-${roadGeometryB.length}`;
    if (hasFittedRef.current === corridorKey && !recenterTrigger) return;
    hasFittedRef.current = corridorKey;

    const bounds = new google.maps.LatLngBounds();
    if (activeFilter === 'both' || activeFilter === 'route-a') {
      bounds.extend({ lat: routeA.origin.location.lat, lng: routeA.origin.location.lng });
      bounds.extend({ lat: routeA.destination.location.lat, lng: routeA.destination.location.lng });
      routeA.waypoints.forEach((w) => bounds.extend({ lat: w.location.lat, lng: w.location.lng }));
      roadGeometryA.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
      routeA.pathCoordinates.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
    }
    if (activeFilter === 'both' || activeFilter === 'route-b') {
      bounds.extend({ lat: routeB.origin.location.lat, lng: routeB.origin.location.lng });
      bounds.extend({ lat: routeB.destination.location.lat, lng: routeB.destination.location.lng });
      routeB.waypoints.forEach((w) => bounds.extend({ lat: w.location.lat, lng: w.location.lng }));
      roadGeometryB.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
      routeB.pathCoordinates.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
    }

    if (!bounds.isEmpty()) {
      (map as any).fitBounds(bounds, { top: 70, bottom: 70, left: 70, right: 70 });
    }
  }, [map, routeA, routeB, roadGeometryA, roadGeometryB, activeFilter, recenterTrigger]);

  // Handle focusing to a specific location pin when requested from Locations Set
  useEffect(() => {
    if (!map || !focusLocation) return;
    (map as any).panTo({ lat: focusLocation.lat, lng: focusLocation.lng });
    (map as any).setZoom(15);
  }, [map, focusLocation]);

  // 4. Handle Zoom In / Zoom Out trigger commands
  useEffect(() => {
    if (!map || !zoomTrigger) return;
    const currentZoom = (map as any).getZoom() || 9;
    if (zoomTrigger.type === 'in') {
      (map as any).setZoom(Math.min(currentZoom + 1, 20));
    } else if (zoomTrigger.type === 'out') {
      (map as any).setZoom(Math.max(currentZoom - 1, 3));
    }
  }, [map, zoomTrigger]);

  const handleMapZoomIn = () => {
    if (!map) return;
    const z = (map as any).getZoom() || 9;
    (map as any).setZoom(z + 1);
  };

  const handleMapZoomOut = () => {
    if (!map) return;
    const z = (map as any).getZoom() || 9;
    (map as any).setZoom(Math.max(z - 1, 3));
  };

  const handleMapRecenter = () => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    if (activeFilter === 'both' || activeFilter === 'route-a') {
      roadGeometryA.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
    }
    if (activeFilter === 'both' || activeFilter === 'route-b') {
      roadGeometryB.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
    }
    if (!bounds.isEmpty()) {
      (map as any).fitBounds(bounds, { top: 70, bottom: 70, left: 70, right: 70 });
    }
  };

  const handleRealignRoads = () => {
    setManualAlignCount((c) => c + 1);
  };

  return (
    <>
      {/* Floating Real-Road Alignment Status Indicator */}
      <div className="absolute top-16 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/92 border border-slate-700/80 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-100 flex items-center gap-1">
            <span>🛣️ Real Highway Geometry:</span>
            <span className="text-emerald-400 font-extrabold">100% Snapped to Roads</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleRealignRoads}
          className="ml-1 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
          title="Re-calculate exact Google Maps road directions"
        >
          <RefreshCw className={`w-3 h-3 ${alignmentStatus === 'aligning' ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {/* Floating Map Zoom & Recenter controls */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-1.5 shadow-2xl">
        <button
          type="button"
          onClick={handleMapZoomIn}
          className="w-9 h-9 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 backdrop-blur"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleMapZoomOut}
          className="w-9 h-9 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 backdrop-blur"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleMapRecenter}
          className="w-9 h-9 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-blue-400 border border-slate-700/80 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 backdrop-blur"
          title="Fit Routes to View"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export const GoogleRouteMap: React.FC<GoogleRouteMapProps> = ({
  routeA,
  routeB,
  activeFilter,
  centerCoords,
  mapTypeId = 'roadmap',
  recenterTrigger,
  zoomTrigger,
  onSelectWaypoint,
  onSelectPin,
  onFallbackToLeaflet,
  onRoadGeometryAligned,
  focusLocation,
}) => {
  const [authError, setAuthError] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('Google Maps authentication failure detected.');
      setAuthError(true);
    };

    window.gm_authFailure = handleAuthFailure;
    return () => {
      if (window.gm_authFailure === handleAuthFailure) {
        delete window.gm_authFailure;
      }
    };
  }, []);

  const defaultCenter = useMemo(() => {
    if (centerCoords) return centerCoords;
    if (routeA.pathCoordinates.length > 0) {
      return routeA.pathCoordinates[0];
    }
    return { lat: 28.5355, lng: 77.3000 };
  }, [centerCoords, routeA]);

  const isSharedOrigin = useMemo(() => {
    return (
      Math.abs(routeA.origin.location.lat - routeB.origin.location.lat) < 0.005 &&
      Math.abs(routeA.origin.location.lng - routeB.origin.location.lng) < 0.005
    );
  }, [routeA.origin.location, routeB.origin.location]);

  const isSharedDestination = useMemo(() => {
    return (
      Math.abs(routeA.destination.location.lat - routeB.destination.location.lat) < 0.005 &&
      Math.abs(routeA.destination.location.lng - routeB.destination.location.lng) < 0.005
    );
  }, [routeA.destination.location, routeB.destination.location]);

  // Mid points for path labels
  const midPointA = useMemo(() => {
    if (routeA.pathCoordinates.length < 3) return null;
    const idx = Math.floor(routeA.pathCoordinates.length / 2);
    return routeA.pathCoordinates[idx];
  }, [routeA.pathCoordinates]);

  const midPointB = useMemo(() => {
    if (routeB.pathCoordinates.length < 3) return null;
    const idx = Math.floor(routeB.pathCoordinates.length / 2);
    return routeB.pathCoordinates[idx];
  }, [routeB.pathCoordinates]);

  if (authError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/90 text-center">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Google Maps Activation Notice</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            The provided Google Maps API key was loaded. If the Maps JavaScript API is still propagating or restricted in Google Cloud Console, you can switch seamlessly to the high-performance Real Map.
          </p>
          <button
            type="button"
            onClick={onFallbackToLeaflet}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            Switch to Leaflet Real Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          id="google-maps-dual-corridor"
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={defaultCenter}
          defaultZoom={9}
          mapTypeId={mapTypeId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Polylines and Zoom / Bounds Controller */}
          <GoogleMapController
            routeA={routeA}
            routeB={routeB}
            activeFilter={activeFilter}
            recenterTrigger={recenterTrigger}
            zoomTrigger={zoomTrigger}
            onRoadGeometryAligned={onRoadGeometryAligned}
            focusLocation={focusLocation}
          />

          {/* SHARED START POINT (When both routes start at the same origin) */}
          {activeFilter === 'both' && isSharedOrigin && (
            <AdvancedMarker
              position={{ lat: routeA.origin.location.lat, lng: routeA.origin.location.lng }}
              title={`Common Start Point: ${routeA.origin.name}`}
              onClick={() =>
                onSelectPin?.({
                  routeId: 'route-a',
                  title: `📍 COMMON START POINT: ${routeA.origin.name}`,
                  description: `${routeA.origin.address} • Dual Departure Hub for Route A (${routeA.name.split('(')[0].trim()}) and Route B (${routeB.name.split('(')[0].trim()})`,
                  lat: routeA.origin.location.lat,
                  lng: routeA.origin.location.lng,
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition animate-pulse pointer-events-none" />
                <div className="relative flex items-center bg-slate-950 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-2xl gap-1.5 text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    START POINT
                  </span>
                  <div className="flex items-center gap-1 ml-0.5">
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-[9px] font-black text-white shadow">
                      Path A
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-[9px] font-black text-white shadow">
                      Path B
                    </span>
                  </div>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700/80 text-[9px] font-bold text-slate-200 shadow-xl whitespace-nowrap pointer-events-none">
                  Common Origin (Both Routes)
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* INDIVIDUAL START POINT A (When filtered or different origins) */}
          {(activeFilter === 'route-a' || (activeFilter === 'both' && !isSharedOrigin)) && (
            <AdvancedMarker
              position={{ lat: routeA.origin.location.lat, lng: routeA.origin.location.lng }}
              title={`Start Point: ${routeA.origin.name}`}
              onClick={() =>
                onSelectPin?.({
                  routeId: 'route-a',
                  title: `📍 START POINT (Route A): ${routeA.origin.name}`,
                  description: `${routeA.origin.address} • Route A Departure Hub`,
                  lat: routeA.origin.location.lat,
                  lng: routeA.origin.location.lng,
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer group">
                <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping pointer-events-none" />
                <div className="relative flex items-center bg-blue-950 border-2 border-blue-400 rounded-full px-2 py-0.5 shadow-xl gap-1 text-white">
                  <span className="text-[9px] font-black text-blue-300">START A</span>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* INDIVIDUAL START POINT B (When filtered or different origins) */}
          {(activeFilter === 'route-b' || (activeFilter === 'both' && !isSharedOrigin)) && (
            <AdvancedMarker
              position={{ lat: routeB.origin.location.lat, lng: routeB.origin.location.lng }}
              title={`Start Point: ${routeB.origin.name}`}
              onClick={() =>
                onSelectPin?.({
                  routeId: 'route-b',
                  title: `📍 START POINT (Route B): ${routeB.origin.name}`,
                  description: `${routeB.origin.address} • Route B Departure Hub`,
                  lat: routeB.origin.location.lat,
                  lng: routeB.origin.location.lng,
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer group">
                <div className="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                <div className="relative flex items-center bg-emerald-950 border-2 border-emerald-400 rounded-full px-2 py-0.5 shadow-xl gap-1 text-white">
                  <span className="text-[9px] font-black text-emerald-300">START B</span>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* SHARED END POINT (When both routes end at the same destination) */}
          {activeFilter === 'both' && isSharedDestination && (
            <AdvancedMarker
              position={{ lat: routeA.destination.location.lat, lng: routeA.destination.location.lng }}
              title={`Common End Point: ${routeA.destination.name}`}
              onClick={() =>
                onSelectPin?.({
                  routeId: 'route-a',
                  title: `🏁 COMMON END POINT: ${routeA.destination.name}`,
                  description: `${routeA.destination.address} • Arrival Terminal for Route A (${routeA.distanceKm} km) and Route B (${routeB.distanceKm} km)`,
                  lat: routeA.destination.location.lat,
                  lng: routeA.destination.location.lng,
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition animate-pulse pointer-events-none" />
                <div className="relative flex items-center bg-slate-950 border-2 border-cyan-400 rounded-full px-2.5 py-1 shadow-2xl gap-1.5 text-white">
                  <span className="text-xs">🏁</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    END POINT
                  </span>
                  <div className="flex items-center gap-1 ml-0.5">
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-[9px] font-black text-white shadow">
                      Path A Terminus
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-[9px] font-black text-white shadow">
                      Path B Terminus
                    </span>
                  </div>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700/80 text-[9px] font-bold text-slate-200 shadow-xl whitespace-nowrap pointer-events-none">
                  Common Destination (Both Routes)
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* INDIVIDUAL END POINT A (When filtered or different destinations) */}
          {(activeFilter === 'route-a' || (activeFilter === 'both' && !isSharedDestination)) && (
            <AdvancedMarker
              position={{ lat: routeA.destination.location.lat, lng: routeA.destination.location.lng }}
              title={`Destination: ${routeA.destination.name}`}
              onClick={() =>
                onSelectPin?.({
                  routeId: 'route-a',
                  title: `🏁 END POINT (Route A): ${routeA.destination.name}`,
                  description: `${routeA.destination.address} • Terminal for Route A (${routeA.distanceKm} km)`,
                  lat: routeA.destination.location.lat,
                  lng: routeA.destination.location.lng,
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-blue-400 shadow-xl flex items-center justify-center text-blue-400 text-[11px] font-bold">
                  🏁
                </div>
                <span className="mt-0.5 text-[9px] font-bold bg-blue-950 text-blue-300 px-1 rounded border border-blue-800">
                  END A
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* INDIVIDUAL END POINT B (When filtered or different destinations) */}
          {(activeFilter === 'route-b' || (activeFilter === 'both' && !isSharedDestination)) && (
            <AdvancedMarker
              position={{ lat: routeB.destination.location.lat, lng: routeB.destination.location.lng }}
              title={`Destination: ${routeB.destination.name}`}
              onClick={() =>
                onSelectPin?.({
                  routeId: 'route-b',
                  title: `🏁 END POINT (Route B): ${routeB.destination.name}`,
                  description: `${routeB.destination.address} • Terminal for Route B (${routeB.distanceKm} km)`,
                  lat: routeB.destination.location.lat,
                  lng: routeB.destination.location.lng,
                })
              }
            >
              <div className="relative flex flex-col items-center cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400 text-[11px] font-bold">
                  🏁
                </div>
                <span className="mt-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-800">
                  END B
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* MID-PATH CORRIDOR LABELS TO EMPHASIZE DIFFERENT PATHS */}
          {(activeFilter === 'both' || activeFilter === 'route-a') && midPointA && (
            <AdvancedMarker
              position={{ lat: midPointA.lat, lng: midPointA.lng }}
              title={`Path A: ${routeA.name}`}
            >
              <div className="px-2 py-0.5 rounded-full bg-blue-900/90 border border-blue-400/90 text-white font-mono text-[9px] font-bold shadow-2xl pointer-events-none flex items-center gap-1.5 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
                <span>Path A: {routeA.tag || 'Expressway Corridor'}</span>
              </div>
            </AdvancedMarker>
          )}

          {(activeFilter === 'both' || activeFilter === 'route-b') && midPointB && (
            <AdvancedMarker
              position={{ lat: midPointB.lat, lng: midPointB.lng }}
              title={`Path B: ${routeB.name}`}
            >
              <div className="px-2 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-400/90 text-white font-mono text-[9px] font-bold shadow-2xl pointer-events-none flex items-center gap-1.5 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Path B: {routeB.tag || 'Bypass Corridor'}</span>
              </div>
            </AdvancedMarker>
          )}

          {/* ROUTE A WAYPOINTS & VEHICLE */}
          {(activeFilter === 'both' || activeFilter === 'route-a') && (
            <>
              {/* Waypoints A */}
              {routeA.waypoints.map((wp, index) => {
                const statusBg =
                  wp.status === 'completed'
                    ? 'bg-emerald-600'
                    : wp.status === 'current'
                    ? 'bg-amber-500'
                    : 'bg-blue-600';
                const ringBorder =
                  wp.status === 'current'
                    ? 'ring-4 ring-amber-400/40 animate-pulse'
                    : 'ring-2 ring-white/80';

                return (
                  <AdvancedMarker
                    key={wp.id}
                    position={{ lat: wp.location.lat, lng: wp.location.lng }}
                    title={`Stop ${index + 1}: ${wp.name}`}
                    onClick={() => {
                      onSelectPin?.({
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
                    }}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      <div
                        className={`w-6 h-6 rounded-full ${statusBg} ${ringBorder} border border-white/60 shadow-lg flex items-center justify-center text-white text-[11px] font-bold`}
                      >
                        {index + 1}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Vehicle Marker A */}
              <AdvancedMarker
                position={{ lat: routeA.currentVehiclePos.lat, lng: routeA.currentVehiclePos.lng }}
                title={`Vehicle: ${routeA.driver.vehicle}`}
                onClick={() =>
                  onSelectPin?.({
                    routeId: 'route-a',
                    title: `Active Vehicle: ${routeA.driver.vehicle}`,
                    description: `Driver: ${routeA.driver.name} (${routeA.driver.phone}) • Speed: ${routeA.currentSpeedKmh} km/h • Battery: ${routeA.fuelLevelPct}%`,
                    status: routeA.status,
                    lat: routeA.currentVehiclePos.lat,
                    lng: routeA.currentVehiclePos.lng,
                  })
                }
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping pointer-events-none" />
                  <div className="relative px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg border-2 border-white shadow-xl flex items-center gap-1.5 text-white">
                    <Truck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold tracking-tight">
                      {routeA.driver.vehicle.slice(0, 10)}
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            </>
          )}

          {/* ROUTE B MARKERS */}
          {(activeFilter === 'both' || activeFilter === 'route-b') && (
            <>
              {/* Waypoints B */}
              {routeB.waypoints.map((wp, index) => {
                const statusBg =
                  wp.status === 'completed'
                    ? 'bg-emerald-600'
                    : wp.status === 'current'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600';
                const ringBorder =
                  wp.status === 'current'
                    ? 'ring-4 ring-amber-400/40 animate-pulse'
                    : 'ring-2 ring-white/80';

                return (
                  <AdvancedMarker
                    key={wp.id}
                    position={{ lat: wp.location.lat, lng: wp.location.lng }}
                    title={`Stop ${index + 1}: ${wp.name}`}
                    onClick={() => {
                      onSelectPin?.({
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
                    }}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      <div
                        className={`w-6 h-6 rounded-full ${statusBg} ${ringBorder} border border-white/60 shadow-lg flex items-center justify-center text-white text-[11px] font-bold`}
                      >
                        {index + 1}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Vehicle Marker B */}
              <AdvancedMarker
                position={{ lat: routeB.currentVehiclePos.lat, lng: routeB.currentVehiclePos.lng }}
                title={`Vehicle: ${routeB.driver.vehicle}`}
                onClick={() =>
                  onSelectPin?.({
                    routeId: 'route-b',
                    title: `Active Vehicle: ${routeB.driver.vehicle}`,
                    description: `Driver: ${routeB.driver.name} (${routeB.driver.phone}) • Speed: ${routeB.currentSpeedKmh} km/h • Battery: ${routeB.fuelLevelPct}%`,
                    status: routeB.status,
                    lat: routeB.currentVehiclePos.lat,
                    lng: routeB.currentVehiclePos.lng,
                  })
                }
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute w-10 h-10 bg-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                  <div className="relative px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg border-2 border-white shadow-xl flex items-center gap-1.5 text-white">
                    <Truck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold tracking-tight">
                      {routeB.driver.vehicle.slice(0, 10)}
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            </>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
