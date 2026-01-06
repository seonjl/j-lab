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
  gu?: string;
  turnout_rate?: number;
}

interface StationRankingProps {
  stations: Station[];
  isLoading: boolean;
  error: string | null;
  selectedGu?: string | null;
}

export function StationRanking({ stations, isLoading, error, selectedGu }: StationRankingProps) {
  const { t, locale } = useLanguage();

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600">{t.voterReach.error}</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">
          {selectedGu
            ? `${selectedGu} ${t.voterReach.topStations}`
            : t.voterReach.topStations
          }
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {locale === 'ko' ? '유권자 접촉 점수 기준' : 'Based on voter reach score'}
        </p>
        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
          <span
            title={locale === 'ko' ? '해당 시간대 평균 승하차 인원' : 'Average boarding + alighting at this hour'}
            className="cursor-help border-b border-dotted border-gray-300"
          >
            {locale === 'ko' ? '인원=승하차' : 'Count=ridership'}
          </span>
          <span
            title={locale === 'ko' ? '해당 선거구의 투표 참여율' : 'Voter turnout rate for this district'}
            className="cursor-help border-b border-dotted border-gray-300 text-blue-500"
          >
            {locale === 'ko' ? '%=투표율' : '%=turnout'}
          </span>
          <span
            title={locale === 'ko' ? '점수 = 승하차인원 × 투표율 (높을수록 유권자 접촉 효과 높음)' : 'Score = ridership × turnout rate (higher = better voter reach)'}
            className="cursor-help border-b border-dotted border-gray-300 text-blue-600 font-medium"
          >
            {locale === 'ko' ? '점수=인원×투표율' : 'score=count×rate'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            {t.voterReach.loading}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {stations.map((station, index) => (
            <div
              key={station.station_id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              {/* Rank */}
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${index === 1 ? 'bg-gray-100 text-gray-600' : ''}
                  ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                  ${index > 2 ? 'bg-gray-50 text-gray-500' : ''}
                `}
              >
                {index + 1}
              </div>

              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {station.station_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span
                    title={locale === 'ko'
                      ? `${station.station_name}역 ${station.ridership.toLocaleString()}명 승하차 (해당 시간대 평균)`
                      : `${station.ridership.toLocaleString()} passengers at ${station.station_name} (hourly avg)`
                    }
                    className="cursor-help"
                  >
                    {station.ridership.toLocaleString()} {locale === 'ko' ? '명' : ''}
                  </span>
                  {station.turnout_rate && (
                    <span
                      title={locale === 'ko'
                        ? `${station.gu || '해당 지역'} 투표율: ${(station.turnout_rate * 100).toFixed(1)}%`
                        : `${station.gu || 'District'} turnout: ${(station.turnout_rate * 100).toFixed(1)}%`
                      }
                      className="text-blue-600 cursor-help"
                    >
                      {(station.turnout_rate * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div
                className="text-right"
                title={locale === 'ko'
                  ? `유권자 접촉 점수: ${station.score.toFixed(0)}\n(${station.ridership.toLocaleString()} × ${((station.turnout_rate || 0) * 100).toFixed(1)}% = ${station.score.toFixed(0)})`
                  : `Voter reach score: ${station.score.toFixed(0)}\n(${station.ridership.toLocaleString()} × ${((station.turnout_rate || 0) * 100).toFixed(1)}% = ${station.score.toFixed(0)})`
                }
              >
                <p className="text-sm font-semibold text-blue-600 cursor-help">
                  {station.score.toFixed(0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && stations.length === 0 && !error && (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">
            {locale === 'ko' ? '데이터가 없습니다' : 'No data available'}
          </p>
        </div>
      )}
    </div>
  );
}
