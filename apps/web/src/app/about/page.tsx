'use client';

import { useLanguage } from '@/lib/i18n';

export default function AboutPage() {
  const { t, locale } = useLanguage();

  const researchInterests = [
    {
      title: t.research.evidenceBased,
      description: t.research.evidenceBasedDesc,
    },
    {
      title: t.research.mlPolicy,
      description: t.research.mlPolicyDesc,
    },
    {
      title: t.research.publicFinance,
      description: t.research.publicFinanceDesc,
    },
    {
      title: t.research.quantitative,
      description: t.research.quantitativeDesc,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-2">{t.about.title}</h1>
          <p className="text-gray-300">
            {t.about.subtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.about.introduction}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t.about.introText}
            </p>
          </section>

          {/* Education */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.about.education}</h2>
            <div className="border border-gray-200 rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">KDI School of Public Policy and Management</h3>
                  <p className="text-sm text-gray-600">Master of Development Studies (MDS) - Data Science Track</p>
                </div>
                <span className="text-sm text-gray-500">Expected 2025</span>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.about.skills}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t.common.programming}</h3>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'TypeScript', 'R', 'SQL'].map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t.common.mlAnalytics}</h3>
                <div className="flex flex-wrap gap-2">
                  {['scikit-learn', 'XGBoost', 'Pandas', 'NumPy'].map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Web Development</h3>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'React', 'FastAPI', 'Node.js'].map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t.common.webInfra}</h3>
                <div className="flex flex-wrap gap-2">
                  {['Docker', 'AWS', 'DynamoDB', 'Git'].map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Research Interests */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.about.researchInterests}</h2>
            <div className="space-y-3">
              {researchInterests.map((interest) => (
                <div key={interest.title} className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{interest.title}</h3>
                  <p className="text-sm text-gray-600">{interest.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.about.contact}</h2>
            <div className="border border-gray-200 rounded p-5">
              <p className="text-gray-600 text-sm mb-4">
                {t.about.contactText}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:email@example.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors"
                >
                  Email
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
