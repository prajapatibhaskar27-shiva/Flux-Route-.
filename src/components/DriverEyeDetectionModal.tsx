import React, { useState, useEffect, useRef } from 'react';
import { RouteData, DriverEyeDetection } from '../types/route';
import { 
  Eye, 
  EyeOff,
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Phone, 
  Radio, 
  Coffee, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Wind, 
  Sliders, 
  Clock, 
  Navigation, 
  ShieldCheck,
  Zap,
  BedDouble,
  Camera,
  Video,
  VideoOff,
  Siren,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Flame,
  UserCheck,
  AlertOctagon
} from 'lucide-react';

interface DriverEyeDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteData;
  onAddRestStopWaypoint?: (routeId: 'route-a' | 'route-b', restStopName: string) => void;
  onUpdateDriverEyeStatus?: (routeId: 'route-a' | 'route-b', updatedStatus: DriverEyeDetection) => void;
}

export const DriverEyeDetectionModal: React.FC<DriverEyeDetectionModalProps> = ({
  isOpen,
  onClose,
  route,
  onAddRestStopWaypoint,
  onUpdateDriverEyeStatus,
}) => {
  const driver = route.driver;
  const isRouteA = route.id === 'route-a';

  // Eye detection state with realistic default telematics
  const [dmsState, setDmsState] = useState<DriverEyeDetection>(() => {
    return route.driver.eyeDetection || {
      status: 'alert',
      isSleepy: false,
      eyeClosurePct: 9,
      blinkRatePerMin: 16,
      consecutiveClosedSeconds: 0.2,
      yawnCountLastHour: 1,
      continuousDriveHours: 3.4,
      drowsinessScore: 18,
      inCabinBuzzerActive: false,
      seatVibrationActive: false,
      coldAirBlastActive: false,
      hazardLightsActive: false,
      speedGovernorActive: false,
      emergencySosActive: false,
      powerNapActive: false,
      sensitivityMode: 'night_shift',
      lastIncidentTime: undefined,
      recommendedRestStop: {
        name: isRouteA ? 'Yamuna Expressway Mile 65 Highway Rest Plaza' : 'NH-19 Mathura Freight Truckers Rest Bay',
        distanceKm: 4.8,
        etaMins: 6,
        type: 'Commercial Driver Rest Oasis & 150kW EV Fast Chargers',
        hasDriverSleepingBunks: true,
      },
    };
  });

  // Camera & Interactive modes
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Audio & Notification states
  const [buzzerPlaying, setBuzzerPlaying] = useState<boolean>(false);
  const [voicePromptSent, setVoicePromptSent] = useState<boolean>(false);
  const [restStopDispatched, setRestStopDispatched] = useState<boolean>(false);
  const [sosSent, setSosSent] = useState<boolean>(false);

  // Power Nap Timer State (20 minutes = 1200 seconds)
  const [napSecondsRemaining, setNapSecondsRemaining] = useState<number>(1200);
  const [isNapTimerRunning, setIsNapTimerRunning] = useState<boolean>(false);

  // Sync state when route changes
  useEffect(() => {
    if (route.driver.eyeDetection) {
      setDmsState(route.driver.eyeDetection);
    }
  }, [route]);

  // Handle Power Nap countdown
  useEffect(() => {
    let interval: any;
    if (isNapTimerRunning && napSecondsRemaining > 0) {
      interval = setInterval(() => {
        setNapSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsNapTimerRunning(false);
            triggerAudioAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isNapTimerRunning, napSecondsRemaining]);

  // Setup / Teardown Webcam Stream
  useEffect(() => {
    if (useWebcam && isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setWebcamError(null);
        })
        .catch((err) => {
          console.warn('Webcam access not allowed or unavailable:', err);
          setWebcamError('Camera access denied or unavailable. Using AI Computer Vision Simulation.');
          setUseWebcam(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [useWebcam, isOpen]);

  // Synthesized in-cabin high-pitch buzzer alarm using Web Audio API
  const triggerAudioAlarm = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      osc.frequency.setValueAtTime(460, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(920, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.36);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
      setBuzzerPlaying(true);
      setTimeout(() => setBuzzerPlaying(false), 600);
    } catch {
      // AudioContext might be restricted until user gesture, safely ignored
    }
  };

  // Real voice wake-up speech synthesis
  const triggerVoiceSpeech = (customText?: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = customText || `Attention driver ${driver.name}! Eye closure detected. Pull over safely at the rest area.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Select Sleepy Severity Option
  const handleSetSleepySeverity = (severity: 'alert' | 'mild_fatigue' | 'sleepy_warning' | 'microsleep_alarm') => {
    let newState: DriverEyeDetection;
    if (severity === 'alert') {
      newState = {
        ...dmsState,
        status: 'alert',
        isSleepy: false,
        eyeClosurePct: 10,
        blinkRatePerMin: 16,
        consecutiveClosedSeconds: 0.2,
        yawnCountLastHour: 1,
        drowsinessScore: 16,
        inCabinBuzzerActive: false,
        seatVibrationActive: false,
        coldAirBlastActive: false,
        hazardLightsActive: false,
        speedGovernorActive: false,
        lastIncidentTime: undefined,
      };
    } else if (severity === 'mild_fatigue') {
      newState = {
        ...dmsState,
        status: 'mild_fatigue',
        isSleepy: true,
        eyeClosurePct: 38,
        blinkRatePerMin: 26,
        consecutiveClosedSeconds: 1.1,
        yawnCountLastHour: 4,
        drowsinessScore: 54,
        coldAirBlastActive: true,
        inCabinBuzzerActive: false,
        seatVibrationActive: false,
        hazardLightsActive: false,
        speedGovernorActive: false,
        lastIncidentTime: 'Just now (Drowsy yawning & slow blinks detected)',
      };
      triggerVoiceSpeech(`Driver ${driver.name}, mild drowsiness detected. Refresh with water or rest.`);
    } else if (severity === 'sleepy_warning') {
      newState = {
        ...dmsState,
        status: 'sleepy_warning',
        isSleepy: true,
        eyeClosurePct: 62,
        blinkRatePerMin: 34,
        consecutiveClosedSeconds: 2.3,
        yawnCountLastHour: 6,
        drowsinessScore: 84,
        inCabinBuzzerActive: true,
        seatVibrationActive: true,
        coldAirBlastActive: true,
        hazardLightsActive: true,
        speedGovernorActive: true,
        lastIncidentTime: 'Just now (Eyes shut > 2.0s on Highway)',
      };
      triggerAudioAlarm();
      triggerVoiceSpeech(`Warning! Driver ${driver.name}, critical sleepiness! Speed governed to 45 kilometers per hour.`);
    } else {
      // microsleep_alarm
      newState = {
        ...dmsState,
        status: 'microsleep_alarm',
        isSleepy: true,
        eyeClosurePct: 92,
        blinkRatePerMin: 42,
        consecutiveClosedSeconds: 3.6,
        yawnCountLastHour: 8,
        drowsinessScore: 98,
        inCabinBuzzerActive: true,
        seatVibrationActive: true,
        coldAirBlastActive: true,
        hazardLightsActive: true,
        speedGovernorActive: true,
        emergencySosActive: true,
        lastIncidentTime: 'CRITICAL! Microsleep > 3.5s! Automatic Highway Emergency Pull-Over protocol engaged!',
      };
      triggerAudioAlarm();
      triggerVoiceSpeech(`Emergency! Driver ${driver.name} is asleep! Hazard lights flashing! Pulling over immediately!`);
    }

    setDmsState(newState);
    onUpdateDriverEyeStatus?.(route.id, newState);
  };

  // Toggle sleepy simulation on/off
  const handleToggleSleepySimulation = () => {
    if (!dmsState.isSleepy) {
      handleSetSleepySeverity('sleepy_warning');
    } else {
      handleSetSleepySeverity('alert');
    }
  };

  const handleManualBuzzer = () => {
    triggerAudioAlarm();
    setDmsState((prev) => ({
      ...prev,
      inCabinBuzzerActive: true,
    }));
    setTimeout(() => {
      setDmsState((prev) => ({ ...prev, inCabinBuzzerActive: false }));
    }, 1500);
  };

  const handleToggleColdAir = () => {
    const updated = !dmsState.coldAirBlastActive;
    setDmsState((prev) => {
      const s = { ...prev, coldAirBlastActive: updated };
      onUpdateDriverEyeStatus?.(route.id, s);
      return s;
    });
  };

  const handleToggleSeatVibe = () => {
    const updated = !dmsState.seatVibrationActive;
    setDmsState((prev) => {
      const s = { ...prev, seatVibrationActive: updated };
      onUpdateDriverEyeStatus?.(route.id, s);
      return s;
    });
  };

  const handleToggleHazardLights = () => {
    const updated = !dmsState.hazardLightsActive;
    setDmsState((prev) => {
      const s = { ...prev, hazardLightsActive: updated };
      onUpdateDriverEyeStatus?.(route.id, s);
      return s;
    });
  };

  const handleToggleSpeedGovernor = () => {
    const updated = !dmsState.speedGovernorActive;
    setDmsState((prev) => {
      const s = { ...prev, speedGovernorActive: updated };
      onUpdateDriverEyeStatus?.(route.id, s);
      return s;
    });
  };

  const handleSendVoiceWakeup = () => {
    setVoicePromptSent(true);
    triggerAudioAlarm();
    triggerVoiceSpeech(`Attention driver ${driver.name}! Eye closure detected. Pull over safely at the rest area.`);
    setTimeout(() => setVoicePromptSent(false), 4000);
  };

  const handleDispatchSos = () => {
    setSosSent(true);
    setDmsState((prev) => {
      const s = { ...prev, emergencySosActive: true };
      onUpdateDriverEyeStatus?.(route.id, s);
      return s;
    });
    setTimeout(() => setSosSent(false), 5000);
  };

  const handleDispatchRestStop = () => {
    if (!dmsState.recommendedRestStop) return;
    onAddRestStopWaypoint?.(route.id, dmsState.recommendedRestStop.name);
    setRestStopDispatched(true);
    triggerVoiceSpeech(`Rest stop ${dmsState.recommendedRestStop.name} added to route. Take a 20-minute power nap.`);
    // Revive driver status with safety plan
    const updated: DriverEyeDetection = {
      ...dmsState,
      status: 'mild_fatigue',
      isSleepy: false,
      drowsinessScore: 32,
      inCabinBuzzerActive: false,
      seatVibrationActive: false,
      hazardLightsActive: false,
    };
    setDmsState(updated);
    onUpdateDriverEyeStatus?.(route.id, updated);
  };

  const formatNapTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[94vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl text-white shadow-lg transition-all ${
              dmsState.isSleepy 
                ? 'bg-rose-600 animate-pulse shadow-rose-600/50 ring-4 ring-rose-500/20' 
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-500/30'
            }`}>
              {dmsState.isSleepy ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white">
                  Driver Eye Detection & Sleepiness Countermeasures
                </h3>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border transition-all ${
                  dmsState.status === 'microsleep_alarm'
                    ? 'bg-red-500/30 text-red-200 border-red-500 animate-ping font-black'
                    : dmsState.isSleepy
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {dmsState.status === 'microsleep_alarm'
                    ? '🚨 MICROSLEEP ALARM (>3.5s)'
                    : dmsState.isSleepy 
                    ? '⚠️ CRITICAL SLEEPINESS DETECTED' 
                    : '✓ DRIVER ALERT & VIGILANT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Cabin Camera PERCLOS Eye-Tracking Telematics for <strong>{driver.name}</strong> • {route.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* ACTIVE CRITICAL BANNER WHEN SLEEPY */}
        {dmsState.isSleepy && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border border-rose-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <strong className="text-xs text-white block">
                  Sleepy Driver Alert: Driver Eyes Closed for {dmsState.consecutiveClosedSeconds}s
                </strong>
                <p className="text-[11px] text-rose-200">
                  {dmsState.lastIncidentTime || 'High crash risk detected! Countermeasures activated.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDispatchRestStop}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Reroute to Rest Stop</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetSleepySeverity('alert')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer border border-slate-700"
              >
                Clear Alarm
              </button>
            </div>
          </div>
        )}

        {/* DRIVER PROFILE STRIP */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{driver.name}</span>
                <span className="text-[10px] text-amber-400 font-mono">★ {driver.rating}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {driver.plate}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
                  {route.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400">{driver.vehicle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${driver.phone}`}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Driver ({driver.phone})</span>
            </a>
          </div>
        </div>

        {/* 1. SEVERITY / DROWSINESS STATE SELECTOR ("OPTION WHEN A DRIVER FEELS SLEEPY") */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Driver Fatigue & Sleepiness State Selector
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Select or simulate sleepiness condition
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSetSleepySeverity('alert')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                dmsState.status === 'alert'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <strong className="text-xs">1. Alert & Awake</strong>
              </div>
              <span className="text-[10px] block mt-1 opacity-70">PERCLOS: 10% • Normal</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetSleepySeverity('mild_fatigue')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                dmsState.status === 'mild_fatigue'
                  ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-2 ring-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <strong className="text-xs">2. Mild Fatigue</strong>
              </div>
              <span className="text-[10px] block mt-1 opacity-70">PERCLOS: 38% • Yawning</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetSleepySeverity('sleepy_warning')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                dmsState.status === 'sleepy_warning'
                  ? 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/20 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <strong className="text-xs">3. Sleepy Warning</strong>
              </div>
              <span className="text-[10px] block mt-1 opacity-70">PERCLOS: 62% • Eyes &gt;2s</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetSleepySeverity('microsleep_alarm')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                dmsState.status === 'microsleep_alarm'
                  ? 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/40 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <strong className="text-xs">4. Microsleep Alarm</strong>
              </div>
              <span className="text-[10px] block mt-1 opacity-70">PERCLOS: 92% • Emergency</span>
            </button>
          </div>
        </div>

        {/* 2. LIVE CAMERA STREAM OR AI RETICLE EYE TRACKER */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                {useWebcam ? 'LIVE WEBCAM DRIVER MONITOR' : 'AI DMS CABIN EYE TRACKING STREAM (60 FPS)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Toggle Real Webcam vs AI Simulation */}
              <button
                type="button"
                onClick={() => setUseWebcam(!useWebcam)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  useWebcam 
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {useWebcam ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{useWebcam ? 'Using Live Webcam' : 'Switch to Live Webcam'}</span>
              </button>

              <div className="text-[10px] font-mono text-slate-400">
                Sens: <strong className="text-blue-400 uppercase">{dmsState.sensitivityMode}</strong>
              </div>
            </div>
          </div>

          {webcamError && (
            <div className="p-2.5 mb-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{webcamError}</span>
            </div>
          )}

          {/* Visual Eye Mesh / Live Webcam Viewfinder */}
          <div className="relative h-48 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

            {/* If Webcam Active */}
            {useWebcam ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-xl"
                />
                {/* Augmented Face & Eye Tracking Target Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className={`w-48 h-36 border-2 border-dashed rounded-3xl transition-all duration-300 flex items-center justify-around px-4 ${
                    dmsState.isSleepy ? 'border-rose-500 bg-rose-950/30 animate-pulse' : 'border-emerald-400 bg-emerald-950/20'
                  }`}>
                    {/* Simulated Left Eye Landmark */}
                    <div className={`w-8 h-4 rounded-full border-2 transition-all ${
                      dmsState.isSleepy ? 'border-rose-400 bg-rose-500/50 scale-y-20' : 'border-emerald-300 bg-emerald-400/40 scale-y-100'
                    }`} />
                    {/* Simulated Right Eye Landmark */}
                    <div className={`w-8 h-4 rounded-full border-2 transition-all ${
                      dmsState.isSleepy ? 'border-rose-400 bg-rose-500/50 scale-y-20' : 'border-emerald-300 bg-emerald-400/40 scale-y-100'
                    }`} />
                  </div>
                  <span className="mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 text-cyan-300 backdrop-blur-sm border border-cyan-500/30">
                    REALTIME FACIAL GEOMETRY DETECTED
                  </span>
                </div>
              </div>
            ) : (
              /* Simulated Driver Face & Eye Tracking Landmarks */
              <div className="relative flex flex-col items-center gap-2 z-10">
                <div className="relative">
                  {/* Eyes Box */}
                  <div className="flex items-center gap-6">
                    {/* Left Eye */}
                    <div className={`w-16 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      dmsState.isSleepy
                        ? 'border-rose-500 bg-rose-950/70 scale-y-25 shadow-lg shadow-rose-500/50'
                        : 'border-emerald-400 bg-emerald-950/40 scale-y-100 shadow-md shadow-emerald-500/30'
                    }`}>
                      <div className={`w-4 h-4 rounded-full transition-all ${
                        dmsState.isSleepy ? 'bg-rose-400 scale-50' : 'bg-emerald-300'
                      }`} />
                    </div>

                    {/* Right Eye */}
                    <div className={`w-16 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      dmsState.isSleepy
                        ? 'border-rose-500 bg-rose-950/70 scale-y-25 shadow-lg shadow-rose-500/50'
                        : 'border-emerald-400 bg-emerald-950/40 scale-y-100 shadow-md shadow-emerald-500/30'
                    }`}>
                      <div className={`w-4 h-4 rounded-full transition-all ${
                        dmsState.isSleepy ? 'bg-rose-400 scale-50' : 'bg-emerald-300'
                      }`} />
                    </div>
                  </div>

                  {/* Tracking Reticle Lines */}
                  <div className={`absolute -inset-3 border border-dashed rounded-xl pointer-events-none ${
                    dmsState.isSleepy ? 'border-rose-500 animate-pulse' : 'border-emerald-500/50'
                  }`} />
                </div>

                {/* Status Badge */}
                <div className="mt-2 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                    dmsState.isSleepy
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-bounce'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  }`}>
                    {dmsState.isSleepy
                      ? '🔴 EYES SHUT: MICROSLEEP DETECTED (> 2.0s)'
                      : '🟢 EYES OPEN: VIGILANT (EAR: 0.34)'}
                  </span>
                </div>
              </div>
            )}

            {/* Corner Markers */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">
              FPS: 60.0 • LATENCY: 12ms
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">
              IR CABIN ILLUMINATOR: ACTIVE
            </div>
          </div>

          {/* PERCLOS & Telematics Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">PERCLOS (Eye Closure):</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-base font-black font-mono ${
                  dmsState.eyeClosurePct > 35 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {dmsState.eyeClosurePct}%
                </span>
                <span className="text-[10px] text-slate-500">time closed</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Closed Duration:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-base font-black font-mono ${
                  dmsState.consecutiveClosedSeconds > 1.5 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}>
                  {dmsState.consecutiveClosedSeconds}s
                </span>
                <span className="text-[10px] text-slate-500">seconds</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Yawn Frequency:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black font-mono text-amber-400">
                  {dmsState.yawnCountLastHour}
                </span>
                <span className="text-[10px] text-slate-500">past hour</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Continuous Drive:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black font-mono text-cyan-400">
                  {dmsState.continuousDriveHours}h
                </span>
                <span className="text-[10px] text-slate-500">no break</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. EMERGENCY SLEEPINESS COUNTERMEASURES & INTERVENTIONS ("THIS IMP KIND") */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Emergency Fatigue & Sleepiness Action Options
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Direct In-Cabin Actuation & Telematics Control
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Wake-Up Buzzer */}
            <button
              type="button"
              onClick={handleManualBuzzer}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                dmsState.inCabinBuzzerActive || buzzerPlaying
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                dmsState.inCabinBuzzerActive ? 'bg-rose-600 text-white' : 'bg-slate-900 text-amber-400'
              }`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">In-Cabin Alarm Buzzer</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High-decibel acoustic horn to shock driver awake
                </p>
                {buzzerPlaying && (
                  <span className="text-[10px] font-mono text-rose-400 font-bold block mt-1">
                    🔊 SOUNDING ALARM...
                  </span>
                )}
              </div>
            </button>

            {/* 2. Voice Alert Command (TTS) */}
            <button
              type="button"
              onClick={handleSendVoiceWakeup}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                voicePromptSent
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-900 text-indigo-400 shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">AI Voice Alert Command</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Speaks out loud: "Attention! Eye closure detected. Pull over safely."
                </p>
                {voicePromptSent && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-1">
                    ✓ Voice Spoken into Cabin!
                  </span>
                )}
              </div>
            </button>

            {/* 3. Hazard Lights Flasher */}
            <button
              type="button"
              onClick={handleToggleHazardLights}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                dmsState.hazardLightsActive
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/20'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                dmsState.hazardLightsActive ? 'bg-amber-500 text-black' : 'bg-slate-900 text-amber-400'
              }`}>
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">Emergency Hazard Lights</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Flashes highway emergency beacons to alert vehicles behind
                </p>
                <span className="text-[10px] font-mono text-amber-400 block mt-1">
                  Status: {dmsState.hazardLightsActive ? '🚨 Flashing Active' : 'Off'}
                </span>
              </div>
            </button>

            {/* 4. Safe Speed Governor */}
            <button
              type="button"
              onClick={handleToggleSpeedGovernor}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                dmsState.speedGovernorActive
                  ? 'bg-blue-950/80 border-blue-500 text-blue-200 ring-2 ring-blue-500/20'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                dmsState.speedGovernorActive ? 'bg-blue-600 text-white' : 'bg-slate-900 text-cyan-400'
              }`}>
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">Speed Governor (45 km/h)</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Limits engine throttle to prevent high-speed rollover accidents
                </p>
                <span className="text-[10px] font-mono text-cyan-400 block mt-1">
                  Status: {dmsState.speedGovernorActive ? '🛡️ Governed (45 km/h)' : 'Normal Cruise'}
                </span>
              </div>
            </button>

            {/* 5. Cold Air Blast */}
            <button
              type="button"
              onClick={handleToggleColdAir}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                dmsState.coldAirBlastActive
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                dmsState.coldAirBlastActive ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-cyan-400'
              }`}>
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">AC Cold Blast (16°C)</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High-speed icy ventilation on driver's face to trigger adrenaline
                </p>
                <span className="text-[10px] font-mono text-cyan-400 block mt-1">
                  Status: {dmsState.coldAirBlastActive ? '❄️ 16°C High Fan' : 'Standby'}
                </span>
              </div>
            </button>

            {/* 6. Haptic Seat Vibration */}
            <button
              type="button"
              onClick={handleToggleSeatVibe}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                dmsState.seatVibrationActive
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/20'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-900 text-amber-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">Steering & Seat Vibration</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Motorized haptic rumble in driver seat and steering wheel
                </p>
                <span className="text-[10px] font-mono text-amber-400 block mt-1">
                  Status: {dmsState.seatVibrationActive ? '📳 Pulsing Active' : 'Standby'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 4. MANDATORY 20-MIN REST STOP REROUTE & POWER NAP TIMER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Nearest Rest Bay Reroute */}
          {dmsState.recommendedRestStop && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-blue-950/40 border border-amber-500/30 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Mandatory Rest Stop Reroute
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {dmsState.recommendedRestStop.distanceKm} KM • {dmsState.recommendedRestStop.etaMins} MINS
                  </span>
                </div>

                <strong className="text-white text-sm block">{dmsState.recommendedRestStop.name}</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">{dmsState.recommendedRestStop.type}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Equipped with Driver Sleeping Bunks, Hot Chai & Clean Washrooms</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDispatchRestStop}
                disabled={restStopDispatched}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Navigation className="w-4 h-4" />
                <span>{restStopDispatched ? '✓ Rest Stop Added to Active Waypoints' : '1-Click Auto-Reroute to Rest Stop'}</span>
              </button>
            </div>
          )}

          {/* 20-Minute Power Nap Timer Option */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    20-Min Restorative Power Nap Timer
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  NASA REST PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Scientifically proven 20-minute power nap restores driver alertness by 54% without grogginess.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-black font-mono text-white">
                  {formatNapTime(napSecondsRemaining)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNapTimerRunning(!isNapTimerRunning)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isNapTimerRunning 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  {isNapTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isNapTimerRunning ? 'Pause' : 'Start Nap'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsNapTimerRunning(false);
                    setNapSecondsRemaining(1200);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Reset to 20 minutes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. CONTROL ROOM SOS & SENSITIVITY CONFIG */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-300">Eye Detection Sensitivity:</span>
              <div className="flex items-center gap-1.5 mt-1">
                {(['standard', 'night_shift', 'strict'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      const updated = { ...dmsState, sensitivityMode: mode };
                      setDmsState(updated);
                      onUpdateDriverEyeStatus?.(route.id, updated);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                      dmsState.sensitivityMode === mode
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'standard' ? 'Standard (2.0s)' : mode === 'night_shift' ? 'Night Shift (1.4s)' : 'Strict Hazmat (1.0s)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SOS Dispatch Button */}
            <button
              type="button"
              onClick={handleDispatchSos}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                sosSent 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Siren className="w-3.5 h-3.5 text-rose-400" />
              <span>{sosSent ? '✓ SOS Sent to Fleet Tower' : 'SOS Control Room'}</span>
            </button>

            {/* Quick Test Sleepy Simulation Button */}
            <button
              type="button"
              onClick={handleToggleSleepySimulation}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                dmsState.isSleepy
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{dmsState.isSleepy ? '✓ Clear Alarm (Driver Awake)' : 'Test Sleepy Driver Simulation'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
