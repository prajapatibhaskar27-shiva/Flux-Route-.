import { RouteData } from '../types/route';

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  flag: string;
  center: { lat: number; lng: number };
  zoom: number;
  routes: {
    routeA: RouteData;
    routeB: RouteData;
  };
}

export const CITY_PRESETS: Record<string, CityPreset> = {
  // 1. DELHI NCR TO AGRA: Two distinct paths from SAME START to SAME FINISH
  india_delhi: {
    id: 'india_delhi',
    name: 'Delhi NCR — Agra (Yamuna Expressway vs NH-19 Bypass)',
    country: 'India',
    flag: '🇮🇳',
    center: { lat: 27.8500, lng: 77.5500 },
    zoom: 9,
    routes: {
      routeA: {
        id: 'route-a',
        name: 'Yamuna Expressway Fast Tollway (Delhi to Agra)',
        code: 'FX-DEL-A1',
        tag: 'Primary Expressway Corridor',
        color: 'blue',
        accentHex: '#3B82F6',
        secondaryHex: '#1D4ED8',
        driver: {
          name: 'Vikram Singh',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          vehicle: 'BharatBenz 2823R Heavy Cargo Truck',
          plate: 'DL-1GC-4482',
          phone: '+91 98112 34567',
          rating: 4.96,
          eyeDetection: {
            status: 'alert',
            isSleepy: false,
            eyeClosurePct: 8,
            blinkRatePerMin: 16,
            consecutiveClosedSeconds: 0.2,
            yawnCountLastHour: 1,
            continuousDriveHours: 3.2,
            drowsinessScore: 15,
            inCabinBuzzerActive: false,
            seatVibrationActive: false,
            coldAirBlastActive: false,
            hazardLightsActive: false,
            speedGovernorActive: false,
            emergencySosActive: false,
            powerNapActive: false,
            sensitivityMode: 'night_shift',
            recommendedRestStop: {
              name: 'Yamuna Expressway Mile 65 Driver Oasis & Rest Plaza',
              distanceKm: 4.8,
              etaMins: 6,
              type: 'Commercial Driver Rest Oasis & 150kW EV Fast Chargers',
              hasDriverSleepingBunks: true,
            },
          },
        },
        origin: {
          name: 'Delhi NCR Central Logistics Park (Okhla)',
          address: 'Okhla Industrial Area Phase-III, New Delhi 110020',
          location: { lat: 28.5200, lng: 77.2900 },
        },
        destination: {
          name: 'Agra Taj Inland Container Depot (ICD)',
          address: 'NH-19 Transport Nagar, Agra, UP 282007',
          location: { lat: 27.1767, lng: 78.0081 },
        },
        waypoints: [
          {
            id: 'wp-ind-a1',
            name: 'Noida Expressway Sector 128 Tech Annex',
            address: 'Jaypee Wish Town, Noida, UP 201304',
            location: { lat: 28.5150, lng: 77.3750 },
            status: 'completed',
            eta: '09:30 AM',
            packagesCount: 18,
            recipient: 'Samsung India R&D Logistics Dock',
            notes: 'Verified electronic gate pass #A-882',
          },
          {
            id: 'wp-ind-a2',
            name: 'Pari Chowk Multi-Modal Freight Hub',
            address: 'Pari Chowk Interchange, Greater Noida, UP 201310',
            location: { lat: 28.4744, lng: 77.5040 },
            status: 'current',
            eta: '10:45 AM',
            packagesCount: 24,
            recipient: 'Wipro Technologies Staging Area',
            notes: 'Cold container temperature monitor active',
          },
          {
            id: 'wp-ind-a3',
            name: 'Jewar International Airport Cargo Hub',
            address: 'Yamuna Expressway Mile 40, Jewar, UP 203135',
            location: { lat: 28.1800, lng: 77.6200 },
            status: 'pending',
            eta: '12:15 PM',
            packagesCount: 16,
            recipient: 'Noida International Airport Air Cargo Transit',
            notes: 'FASTag automated electronic toll lane',
          },
        ],
        // DENSE, HIGHWAY-SNAPPED CURVATURE COORDINATES: Okhla -> Noida Expressway -> Pari Chowk -> Yamuna Expressway 6-Lane Tollway -> Agra Inner Ring Road -> Taj ICD
        pathCoordinates: [
          { lat: 28.5200, lng: 77.2900 }, // Start: Okhla Industrial Area
          { lat: 28.5280, lng: 77.3010 }, // Modi Flour Mills / Mathura Rd exit
          { lat: 28.5385, lng: 77.3115 }, // Kalindi Kunj Road approach
          { lat: 28.5432, lng: 77.3180 }, // Kalindi Kunj Bridge over Yamuna River
          { lat: 28.5450, lng: 77.3300 }, // Amity University turn
          { lat: 28.5420, lng: 77.3380 }, // Entry to Noida-Greater Noida Expressway
          { lat: 28.5360, lng: 77.3450 }, // Sector 94 / 124 flyover
          { lat: 28.5300, lng: 77.3520 }, // Sector 98 HCL Technologies curve
          { lat: 28.5220, lng: 77.3630 }, // Sector 126
          { lat: 28.5150, lng: 77.3750 }, // Waypoint A1: Jaypee Wish Town / Sector 128
          { lat: 28.5080, lng: 77.3850 }, // Sector 132 expressway curve
          { lat: 28.4980, lng: 77.4020 }, // Advant Navis / Sector 137
          { lat: 28.4890, lng: 77.4180 }, // Sector 142 Metro / Expressway curve
          { lat: 28.4790, lng: 77.4360 }, // Sector 148 Greater Noida entrance
          { lat: 28.4720, lng: 77.4600 }, // Knowledge Park II
          { lat: 28.4690, lng: 77.4820 }, // Alpha 1 Commercial Belt
          { lat: 28.4744, lng: 77.5040 }, // Waypoint A2: Pari Chowk Interchange
          { lat: 28.4680, lng: 77.5140 }, // Yamuna Expressway Zero Point connector
          { lat: 28.4550, lng: 77.5210 }, // Zero Point Toll Interchange
          { lat: 28.4200, lng: 77.5320 }, // Formula 1 Buddh International Circuit
          { lat: 28.3850, lng: 77.5410 }, // Galgotias University / Dankaur Cut
          { lat: 28.3450, lng: 77.5550 }, // Dankaur Toll Plaza
          { lat: 28.2950, lng: 77.5750 }, // Rabupura Interchange
          { lat: 28.2400, lng: 77.5950 }, // Jewar Airport North Access Road
          { lat: 28.1800, lng: 77.6200 }, // Waypoint A3: Jewar International Airport Cargo
          { lat: 28.1350, lng: 77.6320 }, // Jewar Toll Plaza (Mile 38)
          { lat: 28.0800, lng: 77.6450 }, // Tappal Interchange (Aligarh link)
          { lat: 28.0100, lng: 77.6580 }, // Yamuna Expressway Mile 60
          { lat: 27.9500, lng: 77.6720 }, // Jattari Bridge overpass
          { lat: 27.8800, lng: 77.6880 }, // Bajna Interchange
          { lat: 27.8100, lng: 77.7120 }, // Nohjhil / Surir Toll Plaza
          { lat: 27.7400, lng: 77.7340 }, // Vrindavan East Cut (Mile 90)
          { lat: 27.6800, lng: 77.7600 }, // Raya / Mathura East Interchange
          { lat: 27.6100, lng: 77.7920 }, // Yamuna Expressway Mile 115
          { lat: 27.5350, lng: 77.8300 }, // Baldeo Interchange
          { lat: 27.4600, lng: 77.8650 }, // Sadabad Cut
          { lat: 27.3850, lng: 77.9050 }, // Khandauli Toll Plaza (Agra Gateway)
          { lat: 27.3200, lng: 77.9420 }, // Yamuna Expressway Kilometer 160
          { lat: 27.2750, lng: 77.9650 }, // Kuberpur Expressway Terminal Interchange
          { lat: 27.2400, lng: 77.9820 }, // Agra Inner Ring Road connecting flyover
          { lat: 27.2100, lng: 77.9940 }, // Fatehabad Road Interchange
          { lat: 27.1920, lng: 78.0030 }, // Shamsabad Road Overpass
          { lat: 27.1767, lng: 78.0081 }, // Finish: Agra Taj Inland Container Depot
        ],
        currentVehiclePos: { lat: 28.4744, lng: 77.5040 },
        currentProgressPct: 45,
        distanceKm: 204.6,
        durationMins: 195,
        eta: '1 hr 45 min remaining',
        fareAmount: 12450.00,
        tollAmount: 840.00,
        status: 'in_transit',
        efficiencyScore: 98.2,
        carbonSavedKg: 46.5,
        fuelLevelPct: 82,
        currentSpeedKmh: 82,
        temperatureCelsius: 16.4,
      },
      routeB: {
        id: 'route-b',
        name: 'NH-19 National Highway & Mathura Heritage Bypass',
        code: 'FX-DEL-B2',
        tag: 'Alternative Bypass Corridor',
        color: 'emerald',
        accentHex: '#10B981',
        secondaryHex: '#047857',
        driver: {
          name: 'Rajesh Sharma',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          vehicle: 'Tata Prima 3530.K LNG Heavy Fleet',
          plate: 'HR-26DK-9102',
          phone: '+91 99580 88992',
          rating: 4.92,
          eyeDetection: {
            status: 'alert',
            isSleepy: false,
            eyeClosurePct: 11,
            blinkRatePerMin: 18,
            consecutiveClosedSeconds: 0.3,
            yawnCountLastHour: 0,
            continuousDriveHours: 2.7,
            drowsinessScore: 14,
            inCabinBuzzerActive: false,
            seatVibrationActive: false,
            coldAirBlastActive: false,
            hazardLightsActive: false,
            speedGovernorActive: false,
            emergencySosActive: false,
            powerNapActive: false,
            sensitivityMode: 'standard',
            recommendedRestStop: {
              name: 'NH-19 Mathura Freight Truckers Rest Bay & Dhaba Oasis',
              distanceKm: 6.2,
              etaMins: 8,
              type: 'Highway Logistics Rest Stop & Sleeper Cab Bunks',
              hasDriverSleepingBunks: true,
            },
          },
        },
        origin: {
          name: 'Delhi NCR Central Logistics Park (Okhla)',
          address: 'Okhla Industrial Area Phase-III, New Delhi 110020',
          location: { lat: 28.5200, lng: 77.2900 },
        },
        destination: {
          name: 'Agra Taj Inland Container Depot (ICD)',
          address: 'NH-19 Transport Nagar, Agra, UP 282007',
          location: { lat: 27.1767, lng: 78.0081 },
        },
        waypoints: [
          {
            id: 'wp-ind-b1',
            name: 'Faridabad Sector 6 Heavy Industrial Cluster',
            address: 'Mathura Rd, Sector 6, Faridabad, Haryana 121006',
            location: { lat: 28.3850, lng: 77.3150 },
            status: 'completed',
            eta: '09:20 AM',
            packagesCount: 22,
            recipient: 'JCB India Heavy Machinery Depot',
            notes: 'Heavy vehicle service ramp 3',
          },
          {
            id: 'wp-ind-b2',
            name: 'Palwal NH-19 Multi-Modal Freight Interchange',
            address: 'NH-19 Bypass, Palwal, Haryana 121102',
            location: { lat: 28.1450, lng: 77.3320 },
            status: 'current',
            eta: '10:35 AM',
            packagesCount: 15,
            recipient: 'Continental Automotive Staging Yard',
            notes: 'Palwal KMP expressway bypass corridor',
          },
          {
            id: 'wp-ind-b3',
            name: 'Kosi Kalan Agro Logistics Depot',
            address: 'NH-19 Highway, Kosi Kalan, UP 281403',
            location: { lat: 27.7950, lng: 77.4350 },
            status: 'pending',
            eta: '12:00 PM',
            packagesCount: 28,
            recipient: 'PepsiCo India Frito-Lay Plant Staging',
            notes: 'Temperature-monitored refrigerated freight',
          },
        ],
        // DENSE, HIGHWAY-SNAPPED CURVATURE COORDINATES: Okhla -> Mathura Rd NH-19 -> Badarpur -> Faridabad -> Ballabhgarh -> Palwal -> Hodal -> Kosi Kalan -> Chhata -> Mathura Bypass -> Farah -> Sikandra -> Agra ICD
        pathCoordinates: [
          { lat: 28.5200, lng: 77.2900 }, // Start: Okhla Industrial Area
          { lat: 28.5120, lng: 77.2950 }, // Mohan Cooperative Industrial Estate
          { lat: 28.5040, lng: 77.3000 }, // Badarpur Metro Station / NH-19 Flyover
          { lat: 28.4950, lng: 77.3020 }, // Delhi-Haryana Badarpur Border Toll
          { lat: 28.4780, lng: 77.3050 }, // Sarai Khawaja / NH-19
          { lat: 28.4550, lng: 77.3080 }, // NHPC Chowk Flyover
          { lat: 28.4350, lng: 77.3110 }, // Old Faridabad / Badkhal Mor
          { lat: 28.4100, lng: 77.3130 }, // Neelam Chowk Flyover
          { lat: 28.3850, lng: 77.3150 }, // Waypoint B1: Faridabad Sector 6 JCB Hub
          { lat: 28.3580, lng: 77.3190 }, // Escorts Mujesar Metro
          { lat: 28.3340, lng: 77.3230 }, // Ballabhgarh Bus Stand / Flyover
          { lat: 28.3050, lng: 77.3250 }, // Ballabhgarh Toll Plaza
          { lat: 28.2700, lng: 77.3270 }, // Sikri Industrial Hub
          { lat: 28.2250, lng: 77.3290 }, // Prithla Industrial Area
          { lat: 28.1850, lng: 77.3310 }, // Baghola / Palwal North Entry
          { lat: 28.1450, lng: 77.3320 }, // Waypoint B2: Palwal NH-19 / KMP Interchange
          { lat: 28.1050, lng: 77.3370 }, // Palwal Elevated Flyover
          { lat: 28.0550, lng: 77.3450 }, // Bamnikhera Flyover
          { lat: 27.9950, lng: 77.3540 }, // Rundhi / Mundkati
          { lat: 27.9400, lng: 77.3640 }, // Hodal Haryana Grain Market
          { lat: 27.8900, lng: 77.3780 }, // Haryana-UP State Border (Karman Toll)
          { lat: 27.8450, lng: 77.4020 }, // Kotwan Industrial Area
          { lat: 27.7950, lng: 77.4350 }, // Waypoint B3: Kosi Kalan Agro Depot
          { lat: 27.7550, lng: 77.4700 }, // Kosi Kalan Bypass
          { lat: 27.7200, lng: 77.5050 }, // Chhata Highway Flyover
          { lat: 27.6750, lng: 77.5450 }, // Akbarpur / Semri
          { lat: 27.6350, lng: 77.5850 }, // Chaumuhan / GLA University
          { lat: 27.5950, lng: 77.6250 }, // Ral / Jait Flyover
          { lat: 27.5500, lng: 77.6650 }, // Vrindavan NH-19 Cut
          { lat: 27.5050, lng: 77.6950 }, // Mathura Bypass Flyover
          { lat: 27.4600, lng: 77.7180 }, // Mathura Refinery Flyover
          { lat: 27.4100, lng: 77.7420 }, // Bad Flyover / NH-19
          { lat: 27.3550, lng: 77.7800 }, // Farah Toll Plaza
          { lat: 27.2950, lng: 77.8300 }, // Keetham Lake Highway Causeway
          { lat: 27.2450, lng: 77.8750 }, // Runkata / Agra Entry Gate
          { lat: 27.2150, lng: 77.9350 }, // Sikandra (Akbar's Tomb Highway stretch)
          { lat: 27.1950, lng: 77.9700 }, // Guru Ka Taal / Transport Nagar flyover
          { lat: 27.1850, lng: 77.9950 }, // Kamla Nagar Highway Underpass
          { lat: 27.1767, lng: 78.0081 }, // Finish: Agra Taj Inland Container Depot
        ],
        currentVehiclePos: { lat: 28.1450, lng: 77.3320 },
        currentProgressPct: 38,
        distanceKm: 218.4,
        durationMins: 245,
        eta: '2 hr 35 min remaining',
        fareAmount: 11200.00,
        tollAmount: 380.00,
        status: 'in_transit',
        efficiencyScore: 94.8,
        carbonSavedKg: 28.2,
        fuelLevelPct: 76,
        currentSpeedKmh: 65,
        temperatureCelsius: 18.2,
      },
    },
  },

  // 2. MUMBAI TO PUNE: Two distinct paths from SAME START to SAME FINISH
  india_mumbai: {
    id: 'india_mumbai',
    name: 'Mumbai — Pune (Expressway vs Old NH-48 Ghat)',
    country: 'India',
    flag: '🇮🇳',
    center: { lat: 18.7800, lng: 73.3500 },
    zoom: 10,
    routes: {
      routeA: {
        id: 'route-a',
        name: 'Mumbai-Pune Expressway (Tollway Tunnel Corridor)',
        code: 'FX-MUM-A1',
        tag: 'High-Speed Expressway',
        color: 'blue',
        accentHex: '#3B82F6',
        secondaryHex: '#1D4ED8',
        driver: {
          name: 'Sunil Jadhav',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          vehicle: 'Volvo FM 420 6x4 Heavy Puller',
          plate: 'MH-46BF-3321',
          phone: '+91 98201 12345',
          rating: 4.98,
        },
        origin: {
          name: 'JNPT Nhava Sheva International Port Terminal',
          address: 'Nhava Sheva Port, Navi Mumbai, Maharashtra 400707',
          location: { lat: 18.9499, lng: 72.9511 },
        },
        destination: {
          name: 'Hinjawadi IT Park Logistics Hub (Pune)',
          address: 'Phase-2 Tech Zone, Hinjawadi, Pune, Maharashtra 411057',
          location: { lat: 18.5913, lng: 73.7389 },
        },
        waypoints: [
          {
            id: 'wp-mum-a1',
            name: 'Panvel Multi-Modal Logistics Yard',
            address: 'Old Mumbai-Pune Highway, Panvel 410206',
            location: { lat: 18.9902, lng: 73.1200 },
            status: 'completed',
            eta: '08:45 AM',
            packagesCount: 22,
            recipient: 'Panvel Dry Port Depot',
          },
          {
            id: 'wp-mum-a2',
            name: 'Khalapur Toll Plaza Staging Hub',
            address: 'Mumbai-Pune Expressway Toll Mile 34, Khalapur 410203',
            location: { lat: 18.8250, lng: 73.2850 },
            status: 'current',
            eta: '10:00 AM',
            packagesCount: 15,
            recipient: 'Expressway Quick Cargo Annex',
          },
          {
            id: 'wp-mum-a3',
            name: 'Talegaon Industrial Auto Corridor',
            address: 'MIDC Phase-II, Talegaon Dabhade 410507',
            location: { lat: 18.7200, lng: 73.6800 },
            status: 'pending',
            eta: '11:30 AM',
            packagesCount: 30,
            recipient: 'General Motors / Tata Auto Ancillary',
          },
        ],
        // DENSE HIGHWAY-SNAPPED COORDINATES: JNPT -> Uran Rd -> Kalamboli Flyover -> Panvel Expressway -> Khalapur -> Bhatan & Madap Tunnels -> Khandala Viaduct -> Lonavala Bypass -> Kamshet Tunnel -> Talegaon Toll -> Ravet -> Hinjawadi
        pathCoordinates: [
          { lat: 18.9499, lng: 72.9511 }, // Start: JNPT Nhava Sheva
          { lat: 18.9580, lng: 72.9820 }, // Dronagiri / Uran Bypass
          { lat: 18.9720, lng: 73.0250 }, // Jasai / Gavan Phata
          { lat: 18.9850, lng: 73.0720 }, // Ulwe River Bridge
          { lat: 18.9902, lng: 73.1200 }, // Waypoint A1: Panvel Multi-Modal Yard
          { lat: 18.9850, lng: 73.1500 }, // Kalamboli Junction / Expressway Start
          { lat: 18.9550, lng: 73.1780 }, // Kon / Apta Cut
          { lat: 18.9150, lng: 73.2100 }, // Rasayani Expressway Flyover
          { lat: 18.8750, lng: 73.2450 }, // Chowk Expressway Viaduct
          { lat: 18.8250, lng: 73.2850 }, // Waypoint A2: Khalapur Toll Plaza
          { lat: 18.7950, lng: 73.3250 }, // Madap Tunnel
          { lat: 18.7750, lng: 73.3600 }, // Bhatan Tunnel & Khandala Viaduct
          { lat: 18.7550, lng: 73.3950 }, // Adoshi Tunnel
          { lat: 18.7420, lng: 73.4350 }, // Lonavala Expressway Bypass (Khandala Lake)
          { lat: 18.7350, lng: 73.4900 }, // Valvan Expressway Curve
          { lat: 18.7280, lng: 73.5500 }, // Ozarde Food Mall
          { lat: 18.7240, lng: 73.6100 }, // Kamshet Tunnel
          { lat: 18.7200, lng: 73.6800 }, // Waypoint A3: Talegaon MIDC Interchange
          { lat: 18.7050, lng: 73.7050 }, // Urse Toll Plaza
          { lat: 18.6850, lng: 73.7180 }, // Somatane Phata Expressway exit
          { lat: 18.6550, lng: 73.7280 }, // Ravet Kiwale Terminal Flyover
          { lat: 18.6250, lng: 73.7340 }, // Punawale Highway Cut
          { lat: 18.6050, lng: 73.7370 }, // Bhumkar Chowk Flyover
          { lat: 18.5913, lng: 73.7389 }, // Finish: Hinjawadi IT Park Phase 2
        ],
        currentVehiclePos: { lat: 18.8250, lng: 73.2850 },
        currentProgressPct: 55,
        distanceKm: 128.4,
        durationMins: 140,
        eta: '1 hr 10 min remaining',
        fareAmount: 9800.00,
        tollAmount: 480.00,
        status: 'in_transit',
        efficiencyScore: 97.4,
        carbonSavedKg: 32.1,
        fuelLevelPct: 75,
        currentSpeedKmh: 68,
      },
      routeB: {
        id: 'route-b',
        name: 'Old NH-48 Khopoli-Khandala Scenic Ghat Road',
        code: 'FX-MUM-B2',
        tag: 'Ghat Alternate Corridor',
        color: 'emerald',
        accentHex: '#10B981',
        secondaryHex: '#047857',
        driver: {
          name: 'Pooja Patil',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          vehicle: 'Tata Prima 2830 Heavy Hauler',
          plate: 'MH-02ER-7719',
          phone: '+91 98205 66789',
          rating: 4.95,
        },
        origin: {
          name: 'JNPT Nhava Sheva International Port Terminal',
          address: 'Nhava Sheva Port, Navi Mumbai, Maharashtra 400707',
          location: { lat: 18.9499, lng: 72.9511 },
        },
        destination: {
          name: 'Hinjawadi IT Park Logistics Hub (Pune)',
          address: 'Phase-2 Tech Zone, Hinjawadi, Pune, Maharashtra 411057',
          location: { lat: 18.5913, lng: 73.7389 },
        },
        waypoints: [
          {
            id: 'wp-mum-b1',
            name: 'Chowk Rural Freight Hub',
            address: 'Old Highway Junction, Chowk, MH 410206',
            location: { lat: 18.8950, lng: 73.2450 },
            status: 'completed',
            eta: '09:00 AM',
            packagesCount: 14,
            recipient: 'Chowk Regional Storage',
          },
          {
            id: 'wp-mum-b2',
            name: 'Khopoli Industrial MIDC & Ghat Depot',
            address: 'Khopoli Pen Rd, Khopoli 410203',
            location: { lat: 18.7910, lng: 73.3420 },
            status: 'current',
            eta: '10:15 AM',
            packagesCount: 18,
            recipient: 'Tata Steel Tubes Division',
          },
          {
            id: 'wp-mum-b3',
            name: 'Lonavala-Khandala Hill Station Depot',
            address: 'Old Khandala Ghat Rd, Lonavala 410401',
            location: { lat: 18.7520, lng: 73.4150 },
            status: 'pending',
            eta: '11:45 AM',
            packagesCount: 12,
            recipient: 'Lonavala Wholesale Distribution',
          },
        ],
        // DENSE ROAD-SNAPPED COORDINATES: JNPT -> Panvel -> Palaspe Phata -> Chowk -> Khopoli -> Amrutanjan Point Ghat curves -> Khandala Town -> Lonavala Market -> Karla -> Kamshet Town -> Vadgaon -> Talegaon -> Nigdi -> Wakad -> Hinjawadi
        pathCoordinates: [
          { lat: 18.9499, lng: 72.9511 }, // Start: JNPT Nhava Sheva
          { lat: 18.9620, lng: 73.0100 }, // Dronagiri
          { lat: 18.9800, lng: 73.0650 }, // Gavan Phata
          { lat: 18.9950, lng: 73.1120 }, // Panvel City Bypass
          { lat: 18.9680, lng: 73.1420 }, // Palaspe Phata / Old NH-48
          { lat: 18.9350, lng: 73.1950 }, // Shedung Junction
          { lat: 18.8950, lng: 73.2450 }, // Waypoint B1: Chowk Rural Freight Hub
          { lat: 18.8500, lng: 73.2950 }, // Karjat Phata / Khalapur Old Rd
          { lat: 18.8150, lng: 73.3250 }, // Lowjee Station / Khopoli North
          { lat: 18.7910, lng: 73.3420 }, // Waypoint B2: Khopoli Industrial MIDC
          { lat: 18.7820, lng: 73.3550 }, // Khopoli Ghat Base
          { lat: 18.7750, lng: 73.3700 }, // Amrutanjan Point Hairpin Curve 1
          { lat: 18.7650, lng: 73.3850 }, // Khandala Ghat Hairpin Curve 2
          { lat: 18.7580, lng: 73.4020 }, // Duke's Nose Viewpoint Curve
          { lat: 18.7520, lng: 73.4150 }, // Waypoint B3: Lonavala-Khandala Hill Station Depot
          { lat: 18.7480, lng: 73.4450 }, // Lonavala Main Bazaar
          { lat: 18.7550, lng: 73.4800 }, // Karla Caves Phata
          { lat: 18.7450, lng: 73.5350 }, // Kamshet Town Market
          { lat: 18.7320, lng: 73.5900 }, // Kanhe Phata
          { lat: 18.7200, lng: 73.6450 }, // Vadgaon Maval
          { lat: 18.7100, lng: 73.6950 }, // Talegaon Dabhade Town
          { lat: 18.6850, lng: 73.7220 }, // Dehu Road Cantonment
          { lat: 18.6550, lng: 73.7450 }, // Nigdi Pradhikaran
          { lat: 18.6300, lng: 73.7550 }, // Chinchwad / Dange Chowk
          { lat: 18.6050, lng: 73.7520 }, // Wakad Old Bridge
          { lat: 18.5913, lng: 73.7389 }, // Finish: Hinjawadi IT Park Phase 2
        ],
        currentVehiclePos: { lat: 18.7910, lng: 73.3420 },
        currentProgressPct: 42,
        distanceKm: 139.8,
        durationMins: 175,
        eta: '1 hr 35 min remaining',
        fareAmount: 8900.00,
        tollAmount: 180.00,
        status: 'in_transit',
        efficiencyScore: 99.2,
        carbonSavedKg: 28.5,
        fuelLevelPct: 84,
        currentSpeedKmh: 45,
      },
    },
  },

  // 3. SAN FRANCISCO TO SILICON VALLEY: Two distinct paths from SAME START to SAME FINISH
  sf: {
    id: 'sf',
    name: 'San Francisco — Silicon Valley (US-101 vs I-280)',
    country: 'USA',
    flag: '🇺🇸',
    center: { lat: 37.5800, lng: -122.2500 },
    zoom: 10,
    routes: {
      routeA: {
        id: 'route-a',
        name: 'US-101 Bayshore Freeway Corridor',
        code: 'FX-SF-101A',
        tag: 'Bayshore Commercial Highway',
        color: 'blue',
        accentHex: '#3B82F6',
        secondaryHex: '#1D4ED8',
        driver: {
          name: 'Alex Vance',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          vehicle: 'Freightliner eCascadia EV Truck',
          plate: '7XYZ890',
          phone: '+1 (415) 890-3411',
          rating: 4.95,
        },
        origin: {
          name: 'San Francisco Port Intermodal Depot (Embarcadero)',
          address: 'Pier 27 The Embarcadero, San Francisco, CA 94111',
          location: { lat: 37.8015, lng: -122.4010 },
        },
        destination: {
          name: 'Silicon Valley Tech Cargo Terminal (San Jose)',
          address: '1661 Airport Blvd, San Jose, CA 95110',
          location: { lat: 37.3639, lng: -121.9289 },
        },
        waypoints: [
          {
            id: 'wp-sf-a1',
            name: 'SFO Air Cargo Freight Terminal',
            address: 'North Access Rd, San Francisco, CA 94128',
            location: { lat: 37.6213, lng: -122.3790 },
            status: 'completed',
            eta: '10:15 AM',
            packagesCount: 14,
            recipient: 'United Airlines Cargo Sort',
            notes: 'Gate Code #4920, dock 3',
          },
          {
            id: 'wp-sf-a2',
            name: 'San Mateo Bridge Logistics Gateway',
            address: '3000 Bridgepointe Pkwy, San Mateo, CA 94404',
            location: { lat: 37.5580, lng: -122.2850 },
            status: 'current',
            eta: '10:50 AM',
            packagesCount: 18,
            recipient: 'East Bay Connector Hub',
            notes: 'Cold storage verified at 4°C',
          },
          {
            id: 'wp-sf-a3',
            name: 'Palo Alto Stanford Research Logistics',
            address: '1050 Page Mill Rd, Palo Alto, CA 94304',
            location: { lat: 37.4220, lng: -122.1450 },
            status: 'pending',
            eta: '11:30 AM',
            packagesCount: 9,
            recipient: 'Stanford Quantum Research Lab',
            notes: 'Sensitive optical hardware containers',
          },
        ],
        // DENSE ROAD-SNAPPED COORDINATES: US-101 Bayshore Freeway curves
        pathCoordinates: [
          { lat: 37.8015, lng: -122.4010 }, // Start: SF Pier 27 Embarcadero
          { lat: 37.7850, lng: -122.3920 }, // Bay Bridge approach
          { lat: 37.7680, lng: -122.4040 }, // I-80 / US-101 S interchange
          { lat: 37.7450, lng: -122.4060 }, // Bernal Heights US-101 curve
          { lat: 37.7150, lng: -122.4020 }, // Silver Terrace / 101 South
          { lat: 37.6850, lng: -122.3980 }, // Brisbane Bayshore curve
          { lat: 37.6550, lng: -122.4020 }, // South San Francisco Grand Ave
          { lat: 37.6213, lng: -122.3790 }, // Waypoint A1: SFO Air Cargo Terminal
          { lat: 37.5950, lng: -122.3550 }, // Burlingame Broadway curve
          { lat: 37.5750, lng: -122.3250 }, // San Mateo 3rd Ave
          { lat: 37.5580, lng: -122.2850 }, // Waypoint A2: San Mateo Bridge Gateway
          { lat: 37.5250, lng: -122.2600 }, // Belmont Ralston Ave
          { lat: 37.5020, lng: -122.2400 }, // San Carlos Holly St
          { lat: 37.4780, lng: -122.2100 }, // Redwood City Whipple Ave
          { lat: 37.4520, lng: -122.1750 }, // Menlo Park Willow Rd
          { lat: 37.4220, lng: -122.1450 }, // Waypoint A3: Palo Alto Page Mill Rd
          { lat: 37.4050, lng: -122.0950 }, // Mountain View Shoreline Amphitheatre
          { lat: 37.3880, lng: -122.0450 }, // Sunnyvale Mathilda Ave
          { lat: 37.3750, lng: -121.9850 }, // Santa Clara Great America Pkwy
          { lat: 37.3639, lng: -121.9289 }, // Finish: San Jose Airport Cargo
        ],
        currentVehiclePos: { lat: 37.5580, lng: -122.2850 },
        currentProgressPct: 50,
        distanceKm: 74.2,
        durationMins: 58,
        eta: '28 min remaining',
        fareAmount: 485.00,
        tollAmount: 7.50,
        status: 'in_transit',
        efficiencyScore: 98.7,
        carbonSavedKg: 18.4,
        fuelLevelPct: 84,
        currentSpeedKmh: 75,
        temperatureCelsius: 19.5,
      },
      routeB: {
        id: 'route-b',
        name: 'I-280 Junipero Serra Foothill Scenic Express',
        code: 'FX-SF-280B',
        tag: 'Scenic Foothills Alternate',
        color: 'emerald',
        accentHex: '#10B981',
        secondaryHex: '#047857',
        driver: {
          name: 'Darius Chen',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          vehicle: 'Rivian Commercial Van 700',
          plate: 'CA-9923K',
          phone: '+1 (415) 349-9922',
          rating: 4.88,
        },
        origin: {
          name: 'San Francisco Port Intermodal Depot (Embarcadero)',
          address: 'Pier 27 The Embarcadero, San Francisco, CA 94111',
          location: { lat: 37.8015, lng: -122.4010 },
        },
        destination: {
          name: 'Silicon Valley Tech Cargo Terminal (San Jose)',
          address: '1661 Airport Blvd, San Jose, CA 95110',
          location: { lat: 37.3639, lng: -121.9289 },
        },
        waypoints: [
          {
            id: 'wp-sf-b1',
            name: 'Daly City Westlake Hub',
            address: 'John Daly Blvd, Daly City, CA 94015',
            location: { lat: 37.7050, lng: -122.4750 },
            status: 'completed',
            eta: '10:10 AM',
            packagesCount: 11,
            recipient: 'Peninsula Commercial Goods',
            notes: 'Smooth transit via 19th Ave exit',
          },
          {
            id: 'wp-sf-b2',
            name: 'Woodside Crystal Springs Scenic Annex',
            address: '2995 Woodside Rd, Woodside, CA 94062',
            location: { lat: 37.4280, lng: -122.2580 },
            status: 'current',
            eta: '10:55 AM',
            packagesCount: 8,
            recipient: 'Crystal Springs Regional Facility',
            notes: 'Scenic foothill highway zero congestion',
          },
          {
            id: 'wp-sf-b3',
            name: 'Cupertino Apple Park Corporate Depot',
            address: '1 Apple Park Way, Cupertino, CA 95014',
            location: { lat: 37.3346, lng: -122.0090 },
            status: 'pending',
            eta: '11:40 AM',
            packagesCount: 16,
            recipient: 'Apple Worldwide Operations',
            notes: 'Underground receiving bay entrance',
          },
        ],
        // DENSE ROAD-SNAPPED COORDINATES: I-280 Junipero Serra Freeway scenic foothill curves
        pathCoordinates: [
          { lat: 37.8015, lng: -122.4010 }, // Start: SF Pier 27
          { lat: 37.7780, lng: -122.4200 }, // Octavia Blvd
          { lat: 37.7450, lng: -122.4400 }, // Portola Dr / Twin Peaks curve
          { lat: 37.7250, lng: -122.4600 }, // Ocean Ave I-280 entry
          { lat: 37.7050, lng: -122.4750 }, // Waypoint B1: Daly City Westlake Hub
          { lat: 37.6650, lng: -122.4600 }, // Serramonte I-280 S
          { lat: 37.6250, lng: -122.4400 }, // San Bruno I-380 interchange
          { lat: 37.5850, lng: -122.3850 }, // Hillsborough / Crystal Springs reservoir curve
          { lat: 37.5450, lng: -122.3350 }, // San Mateo Hwy 92 interchange
          { lat: 37.4950, lng: -122.2950 }, // Emerald Hills
          { lat: 37.4280, lng: -122.2580 }, // Waypoint B2: Woodside Crystal Springs
          { lat: 37.3850, lng: -122.1850 }, // Stanford Linear Accelerator / Alpine Rd
          { lat: 37.3600, lng: -122.1150 }, // Los Altos Hills Foothill Expressway
          { lat: 37.3346, lng: -122.0090 }, // Waypoint B3: Cupertino Apple Park
          { lat: 37.3300, lng: -121.9800 }, // I-280 at Lawrence Expressway
          { lat: 37.3450, lng: -121.9450 }, // San Jose Diridon curve
          { lat: 37.3639, lng: -121.9289 }, // Finish: San Jose Airport Cargo
        ],
        currentVehiclePos: { lat: 37.4280, lng: -122.2580 },
        currentProgressPct: 45,
        distanceKm: 81.6,
        durationMins: 64,
        eta: '32 min remaining',
        fareAmount: 430.00,
        tollAmount: 0.00,
        status: 'in_transit',
        efficiencyScore: 99.4,
        carbonSavedKg: 24.8,
        fuelLevelPct: 76,
        currentSpeedKmh: 82,
        temperatureCelsius: 18.2,
      },
    },
  },

  // 4. NEW YORK BRONX TO JFK: Two distinct paths from SAME START to SAME FINISH
  nyc: {
    id: 'nyc',
    name: 'New York (I-278 Van Wyck vs Whitestone Belt Parkway)',
    country: 'USA',
    flag: '🇺🇸',
    center: { lat: 40.7300, lng: -73.8300 },
    zoom: 11,
    routes: {
      routeA: {
        id: 'route-a',
        name: 'Western Corridor (I-278 & Van Wyck Expressway)',
        code: 'FX-NYC-A1',
        tag: 'Midtown Expressway Route',
        color: 'blue',
        accentHex: '#3B82F6',
        secondaryHex: '#1D4ED8',
        driver: {
          name: 'Marcus Brody',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          vehicle: 'Mercedes eSprinter Cargo',
          plate: 'NYC-4482',
          phone: '+1 (212) 555-0199',
          rating: 4.92,
        },
        origin: {
          name: 'Hunts Point Freight Distribution Center (Bronx)',
          address: '100 Food Center Dr, Bronx, NY 10474',
          location: { lat: 40.8116, lng: -73.8831 },
        },
        destination: {
          name: 'JFK Air Freight Terminal 4 (Queens)',
          address: 'JFK Airport Cargo Area, Queens, NY 11430',
          location: { lat: 40.6413, lng: -73.7781 },
        },
        waypoints: [
          {
            id: 'wp-ny-a1',
            name: 'Long Island City Depot',
            address: 'Queens Blvd, LIC, NY 11101',
            location: { lat: 40.7447, lng: -73.9388 },
            status: 'completed',
            eta: '10:30 AM',
            packagesCount: 12,
            recipient: 'TriState Distribution',
          },
          {
            id: 'wp-ny-a2',
            name: 'Kew Gardens Van Wyck Interchange',
            address: 'Queens Blvd & Van Wyck, Queens, NY 11435',
            location: { lat: 40.7120, lng: -73.8280 },
            status: 'current',
            eta: '11:15 AM',
            packagesCount: 7,
            recipient: 'Metropolitan Courier Hub',
          },
        ],
        pathCoordinates: [
          { lat: 40.8116, lng: -73.8831 }, // Start: Hunts Point Bronx
          { lat: 40.8050, lng: -73.9050 }, // Bruckner Expressway (I-278)
          { lat: 40.7850, lng: -73.9180 }, // RFK Triboro Bridge
          { lat: 40.7650, lng: -73.9300 }, // Astoria Grand Central Pkwy
          { lat: 40.7447, lng: -73.9388 }, // Waypoint A1: Long Island City Depot
          { lat: 40.7380, lng: -73.9050 }, // Long Island Expressway (I-495)
          { lat: 40.7300, lng: -73.8650 }, // Corona / Flushing Meadows
          { lat: 40.7120, lng: -73.8280 }, // Waypoint A2: Kew Gardens Van Wyck Interchange
          { lat: 40.6880, lng: -73.8120 }, // Van Wyck Expressway (I-678 S)
          { lat: 40.6650, lng: -73.7950 }, // South Ozone Park
          { lat: 40.6413, lng: -73.7781 }, // Finish: JFK Airport Cargo Area
        ],
        currentVehiclePos: { lat: 40.7120, lng: -73.8280 },
        currentProgressPct: 70,
        distanceKm: 31.2,
        durationMins: 45,
        eta: '14 min remaining',
        fareAmount: 560.00,
        tollAmount: 18.50,
        status: 'in_transit',
        efficiencyScore: 94.6,
        carbonSavedKg: 14.2,
        fuelLevelPct: 68,
        currentSpeedKmh: 42,
      },
      routeB: {
        id: 'route-b',
        name: 'Eastern Corridor (Whitestone & Belt Parkway)',
        code: 'FX-NYC-B2',
        tag: 'Coastal Parkway Route',
        color: 'emerald',
        accentHex: '#10B981',
        secondaryHex: '#047857',
        driver: {
          name: 'Elena Rostova',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          vehicle: 'BrightDrop Zevo 600 EV',
          plate: 'NY-8821B',
          phone: '+1 (718) 555-8833',
          rating: 4.97,
        },
        origin: {
          name: 'Hunts Point Freight Distribution Center (Bronx)',
          address: '100 Food Center Dr, Bronx, NY 10474',
          location: { lat: 40.8116, lng: -73.8831 },
        },
        destination: {
          name: 'JFK Air Freight Terminal 4 (Queens)',
          address: 'JFK Airport Cargo Area, Queens, NY 11430',
          location: { lat: 40.6413, lng: -73.7781 },
        },
        waypoints: [
          {
            id: 'wp-ny-b1',
            name: 'Whitestone Coastal Freight Depot',
            address: '14th Ave, Whitestone, Queens, NY 11357',
            location: { lat: 40.7850, lng: -73.8150 },
            status: 'completed',
            eta: '10:20 AM',
            packagesCount: 16,
            recipient: 'North Shore Maritime Supply',
          },
          {
            id: 'wp-ny-b2',
            name: 'Bayside Cross Island Staging Hub',
            address: 'Cross Island Pkwy, Bayside, NY 11360',
            location: { lat: 40.7600, lng: -73.7650 },
            status: 'current',
            eta: '11:05 AM',
            packagesCount: 9,
            recipient: 'East Queens Commerce Park',
          },
        ],
        pathCoordinates: [
          { lat: 40.8116, lng: -73.8831 }, // Start: Hunts Point Bronx
          { lat: 40.8180, lng: -73.8450 }, // Bruckner Expy / Bronx River
          { lat: 40.8050, lng: -73.8250 }, // Whitestone Bridge approach
          { lat: 40.7850, lng: -73.8150 }, // Waypoint B1: Whitestone Freight Depot
          { lat: 40.7720, lng: -73.7850 }, // Cross Island Parkway curve
          { lat: 40.7600, lng: -73.7650 }, // Waypoint B2: Bayside Cross Island Hub
          { lat: 40.7350, lng: -73.7450 }, // Alley Pond Park
          { lat: 40.7100, lng: -73.7350 }, // Belmont Park
          { lat: 40.6800, lng: -73.7420 }, // Laurelton Parkway
          { lat: 40.6620, lng: -73.7550 }, // Belt Parkway West curve
          { lat: 40.6413, lng: -73.7781 }, // Finish: JFK Airport Cargo Area
        ],
        currentVehiclePos: { lat: 40.7600, lng: -73.7650 },
        currentProgressPct: 58,
        distanceKm: 38.6,
        durationMins: 52,
        eta: '22 min remaining',
        fareAmount: 480.00,
        tollAmount: 11.00,
        status: 'in_transit',
        efficiencyScore: 98.8,
        carbonSavedKg: 21.5,
        fuelLevelPct: 82,
        currentSpeedKmh: 58,
      },
    },
  },
};
