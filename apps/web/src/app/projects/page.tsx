import Link from 'next/link';

const PROJECTS = [
  {
    id: 'pension-simulator',
    title: '국민연금 재정 시뮬레이터',
    description: '보험료율, 소득대체율 등 정책 변수를 조정하여 기금 고갈 시점을 예측하고, ML 기반 분석으로 세대간 형평성과 불확실성을 시각화합니다.',
    tags: ['Python', 'FastAPI', 'Next.js', 'ML', 'Monte Carlo'],
    href: '/projects/pension-simulator',
    status: 'Active',
    year: '2024',
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Projects</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            정책 분석과 데이터 사이언스를 결합한 프로젝트 모음입니다.
            각 프로젝트는 실제 데이터와 분석 기법을 활용하여 policy insight를 도출합니다.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {PROJECTS.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500">{project.year}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {project.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
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
          ))}

          {/* Placeholder for future projects */}
          <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <p className="text-gray-500 font-medium">More projects coming soon</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
