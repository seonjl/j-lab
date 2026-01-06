'use client';

import { useLanguage } from '@/lib/i18n';

export default function ResearchPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.researchPage.title}</h1>
          <p className="text-gray-600">
            {t.researchPage.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl">
          {/* Methodology Documents */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.researchPage.methodology}</h2>
            <div className="bg-white border border-gray-200 rounded p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {t.pension.title} - {t.researchPage.methodology}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Monte Carlo, K-means Clustering, Gradient Boosting
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Monte Carlo</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">K-means</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">SHAP</span>
                  </div>
                  <span className="text-sm text-blue-600">{t.researchPage.comingSoon}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Working Papers */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.researchPage.workingPapers}</h2>
            <div className="bg-white border border-dashed border-gray-300 rounded p-8 text-center">
              <p className="text-gray-400 text-sm">{t.researchPage.workingPapersDesc}</p>
              <p className="text-gray-400 text-xs mt-1">{t.researchPage.comingSoon}</p>
            </div>
          </section>

          {/* Data Sources */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.researchPage.dataSources}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="font-medium text-gray-900 mb-1">Statistics Korea</h3>
                <p className="text-sm text-gray-600">Population Projection (2022)</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="font-medium text-gray-900 mb-1">National Pension Service</h3>
                <p className="text-sm text-gray-600">5th Actuarial Valuation (2023)</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="font-medium text-gray-900 mb-1">NPS Statistics</h3>
                <p className="text-sm text-gray-600">Pension Statistics and System Info</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-4">
                <h3 className="font-medium text-gray-900 mb-1">Bank of Korea</h3>
                <p className="text-sm text-gray-600">Economic Statistics</p>
              </div>
            </div>
          </section>

          {/* References */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.researchPage.references}</h2>
            <div className="bg-white border border-gray-200 rounded p-5">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">[1]</span>
                  <span>National Pension Financial Projection Committee. (2023). 5th National Pension Actuarial Valuation Report.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">[2]</span>
                  <span>Statistics Korea. (2022). Population Projections: 2020-2070.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">[3]</span>
                  <span>Lundberg, S. M., & Lee, S. I. (2017). A unified approach to interpreting model predictions. NeurIPS.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
