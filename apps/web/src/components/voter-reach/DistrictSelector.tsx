'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

interface District {
  gu: string;
  electoral_districts: string[];
  center: { lat: number; lng: number };
  bounds: { north: number; south: number; east: number; west: number };
}

interface DistrictSelectorProps {
  onDistrictChange: (gu: string | null, electoralDistrict: string | null) => void;
  selectedGu: string | null;
  selectedElectoralDistrict: string | null;
}

export function DistrictSelector({
  onDistrictChange,
  selectedGu,
  selectedElectoralDistrict,
}: DistrictSelectorProps) {
  const { locale } = useLanguage();
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch('/api/voter-reach/districts');
        if (response.ok) {
          const data = await response.json();
          setDistricts(data);
        }
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  const handleGuChange = (gu: string) => {
    if (gu === '') {
      // "All Seoul" selected
      onDistrictChange(null, null);
    } else {
      // New gu selected, reset electoral district
      onDistrictChange(gu, null);
    }
  };

  const handleElectoralDistrictClick = (ed: string) => {
    if (selectedElectoralDistrict === ed) {
      // Deselect
      onDistrictChange(selectedGu, null);
    } else {
      onDistrictChange(selectedGu, ed);
    }
  };

  const selectedDistrict = districts.find(d => d.gu === selectedGu);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-9 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        {locale === 'ko' ? '선거구 선택' : 'Select District'}
      </h3>

      {/* Gu Selector */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">
          {locale === 'ko' ? '행정구' : 'Administrative District'}
        </label>
        <select
          value={selectedGu || ''}
          onChange={(e) => handleGuChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {locale === 'ko' ? '서울 전체' : 'All Seoul'}
          </option>
          {districts.map((district) => (
            <option key={district.gu} value={district.gu}>
              {district.gu}
            </option>
          ))}
        </select>
      </div>

      {/* Electoral District Selector (shown when gu is selected) */}
      {selectedGu && selectedDistrict && (
        <div>
          <label className="text-xs text-gray-500 mb-2 block">
            {locale === 'ko' ? '국회의원 선거구' : 'Electoral District'}
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedDistrict.electoral_districts.map((ed) => {
              const isSelected = selectedElectoralDistrict === ed;
              // Extract just the suffix (갑, 을, 병)
              const suffix = ed.replace(selectedGu, '');

              return (
                <button
                  key={ed}
                  onClick={() => handleElectoralDistrictClick(ed)}
                  className={`
                    px-3 py-1.5 text-sm rounded-full transition-colors
                    ${isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {suffix || ed}
                </button>
              );
            })}
            <button
              onClick={() => onDistrictChange(selectedGu, null)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${!selectedElectoralDistrict
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {locale === 'ko' ? '전체' : 'All'}
            </button>
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      {selectedGu && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {locale === 'ko' ? '선택됨: ' : 'Selected: '}
            <span className="font-medium text-gray-900">
              {selectedGu}
              {selectedElectoralDistrict && ` > ${selectedElectoralDistrict}`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
