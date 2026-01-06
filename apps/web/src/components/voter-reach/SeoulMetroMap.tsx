'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import leaflet.heat for heatmap functionality
import 'leaflet.heat';

// Extend L.heatLayer type
declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      minOpacity?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}

interface Station {
  station_id: string;
  station_name: string;
  lat: number;
  lng: number;
  hour: number;
  score: number;
  ridership: number;
  reason: string;
}

interface SeoulMetroMapProps {
  stations: Station[];
  selectedHour: number;
  selectedGu: string | null;
}

interface GeoJSONFeature {
  type: string;
  properties: {
    gu_code: string;
    gu_name: string;
    dong_count: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][][];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

// Seoul center coordinates
const SEOUL_CENTER: [number, number] = [37.5665, 126.9780];
const DEFAULT_ZOOM = 11;

export function SeoulMetroMap({ stations, selectedHour, selectedGu }: SeoulMetroMapProps) {
  const { locale } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [geoJSONData, setGeoJSONData] = useState<GeoJSONData | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: SEOUL_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles with Korean labels
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Initialize marker layer group
    markersRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load GeoJSON data on mount
  useEffect(() => {
    fetch('/data/seoul_gu_boundaries.geojson')
      .then(res => res.json())
      .then((data: GeoJSONData) => setGeoJSONData(data))
      .catch(err => console.error('Failed to load district boundaries:', err));
  }, []);

  // Update district boundary when selectedGu changes
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Remove existing boundary layer
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    // If no gu selected or no GeoJSON data, don't render boundary
    if (!selectedGu || !geoJSONData) return;

    // Find the matching feature for the selected gu
    const selectedFeature = geoJSONData.features.find(
      (f) => f.properties.gu_name === selectedGu
    );

    if (!selectedFeature) return;

    // Create GeoJSON layer with styling
    const boundaryLayer = L.geoJSON(selectedFeature as unknown as GeoJSON.Feature, {
      style: {
        color: '#2563eb', // blue-600
        weight: 3,
        opacity: 1,
        fillColor: '#3b82f6', // blue-500
        fillOpacity: 0.15,
      },
    });

    boundaryLayer.addTo(map);
    boundaryLayerRef.current = boundaryLayer;

    // Fit map to boundary bounds
    const bounds = boundaryLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedGu, geoJSONData, isMapReady]);

  // Update markers and heatmap when stations change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (stations.length === 0) return;

    // Find max ridership for normalization
    const maxRidership = Math.max(...stations.map(s => s.ridership));

    // Create heatmap data
    const heatData: Array<[number, number, number]> = stations.map(station => [
      station.lat,
      station.lng,
      station.ridership / maxRidership, // Normalized intensity (0-1)
    ]);

    // Add heatmap layer
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.0: '#3b82f6', // blue-500
        0.25: '#22c55e', // green-500
        0.5: '#eab308', // yellow-500
        0.75: '#f97316', // orange-500
        1.0: '#ef4444', // red-500
      },
    });
    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // Create custom icon for markers
    const createMarkerIcon = (rank: number) => {
      const size = rank <= 3 ? 32 : rank <= 5 ? 28 : 24;
      const bgColor = rank === 1 ? '#ef4444' : rank === 2 ? '#f97316' : rank === 3 ? '#eab308' : '#3b82f6';

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${bgColor};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${size > 28 ? 14 : 12}px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${rank}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // Add markers for each station
    stations.forEach((station, index) => {
      const rank = index + 1;
      const marker = L.marker([station.lat, station.lng], {
        icon: createMarkerIcon(rank),
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 180px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">
            #${rank} ${station.station_name}
          </div>
          <div style="font-size: 12px; color: #666;">
            <div style="margin-bottom: 4px;">
              <strong>${locale === 'ko' ? '이용객' : 'Ridership'}:</strong>
              ${station.ridership.toLocaleString()}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>${locale === 'ko' ? '점수' : 'Score'}:</strong>
              ${station.score.toLocaleString()}
            </div>
            <div style="color: #888; font-style: italic;">
              ${station.reason}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current?.addLayer(marker);
    });

    // Fit map bounds to show all stations
    if (stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, isMapReady, locale]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-full min-h-[400px] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            {locale === 'ko' ? '서울 지하철 노선도' : 'Seoul Metro Map'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedHour < 10 ? '0' : ''}{selectedHour}:00
            {locale === 'ko' ? ' 기준' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            {locale === 'ko' ? '높음' : 'High'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            {locale === 'ko' ? '중간' : 'Mid'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            {locale === 'ko' ? '낮음' : 'Low'}
          </span>
        </div>
      </div>

      <div ref={mapContainerRef} className="flex-1 min-h-[350px]" />

      {stations.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {locale === 'ko'
              ? `상위 ${stations.length}개 역 표시 중 - 마커를 클릭하여 상세정보 확인`
              : `Showing top ${stations.length} stations - Click markers for details`}
          </p>
        </div>
      )}
    </div>
  );
}
