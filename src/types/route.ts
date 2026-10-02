export interface VehicleOption {
  id: string;
  name: string;
  model: string;
  category: 'heavy_truck' | 'medium_truck' | 'electric_van' | 'container_trailer' | 'ev_semi' | 'refrigerated';
  categoryLabel: string;
  manufacturer: string;
  plate: string;
  capacityKg: number;
  capacityFormatted: string;
  cargoType: string;
  fuelType: 'Diesel Euro-VI' | '100% Electric EV' | 'LNG Clean Fuel' | 'CNG Clean Fuel';
  batteryOrFuelPct: number;
  rangeKm: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  efficiencyScore: number;
  carbonEmissionGramsPerKm: number;
  tollClass: string;
  tollMultiplier: number;
  fareMultiplier: number;
  hasReefer: boolean;
  reeferTempCelsius?: number;
  image: string;
  badge: string;
  features: string[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  status: 'completed' | 'current' | 'pending';
  eta: string;
  packagesCount: number;
  recipient: string;
  notes?: string;
}

export interface DriverEyeDetection {
  status: 'alert' | 'mild_fatigue' | 'sleepy_warning' | 'microsleep_alarm';
  isSleepy: boolean;
  eyeClosurePct: number; // PERCLOS % e.g. 8% (normal) to 65% (sleepy)
  blinkRatePerMin: number;
  consecutiveClosedSeconds: number; // Duration eyes remained shut
  yawnCountLastHour: number;
  continuousDriveHours: number;
  drowsinessScore: number; // 0 - 100
  inCabinBuzzerActive: boolean;
  seatVibrationActive: boolean;
  coldAirBlastActive: boolean;
  hazardLightsActive?: boolean;
  speedGovernorActive?: boolean;
  emergencySosActive?: boolean;
  powerNapActive?: boolean;
  powerNapMinutesRemaining?: number;
  sensitivityMode: 'standard' | 'night_shift' | 'strict';
  lastIncidentTime?: string;
  recommendedRestStop?: {
    name: string;
    distanceKm: number;
    etaMins: number;
    type: string;
    hasDriverSleepingBunks: boolean;
  };
}

export interface RouteData {
  id: 'route-a' | 'route-b';
  name: string;
  code: string;
  tag: string;
  color: string;
  accentHex: string;
  secondaryHex: string;
  driver: {
    name: string;
    avatar: string;
    vehicle: string;
    plate: string;
    phone: string;
    rating: number;
    eyeDetection?: DriverEyeDetection;
  };
  origin: {
    name: string;
    address: string;
    location: LatLng;
  };
  destination: {
    name: string;
    address: string;
    location: LatLng;
  };
  waypoints: Waypoint[];
  pathCoordinates: LatLng[];
  currentVehiclePos: LatLng;
  currentProgressPct: number;
  distanceKm: number;
  durationMins: number;
  eta: string;
  fareAmount: number;
  tollAmount: number;
  status: 'in_transit' | 'scheduled' | 'delayed' | 'completed';
  efficiencyScore: number;
  carbonSavedKg: number;
  carbonEmittedKg?: number;
  propulsionType?: 'ev' | 'diesel' | 'lng' | 'cng';
  energyKwhOrLiters?: string;
  fuelCostEst?: number;
  fuelLevelPct: number;
  currentSpeedKmh: number;
  temperatureCelsius?: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  routeId?: 'route-a' | 'route-b';
  routeTitle: string;
  description: string;
  category: 'freight' | 'toll' | 'fuel_surcharge' | 'driver_tip' | 'warehousing' | 'platform_fee';
  amount: number;
  dueDate: string;
  issuedDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'processing';
  paymentMethod?: string;
  transactionHash?: string;
}

export interface CustomerWallet {
  availableBalance: number;
  totalPendingDue: number;
  totalPaidThisMonth: number;
  creditLimit: number;
  autoPayEnabled: boolean;
  autoPayThreshold: number;
  autoPayReloadAmount: number;
  preferredPaymentMethodId: string;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'crypto';
  name: string;
  details: string;
  iconName: string;
  isDefault: boolean;
  expiry?: string;
}
