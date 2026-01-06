'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export default function Home() {
  const { t } = useLanguage();

  const researchAreas = [
    {
      title: t.research.evidenceBased,
      description: t.research.evidenceBasedDesc,
    },
    {
      title: t.research.mlPolicy,
      description: t.research.mlPolicyDesc,
    },
    {
      title: t.research.quantitative,
      description: t.research.quantitativeDesc,
    },
    {
      title: t.research.publicFinance,
      description: t.research.publicFinanceDesc,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-blue-400 text-sm font-medium mb-3 tracking-wide uppercase">
              {t.home.subtitle}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {t.home.title}
            </h1>
            <p className="text-gray-300 leading-relaxed mb-6">
              {t.home.description}
            </p>
            <div className="flex gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                {t.home.viewProjects}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-5 py-2.5 border border-gray-500 text-gray-300 text-sm font-medium rounded hover:bg-gray-800 transition-colors"
              >
                {t.home.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-12 md:py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.home.researchAreas}</h2>
            <p className="text-gray-600 text-sm">
              {t.home.researchAreasDesc}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {researchAreas.map((area) => (
              <div
                key={area.title}
                className="p-5 border border-gray-200 rounded hover:border-gray-300 transition-colors"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {area.title}
                </h3>
                <p className="text-sm text-gray-600">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.home.featuredProject}</h2>
            <p className="text-gray-600 text-sm">
              {t.home.featuredProjectDesc}
            </p>
          </div>

          <Link
            href="/projects/pension-simulator"
            className="block max-w-3xl bg-white border border-gray-200 rounded overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  {t.projects.active}
                </span>
                <span className="text-xs text-gray-500">2024</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.pension.title}
              </h3>
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
        </div>
      </section>

      {/* Skills */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.home.skills}</h2>
            <p className="text-gray-600 text-sm">
              {t.home.skillsDesc}
            </p>
          </div>
          <div className="max-w-3xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.common.programming}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'TypeScript', 'R', 'SQL'].map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.common.mlAnalytics}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['scikit-learn', 'XGBoost', 'Pandas', 'NumPy'].map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.common.webInfra}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'FastAPI', 'Docker', 'AWS'].map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 md:py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.home.contact}</h2>
            <p className="text-gray-600 text-sm mb-4">
              {t.home.contactDesc}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {t.home.learnMore}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
