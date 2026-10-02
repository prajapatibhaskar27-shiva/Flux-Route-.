/**
 * Google Maps API Loader with user-provided API Key:
 * AIzaSyClFV9d-j9uIbrtxpwgIARMNSMosOOfSoY
 */

export const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyClFV9d-j9uIbrtxpwgIARMNSMosOOfSoY';

let loadPromise: Promise<boolean> | null = null;

declare global {
  interface Window {
    __initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
  }
}

export function loadGoogleMapsScript(apiKey: string = GOOGLE_MAPS_API_KEY): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(true);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    // Handle auth failure event from Google Maps
    window.gm_authFailure = () => {
      console.warn('Google Maps authentication failed or key restriction detected. Falling back to high-fidelity interactive map mode.');
      resolve(false);
    };

    const scriptId = 'google-maps-js-sdk';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.google && window.google.maps) {
        resolve(true);
      } else {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    // Timeout safety
    const timeoutTimer = setTimeout(() => {
      if (!window.google?.maps) {
        console.warn('Google Maps load timed out. Using interactive visual map canvas.');
        resolve(false);
      }
    }, 6000);

    script.onload = () => {
      clearTimeout(timeoutTimer);
      if (window.google?.maps) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutTimer);
      console.warn('Google Maps script tag error. Activating fallback interactive canvas.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
