export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Research</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            정책 분석과 데이터 사이언스 관련 연구 자료 및 방법론 문서입니다.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Methodology Documents */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Methodology</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      국민연금 재정 시뮬레이션 방법론
                    </h3>
                    <p className="text-gray-600 mb-3">
                      국민연금 기금 고갈 시점 예측을 위한 시뮬레이션 모델 설계 및 ML 분석 기법 설명
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Monte Carlo</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">K-means</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">SHAP</span>
                    </div>
                    <span className="text-sm text-primary-600 font-medium">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Working Papers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Working Papers</h2>
            <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-600 font-medium">Working papers will be added here</p>
              <p className="text-gray-500 text-sm mt-1">정책 분석 관련 연구 논문 및 보고서</p>
            </div>
          </section>

          {/* Data Sources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Sources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">통계청 장래인구추계</h3>
                <p className="text-sm text-gray-600">2022년 기준 인구 전망 데이터</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">국민연금 재정계산</h3>
                <p className="text-sm text-gray-600">제5차 재정계산(2023) 결과</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">국민연금공단</h3>
                <p className="text-sm text-gray-600">연금 통계 및 제도 정보</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">한국은행 경제통계</h3>
                <p className="text-sm text-gray-600">거시경제 지표 데이터</p>
              </div>
            </div>
          </section>

          {/* References */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">References</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">[1]</span>
                  <span>국민연금재정추계위원회. (2023). 제5차 국민연금 재정계산 결과보고서.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">[2]</span>
                  <span>통계청. (2022). 장래인구추계: 2020~2070년.</span>
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
