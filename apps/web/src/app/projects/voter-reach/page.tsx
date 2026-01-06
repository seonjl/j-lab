'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { SeoulMetroMapWrapper } from '@/components/voter-reach/SeoulMetroMapWrapper';
import { StationRanking } from '@/components/voter-reach/StationRanking';
import { StationTrendPanel } from '@/components/voter-reach/StationTrendPanel';
import { TimeSlider } from '@/components/voter-reach/TimeSlider';
import { DistrictSelector } from '@/components/voter-reach/DistrictSelector';

interface Station {
  station_id: string;
  station_name: string;
  lat: number;
  lng: number;
  hour: number;
  score: number;
  ridership: number;
  reason: string;
  gu?: string;
  turnout_rate?: number;
}

export default function VoterReachPage() {
  const { t, locale } = useLanguage();
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedGu, setSelectedGu] = useState<string | null>(null);
  const [selectedElectoralDistrict, setSelectedElectoralDistrict] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (hour: number, gu: string | null, electoralDistrict: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: { target_hour: number; top_n: number; gu?: string; electoral_district?: string } = {
        target_hour: hour,
        top_n: 10,
      };

      if (gu) {
        requestBody.gu = gu;
      }

      if (electoralDistrict) {
        requestBody.electoral_district = electoralDistrict;
      }

      const response = await fetch('/api/voter-reach/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setStations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch voter reach data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedHour, selectedGu, selectedElectoralDistrict);
  }, [selectedHour, selectedGu, selectedElectoralDistrict, fetchData]);

  const handleHourChange = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleDistrictChange = useCallback((gu: string | null, electoralDistrict: string | null) => {
    setSelectedGu(gu);
    setSelectedElectoralDistrict(electoralDistrict);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/" className="hover:text-gray-700">{t.nav.home}</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-gray-700">{t.nav.projects}</Link>
            <span>/</span>
            <span className="text-gray-900">{t.voterReach.breadcrumb}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.voterReach.title}
          </h1>
          <p className="mt-1 text-gray-600 text-sm">
            {t.voterReach.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Python', 'FastAPI', 'Next.js', 'Pandas', 'Geospatial', 'Seoul Metro'].map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Map and Ranking */}
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <SeoulMetroMapWrapper
              stations={stations}
              selectedHour={selectedHour}
              selectedGu={selectedGu}
            />
          </div>

          {/* District Selector and Station Ranking */}
          <div className="lg:col-span-1 space-y-4">
            <DistrictSelector
              onDistrictChange={handleDistrictChange}
              selectedGu={selectedGu}
              selectedElectoralDistrict={selectedElectoralDistrict}
            />
            <StationRanking
              stations={stations}
              isLoading={isLoading}
              error={error}
              selectedGu={selectedGu}
            />
          </div>
        </div>

        {/* Time Slider */}
        <TimeSlider
          selectedHour={selectedHour}
          onChange={handleHourChange}
        />

        {/* Station Trend Analysis */}
        <div className="mt-6">
          <StationTrendPanel selectedHour={selectedHour} />
        </div>

        {/* Stats Summary */}
        {!isLoading && stations.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">
                {locale === 'ko' ? '선택 시간' : 'Selected Time'}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedHour < 10 ? '0' : ''}{selectedHour}:00
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">
                {locale === 'ko' ? '최고 점수' : 'Top Score'}
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {stations[0]?.score.toFixed(1) || '-'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">
                {locale === 'ko' ? '1위 역' : 'Top Station'}
              </p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {stations[0]?.station_name || '-'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">
                {locale === 'ko' ? '선택 구역' : 'Selected District'}
              </p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {selectedGu || (locale === 'ko' ? '서울 전체' : 'All Seoul')}
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>{t.voterReach.disclaimer}</p>
          <p className="mt-1">{t.voterReach.dataSource}</p>
        </div>
      </main>
    </div>
  );
}
