'use client';

import { useLanguage } from '@/lib/i18n';

interface TimeSliderProps {
  selectedHour: number;
  onChange: (hour: number) => void;
}

const TIME_MARKS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

export function TimeSlider({ selectedHour, onChange }: TimeSliderProps) {
  const { t, locale } = useLanguage();

  const formatHour = (hour: number) => {
    const displayHour = hour === 24 ? 0 : hour;
    const period = locale === 'ko'
      ? (hour < 12 ? '오전' : hour < 24 ? '오후' : '오전')
      : (hour < 12 ? 'AM' : hour < 24 ? 'PM' : 'AM');
    const h12 = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour;
    return `${period} ${h12}${t.voterReach.hour}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          {t.voterReach.timeSlider}
        </h3>
        <span className="text-sm font-semibold text-blue-600">
          {formatHour(selectedHour)}
        </span>
      </div>

      <div className="relative pt-1">
        <input
          type="range"
          min="6"
          max="24"
          step="1"
          value={selectedHour}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        {/* Time marks */}
        <div className="flex justify-between mt-2 px-0.5">
          {TIME_MARKS.map((hour) => (
            <button
              key={hour}
              onClick={() => onChange(hour)}
              className={`
                text-xs transition-colors
                ${selectedHour === hour
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              {hour === 24 ? '24' : hour < 10 ? `0${hour}` : hour}
            </button>
          ))}
        </div>
      </div>

      {/* Time period indicators */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span>{locale === 'ko' ? '출근 시간대' : 'Morning Rush'}</span>
        <span>{locale === 'ko' ? '점심 시간' : 'Lunch'}</span>
        <span>{locale === 'ko' ? '퇴근 시간대' : 'Evening Rush'}</span>
      </div>
    </div>
  );
}
