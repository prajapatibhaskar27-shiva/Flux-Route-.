import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RouteData, Waypoint, InvoiceItem, CustomerWallet, PaymentMethod, VehicleOption, LatLng } from './types/route';
import { CITY_PRESETS } from './data/mockRoutes';
import { INITIAL_INVOICES, INITIAL_WALLET, INITIAL_PAYMENT_METHODS } from './data/mockFinance';
import { VEHICLE_OPTIONS } from './data/mockVehicles';
import { Header } from './components/Header';
import { DualRouteMap } from './components/DualRouteMap';
import { DualRouteMetrics } from './components/DualRouteMetrics';
import { MoneySection } from './components/MoneySection';
import { FleetOverview } from './components/FleetOverview';
import { RoutePlannerView } from './components/RoutePlannerView';
import { RoutePlannerModal } from './components/RoutePlannerModal';
import { DriverDispatchDrawer } from './components/DriverDispatchDrawer';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { DashboardVehicleBar } from './components/DashboardVehicleBar';
import { VehicleSelectorModal } from './components/VehicleSelectorModal';
import { AddCustomRouteModal } from './components/AddCustomRouteModal';
import { RouteLocationsSetCard } from './components/RouteLocationsSetCard';
import { DriverEyeDetectionModal } from './components/DriverEyeDetectionModal';
import { POPULAR_PLACES } from './data/popularPlaces';
import { DriverEyeDetection } from './types/route';
import { fetchGoogleDrivingDirections, generateCurvedCorridorPath } from './services/routeDirectionsService';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Leaf, 
  Zap, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  Navigation,
  CheckCircle2,
  Eye,
  AlertTriangle,
  Coffee
} from 'lucide-react';

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState<string>('india_delhi');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'money' | 'fleet' | 'planner'>('dashboard');
  
  // Currency symbol based on selected corridor (₹ for India, $ for US)
  const currencySymbol = selectedCityId.startsWith('india') ? '₹' : '$';

  // Dual Routes State
  const initialPreset = CITY_PRESETS.india_delhi || CITY_PRESETS.sf;
  const [routeA, setRouteA] = useState<RouteData>(initialPreset.routes.routeA);
  const [routeB, setRouteB] = useState<RouteData>(initialPreset.routes.routeB);
  const [activeFilter, setActiveFilter] = useState<'both' | 'route-a' | 'route-b'>('both');

  // Customer Financial State
  const [wallet, setWallet] = useState<CustomerWallet>(INITIAL_WALLET);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);

  // Live Telematics Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const simulationStepRef = useRef<number>(0);

  // Modals
  const [addStopModalRouteId, setAddStopModalRouteId] = useState<'route-a' | 'route-b' | null>(null);
  const [activeDriverModal, setActiveDriverModal] = useState<RouteData['driver'] | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<InvoiceItem | null>(null);

  // Vehicle Dispatch Selection State
  const [selectedVehicleAId, setSelectedVehicleAId] = useState<string>('bharatbenz-2823r');
  const [selectedVehicleBId, setSelectedVehicleBId] = useState<string>('tata-prima-3530');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);
  const [vehicleModalTargetRouteId, setVehicleModalTargetRouteId] = useState<'route-a' | 'route-b'>('route-a');

  // Custom Route Creation & Place Alignment State
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState<boolean>(false);
  const [addRouteTargetId, setAddRouteTargetId] = useState<'route-a' | 'route-b' | 'both_ev_vs_diesel'>('route-a');
  const [mapAlignTrigger, setMapAlignTrigger] = useState<number>(0);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number; title: string; timestamp: number } | null>(null);
  const [routeCreationToast, setRouteCreationToast] = useState<{ message: string; timestamp: number } | null>(null);

  // Driver Eye Detection & Sleepiness Telematics Modal State
  const [isEyeModalOpen, setIsEyeModalOpen] = useState<boolean>(false);
  const [eyeModalRouteId, setEyeModalRouteId] = useState<'route-a' | 'route-b'>('route-a');

  const handleOpenEyeDetection = (routeId: 'route-a' | 'route-b' = 'route-a') => {
    setEyeModalRouteId(routeId);
    setIsEyeModalOpen(true);
  };

  const handleUpdateDriverEyeStatus = (routeId: 'route-a' | 'route-b', updatedStatus: DriverEyeDetection) => {
    const isRouteA = routeId === 'route-a';
    const updater = isRouteA ? setRouteA : setRouteB;
    const driverName = isRouteA ? routeA.driver.name : routeB.driver.name;

    updater((prev) => {
      // If speed governor active, throttle speed to 45 km/h for emergency road safety
      const governedSpeed = updatedStatus.speedGovernorActive ? 45 : (prev.currentSpeedKmh === 45 ? 78 : prev.currentSpeedKmh);
      return {
        ...prev,
        currentSpeedKmh: governedSpeed,
        driver: {
          ...prev.driver,
          eyeDetection: updatedStatus,
        },
      };
    });

    if (updatedStatus.isSleepy) {
      setRouteCreationToast({
        message: `⚠️ DRIVER SLEEPINESS WARNING: ${driverName} eye closure ${updatedStatus.consecutiveClosedSeconds}s detected! Emergency countermeasures activated.`,
        timestamp: Date.now(),
      });
    }
  };

  const handleAddRestStopWaypoint = (routeId: 'route-a' | 'route-b', restStopName: string) => {
    const isRouteA = routeId === 'route-a';
    const targetRoute = isRouteA ? routeA : routeB;

    const restLocation: LatLng = isRouteA
      ? { lat: 27.9850, lng: 77.6250 } // Yamuna Expressway Mile 65 Driver Oasis
      : { lat: 27.8850, lng: 77.4100 }; // NH-19 Mathura Truckers Rest Bay

    const restWaypoint: Waypoint = {
      id: `rest-bay-${Date.now()}`,
      name: `☕ ${restStopName}`,
      address: `${restStopName}, Safe Layby Truck Bay`,
      location: restLocation,
      status: 'pending',
      eta: 'Next Exit (6 mins)',
      packagesCount: 0,
      recipient: 'Driver Sleeping Bunks & 20-Min Rest Bay',
      notes: 'Scheduled 20-min mandatory restorative power nap',
    };

    const newWaypoints = [...targetRoute.waypoints, restWaypoint];

    if (isRouteA) {
      setRouteA((prev) => ({
        ...prev,
        waypoints: newWaypoints,
      }));
    } else {
      setRouteB((prev) => ({
        ...prev,
        waypoints: newWaypoints,
      }));
    }

    setMapAlignTrigger((prev) => prev + 1);
    setRouteCreationToast({
      message: `☕ Dispatched 20-Min Rest Stop: ${restStopName} added to ${targetRoute.name}!`,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    if (!routeCreationToast) return;
    const timer = setTimeout(() => setRouteCreationToast(null), 5000);
    return () => clearTimeout(timer);
  }, [routeCreationToast]);

  const handleOpenAddCustomRoute = (targetId: 'route-a' | 'route-b' | 'both_ev_vs_diesel' = 'route-a') => {
    setAddRouteTargetId(targetId);
    setIsAddRouteModalOpen(true);
  };

  const handleSelectLocationOnMap = (loc: LatLng, title: string) => {
    setFocusLocation({ lat: loc.lat, lng: loc.lng, title, timestamp: Date.now() });
    setRouteCreationToast({
      message: `📍 Focused Map on: ${title} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`,
      timestamp: Date.now(),
    });
  };

  // Assign Vehicle to Route A or B
  const handleAssignVehicle = (routeId: 'route-a' | 'route-b', vehicle: VehicleOption) => {
    if (routeId === 'route-a') {
      setSelectedVehicleAId(vehicle.id);
      setRouteA((prev) => {
        const baseFare = 12450;
        const baseToll = 840;
        const adjustedFare = Math.round(baseFare * vehicle.fareMultiplier);
        const adjustedToll = Math.round(baseToll * vehicle.tollMultiplier);
        const isEV = vehicle.fuelType === '100% Electric EV';
        const isClean = vehicle.fuelType.includes('LNG') || vehicle.fuelType.includes('CNG');
        const dynamicCarbonSaved = isEV
          ? Number((prev.distanceKm * 0.38).toFixed(1))
          : isClean
          ? Number((prev.distanceKm * 0.26).toFixed(1))
          : Number((prev.distanceKm * 0.18).toFixed(1));

        return {
          ...prev,
          driver: {
            ...prev.driver,
            vehicle: vehicle.name,
            plate: vehicle.plate,
          },
          fuelLevelPct: vehicle.batteryOrFuelPct,
          currentSpeedKmh: vehicle.avgSpeedKmh,
          efficiencyScore: vehicle.efficiencyScore,
          fareAmount: adjustedFare,
          tollAmount: adjustedToll,
          carbonSavedKg: dynamicCarbonSaved,
          temperatureCelsius: vehicle.hasReefer ? vehicle.reeferTempCelsius : undefined,
        };
      });
    } else {
      setSelectedVehicleBId(vehicle.id);
      setRouteB((prev) => {
        const baseFare = 11200;
        const baseToll = 380;
        const adjustedFare = Math.round(baseFare * vehicle.fareMultiplier);
        const adjustedToll = Math.round(baseToll * vehicle.tollMultiplier);
        const isEV = vehicle.fuelType === '100% Electric EV';
        const isClean = vehicle.fuelType.includes('LNG') || vehicle.fuelType.includes('CNG');
        const dynamicCarbonSaved = isEV
          ? Number((prev.distanceKm * 0.39).toFixed(1))
          : isClean
          ? Number((prev.distanceKm * 0.27).toFixed(1))
          : Number((prev.distanceKm * 0.19).toFixed(1));

        return {
          ...prev,
          driver: {
            ...prev.driver,
            vehicle: vehicle.name,
            plate: vehicle.plate,
          },
          fuelLevelPct: vehicle.batteryOrFuelPct,
          currentSpeedKmh: vehicle.avgSpeedKmh,
          efficiencyScore: vehicle.efficiencyScore,
          fareAmount: adjustedFare,
          tollAmount: adjustedToll,
          carbonSavedKg: dynamicCarbonSaved,
          temperatureCelsius: vehicle.hasReefer ? vehicle.reeferTempCelsius : undefined,
        };
      });
    }
  };

  const handleQuickSelectVehicle = (routeId: 'route-a' | 'route-b', vehicleId: string) => {
    const veh = VEHICLE_OPTIONS.find((v) => v.id === vehicleId);
    if (veh) {
      handleAssignVehicle(routeId, veh);
    }
  };

  const handleSwapVehicles = () => {
    const vehA = VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleAId) || VEHICLE_OPTIONS[0];
    const vehB = VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleBId) || VEHICLE_OPTIONS[1];
    handleAssignVehicle('route-a', vehB);
    handleAssignVehicle('route-b', vehA);
  };

  // Switch City Presets
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const preset = CITY_PRESETS[cityId] || CITY_PRESETS.india_delhi || CITY_PRESETS.sf;
    setRouteA(preset.routes.routeA);
    setRouteB(preset.routes.routeB);
    setMapAlignTrigger((prev) => prev + 1);
  };

  // Synchronize road-snapped Google Directions geometry so telematics simulation follows real turns
  const handleRoadGeometryAligned = useCallback((alignedA: LatLng[], alignedB: LatLng[]) => {
    if (alignedA && alignedA.length > 5) {
      setRouteA((prev) => ({
        ...prev,
        pathCoordinates: alignedA,
      }));
    }
    if (alignedB && alignedB.length > 5) {
      setRouteB((prev) => ({
        ...prev,
        pathCoordinates: alignedB,
      }));
    }
  }, []);

  // Apply a newly created or customized route with selected places
  const handleApplyCustomRoute = async (
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
  ) => {
    // 1. Compute driving directions immediately with Google Maps Directions
    const directions = await fetchGoogleDrivingDirections(
      routeData.origin.location,
      routeData.destination.location,
      routeData.waypoints.map((w) => w.location)
    );

    let finalPath: LatLng[] = [];
    let finalDistanceKm = 0;
    let finalDurationMins = 0;

    if (directions && directions.path.length > 5) {
      finalPath = directions.path;
      finalDistanceKm = directions.distanceKm;
      finalDurationMins = directions.durationMins;
    } else {
      const sequence: LatLng[] = [
        routeData.origin.location,
        ...routeData.waypoints.map((w) => w.location),
        routeData.destination.location,
      ];
      finalPath = generateCurvedCorridorPath(sequence, 10);
      const latDiff = routeData.destination.location.lat - routeData.origin.location.lat;
      const lngDiff = routeData.destination.location.lng - routeData.origin.location.lng;
      finalDistanceKm = Math.max(25, Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 1.3));
      finalDurationMins = Math.max(30, Math.round((finalDistanceKm / 60) * 60));
    }

    const hours = Math.floor(finalDurationMins / 60);
    const mins = finalDurationMins % 60;
    const etaString = hours > 0 ? `${hours} hr ${mins} min remaining` : `${mins} min remaining`;

    // CASE 1: EV vs Diesel Comparative Mode on Same Locations
    if (targetRouteId === 'both_ev_vs_diesel') {
      const evVehicle = VEHICLE_OPTIONS.find((v) => v.id === 'tesla-semi-hauler') || VEHICLE_OPTIONS.find((v) => v.id === 'tata-ace-ev') || VEHICLE_OPTIONS[2];
      const dieselVehicle = VEHICLE_OPTIONS.find((v) => v.id === 'bharatbenz-2823r') || VEHICLE_OPTIONS[0];

      setSelectedVehicleAId(evVehicle.id);
      setSelectedVehicleBId(dieselVehicle.id);

      const evFare = Math.round(finalDistanceKm * 56 * evVehicle.fareMultiplier);
      const evToll = Math.round((finalDistanceKm > 40 ? finalDistanceKm * 3.7 : 70) * evVehicle.tollMultiplier);
      const dieselFare = Math.round(finalDistanceKm * 56 * dieselVehicle.fareMultiplier);
      const dieselToll = Math.round((finalDistanceKm > 40 ? finalDistanceKm * 3.7 : 70) * dieselVehicle.tollMultiplier);

      const co2Saved = Number((finalDistanceKm * 0.38).toFixed(1));
      const co2Emitted = Number((finalDistanceKm * 0.185).toFixed(1));

      setRouteA((prev) => ({
        ...prev,
        name: `${routeData.name} (⚡ 100% Electric EV)`,
        code: `EV-${routeData.code.replace('FX-', '')}`,
        tag: '⚡ Zero-Emission Clean Corridor',
        origin: routeData.origin,
        destination: routeData.destination,
        waypoints: routeData.waypoints,
        pathCoordinates: finalPath,
        currentVehiclePos: finalPath[0] || routeData.origin.location,
        currentProgressPct: 0,
        distanceKm: finalDistanceKm,
        durationMins: finalDurationMins,
        eta: etaString,
        fareAmount: evFare,
        tollAmount: evToll,
        driver: {
          ...prev.driver,
          vehicle: evVehicle.name,
          plate: evVehicle.plate,
        },
        fuelLevelPct: evVehicle.batteryOrFuelPct,
        currentSpeedKmh: evVehicle.avgSpeedKmh,
        efficiencyScore: evVehicle.efficiencyScore,
        carbonSavedKg: co2Saved,
        carbonEmittedKg: 0,
        propulsionType: 'ev',
      }));

      setRouteB((prev) => ({
        ...prev,
        name: `${routeData.name} (⛽ Diesel Euro-VI Heavy)`,
        code: `DSL-${routeData.code.replace('FX-', '')}`,
        tag: '⛽ Conventional Diesel Hauler',
        origin: routeData.origin,
        destination: routeData.destination,
        waypoints: routeData.waypoints,
        pathCoordinates: finalPath,
        currentVehiclePos: finalPath[0] || routeData.origin.location,
        currentProgressPct: 0,
        distanceKm: finalDistanceKm,
        durationMins: finalDurationMins,
        eta: etaString,
        fareAmount: dieselFare,
        tollAmount: dieselToll,
        driver: {
          ...prev.driver,
          vehicle: dieselVehicle.name,
          plate: dieselVehicle.plate,
        },
        fuelLevelPct: dieselVehicle.batteryOrFuelPct,
        currentSpeedKmh: dieselVehicle.avgSpeedKmh,
        efficiencyScore: dieselVehicle.efficiencyScore,
        carbonSavedKg: 0,
        carbonEmittedKg: co2Emitted,
        propulsionType: 'diesel',
      }));

      setActiveFilter('both');
      setActiveTab('dashboard');
      setMapAlignTrigger((prev) => prev + 1);
      setRouteCreationToast({
        message: `⚡ Same Route Created: ⚡ EV (Route A) vs ⛽ Diesel (Route B) across all ${routeData.waypoints.length + 2} locations!`,
        timestamp: Date.now(),
      });
      return;
    }

    const assignedVehicle =
      VEHICLE_OPTIONS.find((v) => v.id === routeData.vehicleId) ||
      (targetRouteId === 'route-a'
        ? VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleAId)
        : VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleBId)) ||
      VEHICLE_OPTIONS[0];

    const computedFare = Math.round(finalDistanceKm * 56 * assignedVehicle.fareMultiplier);
    const computedToll = Math.round((finalDistanceKm > 40 ? finalDistanceKm * 3.7 : 70) * assignedVehicle.tollMultiplier);

    if (targetRouteId === 'route-a') {
      if (routeData.vehicleId) setSelectedVehicleAId(routeData.vehicleId);
      setRouteA((prev) => ({
        ...prev,
        name: routeData.name,
        code: routeData.code,
        tag: routeData.tag,
        origin: routeData.origin,
        destination: routeData.destination,
        waypoints: routeData.waypoints,
        pathCoordinates: finalPath,
        currentVehiclePos: finalPath[0] || routeData.origin.location,
        currentProgressPct: 0,
        distanceKm: finalDistanceKm,
        durationMins: finalDurationMins,
        eta: etaString,
        fareAmount: computedFare,
        tollAmount: computedToll,
        driver: {
          ...prev.driver,
          vehicle: assignedVehicle.name,
          plate: assignedVehicle.plate,
        },
        fuelLevelPct: assignedVehicle.batteryOrFuelPct,
        currentSpeedKmh: assignedVehicle.avgSpeedKmh,
        efficiencyScore: assignedVehicle.efficiencyScore,
      }));
    } else {
      if (routeData.vehicleId) setSelectedVehicleBId(routeData.vehicleId);
      setRouteB((prev) => ({
        ...prev,
        name: routeData.name,
        code: routeData.code,
        tag: routeData.tag,
        origin: routeData.origin,
        destination: routeData.destination,
        waypoints: routeData.waypoints,
        pathCoordinates: finalPath,
        currentVehiclePos: finalPath[0] || routeData.origin.location,
        currentProgressPct: 0,
        distanceKm: finalDistanceKm,
        durationMins: finalDurationMins,
        eta: etaString,
        fareAmount: computedFare,
        tollAmount: computedToll,
        driver: {
          ...prev.driver,
          vehicle: assignedVehicle.name,
          plate: assignedVehicle.plate,
        },
        fuelLevelPct: assignedVehicle.batteryOrFuelPct,
        currentSpeedKmh: assignedVehicle.avgSpeedKmh,
        efficiencyScore: assignedVehicle.efficiencyScore,
      }));
    }

    setActiveFilter(targetRouteId);
    setActiveTab('dashboard');
    setMapAlignTrigger((prev) => prev + 1);
    setRouteCreationToast({
      message: `✓ ${routeData.name} created! Map aligned to ${routeData.waypoints.length + 2} selected places.`,
      timestamp: Date.now(),
    });
  };

  // Quick 1-Click Sync: Run same route on both Route A (EV) and Route B (Diesel)
  const handleApplySameRouteEvVsDiesel = () => {
    const baseRoute = activeFilter === 'route-b' ? routeB : routeA;
    const evVehicle = VEHICLE_OPTIONS.find((v) => v.id === 'tesla-semi-hauler') || VEHICLE_OPTIONS.find((v) => v.id === 'tata-ace-ev') || VEHICLE_OPTIONS[2];
    const dieselVehicle = VEHICLE_OPTIONS.find((v) => v.id === 'bharatbenz-2823r') || VEHICLE_OPTIONS[0];

    setSelectedVehicleAId(evVehicle.id);
    setSelectedVehicleBId(dieselVehicle.id);

    const dist = baseRoute.distanceKm;
    const evFare = Math.round(dist * 56 * evVehicle.fareMultiplier);
    const evToll = Math.round((dist > 40 ? dist * 3.7 : 70) * evVehicle.tollMultiplier);
    const dieselFare = Math.round(dist * 56 * dieselVehicle.fareMultiplier);
    const dieselToll = Math.round((dist > 40 ? dist * 3.7 : 70) * dieselVehicle.tollMultiplier);

    const co2Saved = Number((dist * 0.38).toFixed(1));
    const co2Emitted = Number((dist * 0.185).toFixed(1));
    const baseCleanName = baseRoute.name.replace(/(\(⚡|\(⛽).+$/, '').trim();
    const cleanCode = baseRoute.code.replace(/^(EV-|DSL-|FX-)/, '');

    setRouteA((prev) => ({
      ...prev,
      name: `${baseCleanName} (⚡ 100% Electric EV)`,
      code: `EV-${cleanCode}`,
      tag: '⚡ Zero-Emission Clean Corridor',
      origin: baseRoute.origin,
      destination: baseRoute.destination,
      waypoints: baseRoute.waypoints,
      pathCoordinates: baseRoute.pathCoordinates,
      currentVehiclePos: baseRoute.pathCoordinates[0] || baseRoute.origin.location,
      currentProgressPct: 0,
      distanceKm: dist,
      durationMins: baseRoute.durationMins,
      eta: baseRoute.eta,
      fareAmount: evFare,
      tollAmount: evToll,
      driver: {
        ...prev.driver,
        vehicle: evVehicle.name,
        plate: evVehicle.plate,
      },
      fuelLevelPct: evVehicle.batteryOrFuelPct,
      currentSpeedKmh: evVehicle.avgSpeedKmh,
      efficiencyScore: evVehicle.efficiencyScore,
      carbonSavedKg: co2Saved,
      carbonEmittedKg: 0,
      propulsionType: 'ev',
    }));

    setRouteB((prev) => ({
      ...prev,
      name: `${baseCleanName} (⛽ Diesel Euro-VI Heavy)`,
      code: `DSL-${cleanCode}`,
      tag: '⛽ Conventional Diesel Hauler',
      origin: baseRoute.origin,
      destination: baseRoute.destination,
      waypoints: baseRoute.waypoints,
      pathCoordinates: baseRoute.pathCoordinates,
      currentVehiclePos: baseRoute.pathCoordinates[0] || baseRoute.origin.location,
      currentProgressPct: 0,
      distanceKm: dist,
      durationMins: baseRoute.durationMins,
      eta: baseRoute.eta,
      fareAmount: dieselFare,
      tollAmount: dieselToll,
      driver: {
        ...prev.driver,
        vehicle: dieselVehicle.name,
        plate: dieselVehicle.plate,
      },
      fuelLevelPct: dieselVehicle.batteryOrFuelPct,
      currentSpeedKmh: dieselVehicle.avgSpeedKmh,
      efficiencyScore: dieselVehicle.efficiencyScore,
      carbonSavedKg: 0,
      carbonEmittedKg: co2Emitted,
      propulsionType: 'diesel',
    }));

    setActiveFilter('both');
    setMapAlignTrigger((prev) => prev + 1);
    setRouteCreationToast({
      message: `⚡ Same Route Set: ⚡ EV (Route A) vs ⛽ Diesel (Route B) across all ${baseRoute.waypoints.length + 2} locations!`,
      timestamp: Date.now(),
    });
  };

  // Quick Start & Stop setter: builds identical corridor and shows all locations in set
  const handleQuickSetStartAndStop = async (
    startPlace: { name: string; address: string; lat: number; lng: number },
    destPlace: { name: string; address: string; lat: number; lng: number }
  ) => {
    // Pick intermediate places between start and stop from POPULAR_PLACES
    const intermediate = POPULAR_PLACES.filter(
      (p) =>
        p.name !== startPlace.name &&
        p.name !== destPlace.name &&
        p.lat >= Math.min(startPlace.lat, destPlace.lat) - 0.25 &&
        p.lat <= Math.max(startPlace.lat, destPlace.lat) + 0.25 &&
        p.lng >= Math.min(startPlace.lng, destPlace.lng) - 0.25 &&
        p.lng <= Math.max(startPlace.lng, destPlace.lng) + 0.25
    ).slice(0, 2);

    const generatedWaypoints: Waypoint[] = intermediate.map((p, idx) => ({
      id: `stop-quick-${Date.now()}-${idx}`,
      name: p.name,
      address: p.address,
      location: { lat: p.lat, lng: p.lng },
      status: idx === 0 ? 'current' : 'pending',
      eta: `Stop ${idx + 1}`,
      packagesCount: 18 + idx * 6,
      recipient: `${p.shortName} Logistics Dock`,
      notes: `Corridor way-point: ${p.name}`,
    }));

    const origin = {
      name: startPlace.name,
      address: startPlace.address,
      location: { lat: startPlace.lat, lng: startPlace.lng },
    };
    const destination = {
      name: destPlace.name,
      address: destPlace.address,
      location: { lat: destPlace.lat, lng: destPlace.lng },
    };

    const directions = await fetchGoogleDrivingDirections(
      origin.location,
      destination.location,
      generatedWaypoints.map((w) => w.location)
    );

    let finalPath: LatLng[];
    let finalDist: number;
    let finalDur: number;

    if (directions && directions.path.length > 5) {
      finalPath = directions.path;
      finalDist = directions.distanceKm;
      finalDur = directions.durationMins;
    } else {
      const sequence = [
        origin.location,
        ...generatedWaypoints.map((w) => w.location),
        destination.location,
      ];
      finalPath = generateCurvedCorridorPath(sequence, 15);
      const latDiff = origin.location.lat - destination.location.lat;
      const lngDiff = origin.location.lng - destination.location.lng;
      finalDist = Math.max(25, Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 1.3));
      finalDur = Math.max(30, Math.round((finalDist / 60) * 60));
    }

    const co2Saved = Number((finalDist * 0.38).toFixed(1));
    const co2Emitted = Number((finalDist * 0.185).toFixed(1));

    // Route A as ⚡ EV
    setRouteA((prev) => ({
      ...prev,
      name: `${startPlace.name.split('(')[0].trim()} to ${destPlace.name.split('(')[0].trim()} (⚡ 100% Electric EV)`,
      code: `EV-${Math.floor(100 + Math.random() * 900)}`,
      tag: '⚡ Zero-Emission Clean Corridor',
      origin,
      destination,
      waypoints: generatedWaypoints,
      pathCoordinates: finalPath,
      currentVehiclePos: finalPath[0] || origin.location,
      currentProgressPct: 0,
      distanceKm: finalDist,
      durationMins: finalDur,
      carbonSavedKg: co2Saved,
      carbonEmittedKg: 0,
      propulsionType: 'ev',
    }));

    // Route B as ⛽ Diesel
    setRouteB((prev) => ({
      ...prev,
      name: `${startPlace.name.split('(')[0].trim()} to ${destPlace.name.split('(')[0].trim()} (⛽ Euro-VI Diesel)`,
      code: `DSL-${Math.floor(100 + Math.random() * 900)}`,
      tag: '⛽ Conventional Diesel Hauler',
      origin,
      destination,
      waypoints: generatedWaypoints,
      pathCoordinates: finalPath,
      currentVehiclePos: finalPath[0] || origin.location,
      currentProgressPct: 0,
      distanceKm: finalDist,
      durationMins: finalDur,
      carbonSavedKg: 0,
      carbonEmittedKg: co2Emitted,
      propulsionType: 'diesel',
    }));

    setActiveFilter('both');
    setMapAlignTrigger((prev) => prev + 1);
    setRouteCreationToast({
      message: `✓ Start & Stop set: Map aligned showing all ${generatedWaypoints.length + 2} locations in set!`,
      timestamp: Date.now(),
    });
  };

  // Telematics Simulation Loop: Moves vehicles along path coordinates
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = 1200 / simulationSpeed;
    const timer = setInterval(() => {
      simulationStepRef.current += 1;
      const step = simulationStepRef.current;

      // Update Route A Vehicle position
      setRouteA((prev) => {
        const coords = prev.pathCoordinates;
        if (coords.length === 0) return prev;
        const index = Math.floor((step * 0.3) % coords.length);
        const nextPos = coords[index];
        const progressPct = Math.min(98, Math.round(((index + 1) / coords.length) * 100));
        const dynamicSpeed = Math.floor(35 + Math.sin(step * 0.2) * 12);
        
        return {
          ...prev,
          currentVehiclePos: nextPos,
          currentProgressPct: progressPct,
          currentSpeedKmh: dynamicSpeed,
        };
      });

      // Update Route B Vehicle position
      setRouteB((prev) => {
        const coords = prev.pathCoordinates;
        if (coords.length === 0) return prev;
        const index = Math.floor(((step * 0.25) + 3) % coords.length);
        const nextPos = coords[index];
        const progressPct = Math.min(95, Math.round(((index + 1) / coords.length) * 100));
        const dynamicSpeed = Math.floor(40 + Math.cos(step * 0.3) * 10);

        return {
          ...prev,
          currentVehiclePos: nextPos,
          currentProgressPct: progressPct,
          currentSpeedKmh: dynamicSpeed,
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed]);

  // Execute "Pay All Things"
  const handlePayAllInvoices = async (invoiceIds: string[], paymentMethodId: string) => {
    // Simulate brief payment network handshake
    await new Promise((resolve) => setTimeout(resolve, 800));

    const totalToPay = invoices
      .filter((inv) => invoiceIds.includes(inv.id) && inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const chosenMethod = paymentMethods.find((p) => p.id === paymentMethodId) || paymentMethods[0];

    // Mark invoices as paid
    setInvoices((prev) =>
      prev.map((inv) => {
        if (invoiceIds.includes(inv.id)) {
          return {
            ...inv,
            status: 'paid',
            paymentMethod: `${chosenMethod.name} (${chosenMethod.details})`,
            transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          };
        }
        return inv;
      })
    );

    // Update customer wallet
    setWallet((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - totalToPay),
      totalPaidThisMonth: prev.totalPaidThisMonth + totalToPay,
      totalPendingDue: Math.max(0, prev.totalPendingDue - totalToPay),
    }));
  };

  // Pay single invoice
  const handlePaySingleInvoice = async (invoiceId: string) => {
    await handlePayAllInvoices([invoiceId], wallet.preferredPaymentMethodId);
  };

  // Add new Waypoint to Route A or B
  const handleAddWaypoint = async (routeId: 'route-a' | 'route-b', newWp: Omit<Waypoint, 'id'>) => {
    const waypointWithId: Waypoint = {
      ...newWp,
      id: `wp-${Date.now()}`,
    };

    const targetRoute = routeId === 'route-a' ? routeA : routeB;
    const newWaypoints = [...targetRoute.waypoints, waypointWithId];

    // Compute updated driving directions through the new stop
    const directions = await fetchGoogleDrivingDirections(
      targetRoute.origin.location,
      targetRoute.destination.location,
      newWaypoints.map((w) => w.location)
    );

    let updatedCoords: LatLng[] = [];
    let updatedDist = Number((targetRoute.distanceKm + 6.5).toFixed(1));
    let updatedDur = targetRoute.durationMins + 15;

    if (directions && directions.path.length > 5) {
      updatedCoords = directions.path;
      updatedDist = directions.distanceKm;
      updatedDur = directions.durationMins;
    } else {
      const sequence: LatLng[] = [
        targetRoute.origin.location,
        ...newWaypoints.map((w) => w.location),
        targetRoute.destination.location,
      ];
      updatedCoords = generateCurvedCorridorPath(sequence, 10);
    }

    if (routeId === 'route-a') {
      setRouteA((prev) => ({
        ...prev,
        waypoints: newWaypoints,
        pathCoordinates: updatedCoords,
        distanceKm: updatedDist,
        durationMins: updatedDur,
        fareAmount: prev.fareAmount + 185.0,
      }));
    } else {
      setRouteB((prev) => ({
        ...prev,
        waypoints: newWaypoints,
        pathCoordinates: updatedCoords,
        distanceKm: updatedDist,
        durationMins: updatedDur,
        fareAmount: prev.fareAmount + 195.0,
      }));
    }

    setRouteCreationToast({
      message: `✓ Added stop "${waypointWithId.name}". Map aligned to include newly selected place.`,
      timestamp: Date.now(),
    });

    // Add corresponding billing line item automatically
    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      routeId,
      routeTitle: routeId === 'route-a' ? routeA.name : routeB.name,
      description: `Dispatched Stop Offload: ${waypointWithId.name}`,
      category: 'freight',
      amount: routeId === 'route-a' ? 185.0 : 195.0,
      dueDate: '2026-10-05',
      issuedDate: '2026-10-01',
      status: 'pending',
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  // Re-optimize routes simulation
  const handleOptimizeRoutes = () => {
    // Reverse waypoints or reorder efficiently
    setRouteA((prev) => ({
      ...prev,
      efficiencyScore: 99.8,
      distanceKm: Number((prev.distanceKm * 0.94).toFixed(1)),
      durationMins: Math.floor(prev.durationMins * 0.9),
      carbonSavedKg: Number((prev.carbonSavedKg + 3.2).toFixed(1)),
    }));
    setRouteB((prev) => ({
      ...prev,
      efficiencyScore: 99.9,
      distanceKm: Number((prev.distanceKm * 0.92).toFixed(1)),
      durationMins: Math.floor(prev.durationMins * 0.88),
      carbonSavedKg: Number((prev.carbonSavedKg + 4.5).toFixed(1)),
    }));
    alert('AI TSP Multi-Corridor Re-sequencing complete! Saved 5.8 km across Dual Routes.');
  };

  const pendingCount = invoices.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedCity={selectedCityId}
        onSelectCity={handleCityChange}
        wallet={wallet}
        pendingInvoicesCount={pendingCount}
        currencySymbol={currencySymbol}
        onOpenAddCustomRoute={() => handleOpenAddCustomRoute('route-a')}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Dynamic Top Ops Banner with Live Dual Route Telematics */}
        <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Dual Dispatch Stream</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monitoring <strong>Route A ({routeA.code})</strong> & <strong>Route B ({routeB.code})</strong> in {CITY_PRESETS[selectedCityId]?.name || 'India Corridor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Route A: <strong>{routeA.currentSpeedKmh} km/h</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Route B: <strong>{routeB.currentSpeedKmh} km/h</strong></span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
              <span>{(routeA.carbonSavedKg + routeB.carbonSavedKg).toFixed(1)} kg CO₂ Saved</span>
            </div>
          </div>
        </div>

        {/* DRIVER SLEEPINESS EMERGENCY WARNING BAR (Option when driver feels sleepy) */}
        {(routeA.driver.eyeDetection?.isSleepy || routeB.driver.eyeDetection?.isSleepy) && (
          <div className="rounded-2xl p-4 bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 border-2 border-rose-500 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-bounce shadow-lg shadow-rose-600/50 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-200">
                    CRITICAL DRIVER DROWSINESS &amp; SLEEPINESS ALERT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-rose-300 border border-rose-400 font-bold animate-pulse">
                    {routeA.driver.eyeDetection?.isSleepy ? `Route A (${routeA.driver.name})` : `Route B (${routeB.driver.name})`}
                  </span>
                </div>
                <p className="text-xs text-white/95 mt-0.5 font-medium">
                  {routeA.driver.eyeDetection?.isSleepy ? routeA.driver.eyeDetection?.lastIncidentTime : routeB.driver.eyeDetection?.lastIncidentTime || 'Continuous eye closure detected! Speed governed to 45 km/h for safety.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenEyeDetection(routeA.driver.eyeDetection?.isSleepy ? 'route-a' : 'route-b')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Eye className="w-4 h-4 text-rose-600" />
                <span>Open Eye Detection HUD</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddRestStopWaypoint(routeA.driver.eyeDetection?.isSleepy ? 'route-a' : 'route-b', 'Highway Rest Plaza & Bunks')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                <span>Reroute to Rest Stop</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switching */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Dashboard Fleet Vehicle Selector Option Bar */}
            <DashboardVehicleBar
              routeA={routeA}
              routeB={routeB}
              onOpenVehicleModal={(routeId) => {
                setVehicleModalTargetRouteId(routeId);
                setIsVehicleModalOpen(true);
              }}
              onQuickSelectVehicle={handleQuickSelectVehicle}
              onSwapVehicles={handleSwapVehicles}
              selectedVehicleAId={selectedVehicleAId}
              selectedVehicleBId={selectedVehicleBId}
              onOpenAddCustomRoute={handleOpenAddCustomRoute}
              onOpenEyeDetection={handleOpenEyeDetection}
            />

            {/* Real Interactive Map with Dual Routes visible at all times */}
            <DualRouteMap
              routeA={routeA}
              routeB={routeB}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onSelectWaypoint={(wp, routeId) => {
                console.log('Selected waypoint:', wp, routeId);
              }}
              onAddStopModalOpen={(routeId) => setAddStopModalRouteId(routeId)}
              onOpenVehicleModal={(routeId) => {
                setVehicleModalTargetRouteId(routeId || 'route-a');
                setIsVehicleModalOpen(true);
              }}
              onOpenAddCustomRoute={handleOpenAddCustomRoute}
              onRoadGeometryAligned={handleRoadGeometryAligned}
              recenterTrigger={mapAlignTrigger}
              focusLocation={focusLocation}
              onApplySameRouteEvVsDiesel={handleApplySameRouteEvVsDiesel}
              onOpenEyeDetection={handleOpenEyeDetection}
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
              simulationSpeed={simulationSpeed}
              onChangeSpeed={setSimulationSpeed}
              centerCoords={CITY_PRESETS[selectedCityId]?.center}
              cityName={CITY_PRESETS[selectedCityId]?.name}
              currencySymbol={currencySymbol}
            />

            {/* Same Route Diff: ⚡ EV vs ⛽ Diesel CO2 Difference & All Locations in Set */}
            <RouteLocationsSetCard
              routeA={routeA}
              routeB={routeB}
              currencySymbol={currencySymbol}
              onSelectLocationOnMap={(loc, title) => {
                setFocusLocation({
                  lat: loc.lat,
                  lng: loc.lng,
                  title: title,
                  timestamp: Date.now(),
                });
              }}
              onApplySameRouteEvVsDiesel={handleApplySameRouteEvVsDiesel}
              onOpenAddCustomRoute={handleOpenAddCustomRoute}
              onFitAllLocations={() => setMapAlignTrigger((prev) => prev + 1)}
              onQuickSetStartAndStop={handleQuickSetStartAndStop}
            />

            {/* Dual Route Metrics (Comparing Route A and Route B at all times) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Dual Active Corridors (Side-By-Side Comparison)
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {routeA.waypoints.length + routeB.waypoints.length} total scheduled stops
                </span>
              </div>

              <DualRouteMetrics
                routeA={routeA}
                routeB={routeB}
                activeFilter={activeFilter}
                onSelectRoute={(id) => setActiveFilter(id)}
                onOpenDriverModal={(driver) => setActiveDriverModal(driver)}
                onOpenStopsList={(route) => setActiveTab('planner')}
                onOpenVehicleModal={(routeId) => {
                  setVehicleModalTargetRouteId(routeId);
                  setIsVehicleModalOpen(true);
                }}
                onOpenAddCustomRoute={handleOpenAddCustomRoute}
                onApplySameRouteEvVsDiesel={handleApplySameRouteEvVsDiesel}
                onOpenEyeDetection={handleOpenEyeDetection}
                currencySymbol={currencySymbol}
              />
            </div>

            {/* Quick Customer Money & Outstanding Balance Teaser */}
            <div className="rounded-3xl p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Customer Settlement Center</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {pendingCount > 0
                      ? `${pendingCount} route & toll charges awaiting payment (${currencySymbol}${wallet.totalPendingDue.toLocaleString('en-IN', { minimumFractionDigits: 0 })})`
                      : 'All route dispatches and automated tolls settled.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('money')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>Open Money Hub & Pay All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Money & Customer Payments Section */}
        {activeTab === 'money' && (
          <MoneySection
            wallet={wallet}
            invoices={invoices}
            paymentMethods={paymentMethods}
            onPayAll={handlePayAllInvoices}
            onPaySingle={handlePaySingleInvoice}
            onUpdateWalletSettings={(updated) => setWallet((prev) => ({ ...prev, ...updated }))}
            onAddPaymentMethod={(method) => {
              const newPm: PaymentMethod = {
                ...method,
                id: `pm-${Date.now()}`,
              };
              setPaymentMethods((prev) => [...prev, newPm]);
            }}
            onViewReceipt={(inv) => setSelectedInvoiceForReceipt(inv)}
            currencySymbol={currencySymbol}
          />
        )}

        {/* Route Planner & TSP Optimizer */}
        {activeTab === 'planner' && (
          <RoutePlannerView
            routeA={routeA}
            routeB={routeB}
            onOpenAddStop={(routeId) => setAddStopModalRouteId(routeId)}
            onOptimizeRoutes={handleOptimizeRoutes}
            onOpenAddCustomRoute={handleOpenAddCustomRoute}
          />
        )}

        {/* Fleet & Telematics */}
        {activeTab === 'fleet' && (
          <FleetOverview
            routeA={routeA}
            routeB={routeB}
            onSelectRoute={(id) => {
              setActiveFilter(id);
              setActiveTab('dashboard');
            }}
            onOpenVehicleModal={(routeId) => {
              setVehicleModalTargetRouteId(routeId);
              setIsVehicleModalOpen(true);
            }}
            onOpenEyeDetection={handleOpenEyeDetection}
          />
        )}
      </main>

      {/* Choose Fleet Vehicle Modal */}
      <VehicleSelectorModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        targetRouteId={vehicleModalTargetRouteId}
        onSelectRouteTarget={setVehicleModalTargetRouteId}
        onAssignVehicle={handleAssignVehicle}
        currentVehicleAId={selectedVehicleAId}
        currentVehicleBId={selectedVehicleBId}
        routeAName={routeA.name}
        routeBName={routeB.name}
      />

      {/* Add Custom Route & Align Selected Places Modal */}
      <AddCustomRouteModal
        isOpen={isAddRouteModalOpen}
        onClose={() => setIsAddRouteModalOpen(false)}
        currentRouteA={routeA}
        currentRouteB={routeB}
        onApplyCustomRoute={handleApplyCustomRoute}
      />

      {/* Add Waypoint Modal */}
      {addStopModalRouteId && (
        <RoutePlannerModal
          route={addStopModalRouteId === 'route-a' ? routeA : routeB}
          isOpen={true}
          onClose={() => setAddStopModalRouteId(null)}
          onAddWaypoint={handleAddWaypoint}
        />
      )}

      {/* Driver Communications Drawer */}
      <DriverDispatchDrawer
        driver={activeDriverModal}
        isOpen={Boolean(activeDriverModal)}
        onClose={() => setActiveDriverModal(null)}
        onOpenEyeDetection={() => {
          const targetId = activeDriverModal?.name === routeB.driver.name ? 'route-b' : 'route-a';
          handleOpenEyeDetection(targetId);
        }}
      />

      {/* Driver Eye Detection & Sleepiness Telematics Countermeasures Modal */}
      <DriverEyeDetectionModal
        isOpen={isEyeModalOpen}
        onClose={() => setIsEyeModalOpen(false)}
        route={eyeModalRouteId === 'route-a' ? routeA : routeB}
        onAddRestStopWaypoint={handleAddRestStopWaypoint}
        onUpdateDriverEyeStatus={handleUpdateDriverEyeStatus}
      />

      {/* Printable Receipt Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoiceForReceipt}
        isOpen={Boolean(selectedInvoiceForReceipt)}
        onClose={() => setSelectedInvoiceForReceipt(null)}
      />

      {/* Route Creation Toast Notification */}
      {routeCreationToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-none max-w-md w-full px-4">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-emerald-500/60 shadow-2xl text-white text-xs font-bold backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="leading-snug">{routeCreationToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
