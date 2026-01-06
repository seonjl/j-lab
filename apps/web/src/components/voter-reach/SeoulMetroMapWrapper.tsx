'use client';

import dynamic from 'next/dynamic';
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

interface SeoulMetroMapWrapperProps {
  stations: Station[];
  selectedHour: number;
  selectedGu: string | null;
}

// Dynamic import to avoid SSR issues with Leaflet
const SeoulMetroMap = dynamic(
  () => import('./SeoulMetroMap').then(mod => ({ default: mod.SeoulMetroMap })),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
  }
);

function MapLoadingPlaceholder() {
  const { locale } = useLanguage();

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-full min-h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">
          {locale === 'ko' ? '서울 지하철 노선도' : 'Seoul Metro Map'}
        </h3>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">
            {locale === 'ko' ? '지도 로딩 중...' : 'Loading map...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SeoulMetroMapWrapper({ stations, selectedHour, selectedGu }: SeoulMetroMapWrapperProps) {
  return <SeoulMetroMap stations={stations} selectedHour={selectedHour} selectedGu={selectedGu} />;
}
