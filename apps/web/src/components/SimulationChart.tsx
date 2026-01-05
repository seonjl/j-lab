'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { YearlyResult } from '@npfs/types';

interface SimulationChartProps {
  data: YearlyResult[];
}

export function SimulationChart({ data }: SimulationChartProps) {
  // 10년 단위로 데이터 필터링 (차트 가독성)
  const chartData = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">기금 잔액 추이</h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}조`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  fundBalance: '기금 잔액',
                  contributionIncome: '보험료 수입',
                  benefitExpenditure: '급여 지출',
                };
                return [`${value.toLocaleString()}조원`, labels[name] || name];
              }}
              labelFormatter={(label) => `${label}년`}
            />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  fundBalance: '기금 잔액',
                  contributionIncome: '보험료 수입',
                  benefitExpenditure: '급여 지출',
                };
                return labels[value] || value;
              }}
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="fundBalance"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="contributionIncome"
              stroke="#16a34a"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="benefitExpenditure"
              stroke="#dc2626"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
