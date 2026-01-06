'use client';

import { useLanguage } from '@/lib/i18n';

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

interface MapPlaceholderProps {
  stations: Station[];
  selectedHour: number;
}

export function MapPlaceholder({ stations, selectedHour }: MapPlaceholderProps) {
  const { t, locale } = useLanguage();

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-full min-h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">
          {locale === 'ko' ? '서울 지하철 노선도' : 'Seoul Metro Map'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedHour < 10 ? '0' : ''}{selectedHour}:00
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #94a3b8 1px, transparent 1px),
              linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="text-center z-10 p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {t.voterReach.mapPlaceholder}
          </p>
          <p className="text-xs text-gray-400">
            {locale === 'ko'
              ? '상위 역이 지도에 표시됩니다'
              : 'Top stations will be displayed on the map'}
          </p>
        </div>

        {/* Sample station indicators */}
        {stations.slice(0, 5).map((station, index) => (
          <div
            key={station.station_name}
            className="absolute"
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${30 + (index % 2) * 30}%`,
            }}
          >
            <div
              className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
              style={{
                opacity: 1 - (index * 0.15),
                animationDelay: `${index * 0.2}s`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
