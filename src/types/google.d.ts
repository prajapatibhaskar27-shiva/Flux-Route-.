// Global type definitions for Google Maps JavaScript SDK

declare global {
  interface Window {
    google?: any;
    __initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
  }

  namespace google {
    namespace maps {
      interface MapOptions {
        center?: LatLngLiteral | any;
        zoom?: number;
        styles?: MapTypeStyle[];
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        zoomControlOptions?: any;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        gestureHandling?: string;
        [key: string]: any;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface MapTypeStyle {
        elementType?: string;
        featureType?: string;
        stylers?: any[];
      }

      class Map {
        constructor(mapDiv: HTMLElement | null, opts?: MapOptions);
        setOptions(options: MapOptions): void;
        fitBounds(bounds: any, padding?: number | any): void;
      }

      class LatLngBounds {
        constructor();
        extend(point: any): LatLngBounds;
        isEmpty(): boolean;
      }

      class Polyline {
        constructor(opts?: any);
        setMap(map: Map | null): void;
        setPath(path: any): void;
      }

      class Marker {
        constructor(opts?: any);
        setMap(map: Map | null): void;
        setPosition(pos: any): void;
        addListener(event: string, handler: Function): any;
      }

      class TrafficLayer {
        constructor();
        setMap(map: Map | null): void;
      }

      class Point {
        constructor(x: number, y: number);
      }

      const SymbolPath: {
        BACKWARD_CLOSED_ARROW: any;
        BACKWARD_OPEN_ARROW: any;
        CIRCLE: any;
        FORWARD_CLOSED_ARROW: any;
        FORWARD_OPEN_ARROW: any;
      };

      const ControlPosition: {
        RIGHT_BOTTOM: any;
        RIGHT_TOP: any;
        TOP_LEFT: any;
        TOP_RIGHT: any;
        BOTTOM_CENTER: any;
        [key: string]: any;
      };
    }
  }
}

export {};
