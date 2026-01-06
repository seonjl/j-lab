'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export default function ProjectsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.projects.title}</h1>
          <p className="text-gray-600">
            {t.projects.description}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          <Link
            href="/projects/pension-simulator"
            className="block bg-white border border-gray-200 rounded overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  {t.projects.active}
                </span>
                <span className="text-xs text-gray-500">2024</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t.pension.title}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t.pension.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'FastAPI', 'Next.js', 'scikit-learn', 'Monte Carlo'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Voter Reach Optimizer */}
          <Link
            href="/projects/voter-reach"
            className="block bg-white border border-gray-200 rounded overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  {t.projects.active}
                </span>
                <span className="text-xs text-gray-500">2024</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t.voterReach.title}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t.voterReach.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'FastAPI', 'Next.js', 'Pandas', 'Geospatial'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
