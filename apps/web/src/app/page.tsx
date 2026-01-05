import Link from 'next/link';

const FEATURED_PROJECTS = [
  {
    id: 'pension-simulator',
    title: '국민연금 재정 시뮬레이터',
    description: '보험료율, 소득대체율 등 정책 변수를 조정하여 기금 고갈 시점을 예측하고, ML 기반 분석으로 세대간 형평성과 불확실성을 시각화합니다.',
    tags: ['Python', 'FastAPI', 'Next.js', 'ML', 'Monte Carlo'],
    href: '/projects/pension-simulator',
    featured: true,
  },
];

const RESEARCH_INTERESTS = [
  {
    icon: '📊',
    title: 'Evidence-Based Policy',
    description: '데이터와 통계적 분석에 기반한 정책 효과 검증',
  },
  {
    icon: '🤖',
    title: 'Machine Learning for Policy',
    description: 'ML/AI 기법을 활용한 정책 예측 및 최적화',
  },
  {
    icon: '📈',
    title: 'Quantitative Analysis',
    description: '정책 영향의 정량적 분석 및 시뮬레이션',
  },
  {
    icon: '🌐',
    title: 'Public Finance',
    description: '재정 지속가능성과 세대간 형평성 연구',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <p className="text-primary-400 font-medium mb-4 tracking-wide">
              Public Policy & Data Science
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Bridging Policy Analysis with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Data Science
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              정책 분석과 데이터 사이언스를 결합하여 evidence-based policy research를 수행합니다.
              머신러닝과 시뮬레이션 기법을 활용한 공공정책 연구에 관심이 있습니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Projects
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                About Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research Interests */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Research Interests</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              공공정책과 데이터 사이언스의 교차점에서 연구를 진행합니다
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESEARCH_INTERESTS.map((interest) => (
              <div
                key={interest.title}
                className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="text-3xl mb-4">{interest.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {interest.title}
                </h3>
                <p className="text-sm text-gray-600">{interest.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Project</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              정책 분석과 ML을 결합한 대표 프로젝트입니다
            </p>
          </div>

          {FEATURED_PROJECTS.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              className="block max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  {project.featured && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  View Project
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Skills & Tools */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Skills & Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              정책 분석과 데이터 사이언스에 활용하는 기술 스택
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Programming */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Programming
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'TypeScript', 'R', 'SQL'].map((skill) => (
                    <span key={skill} className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* ML & Analytics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  ML & Analytics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['scikit-learn', 'XGBoost', 'SHAP', 'Pandas'].map((skill) => (
                    <span key={skill} className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Web & Infra */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Web & Infra
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'FastAPI', 'Docker', 'AWS'].map((skill) => (
                    <span key={skill} className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Interested in Collaboration?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            정책 분석, 데이터 사이언스 관련 협업이나 문의는 언제든 환영합니다.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
