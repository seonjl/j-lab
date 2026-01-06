'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface RidershipData {
  station_id: string;
  station_name: string;
  hour: number;
  avg_boarding: number;
  avg_alighting: number;
  total: number;
}

interface StationOption {
  id: string;
  name: string;
  line: string;
}

interface StationTrendPanelProps {
  selectedHour: number;
  onStationSelect?: (stationId: string | null) => void;
}

export function StationTrendPanel({ selectedHour, onStationSelect }: StationTrendPanelProps) {
  const { locale } = useLanguage();
  const [stations, setStations] = useState<StationOption[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hourlyData, setHourlyData] = useState<RidershipData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all stations on mount
  useEffect(() => {
    async function fetchStations() {
      try {
        const response = await fetch('/api/voter-reach/stations');
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        }
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      }
    }
    fetchStations();
  }, []);

  // Fetch hourly data when station is selected
  useEffect(() => {
    if (!selectedStation) {
      setHourlyData([]);
      return;
    }

    const stationId = selectedStation.id;

    async function fetchHourlyData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/voter-reach/ridership?station_id=${stationId}`);
        if (response.ok) {
          const data = await response.json();
          // Sort by hour
          data.sort((a: RidershipData, b: RidershipData) => a.hour - b.hour);
          setHourlyData(data);
        }
      } catch (error) {
        console.error('Failed to fetch ridership data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHourlyData();
  }, [selectedStation]);

  // Filter stations based on search query
  const filteredStations = useMemo(() => {
    if (!searchQuery) return stations.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return stations
      .filter(s => s.name.toLowerCase().includes(query) || s.id.includes(query))
      .slice(0, 20);
  }, [stations, searchQuery]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return hourlyData.map(d => ({
      hour: d.hour,
      hourLabel: `${d.hour.toString().padStart(2, '0')}:00`,
      boarding: d.avg_boarding,
      alighting: d.avg_alighting,
      total: d.avg_boarding + d.avg_alighting,
    }));
  }, [hourlyData]);

  // Find peak hours
  const peakInfo = useMemo(() => {
    if (chartData.length === 0) return null;
    const maxEntry = chartData.reduce((max, curr) => curr.total > max.total ? curr : max, chartData[0]);
    return {
      hour: maxEntry.hour,
      total: maxEntry.total,
    };
  }, [chartData]);

  // Current hour data
  const currentHourData = useMemo(() => {
    return chartData.find(d => d.hour === selectedHour);
  }, [chartData, selectedHour]);

  const handleStationSelect = (station: StationOption) => {
    setSelectedStation(station);
    setSearchQuery(station.name);
    setIsDropdownOpen(false);
    onStationSelect?.(station.id);
  };

  const handleClear = () => {
    setSelectedStation(null);
    setSearchQuery('');
    setHourlyData([]);
    onStationSelect?.(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">
          {locale === 'ko' ? '역별 시간대 분석' : 'Station Hourly Analysis'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {locale === 'ko' ? '특정 역의 시간대별 이용객 추이' : 'Hourly ridership trend for a station'}
        </p>
      </div>

      {/* Station Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
              if (selectedStation && e.target.value !== selectedStation.name) {
                setSelectedStation(null);
              }
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={locale === 'ko' ? '역 이름 검색...' : 'Search station...'}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {(searchQuery || selectedStation) && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Dropdown */}
          {isDropdownOpen && !selectedStation && filteredStations.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleStationSelect(station)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex justify-between items-center"
                >
                  <span>{station.name}</span>
                  <span className="text-xs text-gray-400">{station.line}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4">
        {!selectedStation ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            {locale === 'ko' ? '역을 선택하면 시간대별 이용객 추이가 표시됩니다' : 'Select a station to view hourly trends'}
          </div>
        ) : isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {peakInfo && currentHourData && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 mb-1">
                    {locale === 'ko' ? '선택 시간 이용객' : 'Current Hour'}
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    {currentHourData.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-500">
                    {selectedHour.toString().padStart(2, '0')}:00
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 mb-1">
                    {locale === 'ko' ? '피크 시간' : 'Peak Hour'}
                  </p>
                  <p className="text-lg font-bold text-orange-700">
                    {peakInfo.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-500">
                    {peakInfo.hour.toString().padStart(2, '0')}:00
                  </p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorBoarding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAlighting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(h) => `${h}`}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'boarding'
                        ? (locale === 'ko' ? '승차' : 'Boarding')
                        : (locale === 'ko' ? '하차' : 'Alighting')
                    ]}
                    labelFormatter={(hour) => `${String(hour).padStart(2, '0')}:00`}
                  />
                  <ReferenceLine
                    x={selectedHour}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="boarding"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorBoarding)"
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="alighting"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorAlighting)"
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500"></span>
                {locale === 'ko' ? '승차' : 'Boarding'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                {locale === 'ko' ? '하차' : 'Alighting'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-red-500"></span>
                {locale === 'ko' ? '선택 시간' : 'Selected'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
