import React, { useState, useEffect } from 'react';
import { BranchOverlayCanvas, CuttingGuide } from '../components/simulator/BranchOverlayCanvas';
import { BeforeAfterSlider } from '../components/simulator/BeforeAfterSlider';
import { GrowthTimelineBar, GrowthStage } from '../components/simulator/GrowthTimelineBar';
import { QuoteRequestModal } from '../components/matching/QuoteRequestModal';
import { api } from '../services/api';
import { InspectBadge } from '../context/UiInspectContext';
import { Scissors, Sliders, Calendar, ArrowRight, ShieldCheck, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  simulationId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const SimulationResultPage: React.FC<Props> = ({ simulationId, onNavigate }) => {
  const [simulation, setSimulation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'beforeAfter' | 'growth'>('canvas');
  const [cutGuideIds, setCutGuideIds] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<GrowthStage>('immediatelyAfter');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [reRendering, setReRendering] = useState<boolean>(false);

  // 시뮬레이션 데이터 불러오기
  useEffect(() => {
    const fetchSimulation = async () => {
      setLoading(true);
      try {
        let simData = null;
        if (simulationId) {
          const res = await api.getSimulation(simulationId);
          if (res.success) simData = res.simulation;
        }
        if (!simData) {
          const listRes = await api.listSimulations();
          if (listRes.success && listRes.simulations.length > 0) {
            simData = listRes.simulations[0];
          }
        }
        setSimulation(simData);
      } catch (err) {
        console.error('Fetch simulation error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimulation();
  }, [simulationId]);

  // 가상 가위질 토글
  const handleToggleCutGuide = async (guideId: string) => {
    const nextCutIds = cutGuideIds.includes(guideId)
      ? cutGuideIds.filter(id => id !== guideId)
      : [...cutGuideIds, guideId];

    setCutGuideIds(nextCutIds);

    // 부분 가위질 실사 재합성 API 호출
    if (simulation?._id) {
      setReRendering(true);
      try {
        await api.reRenderSimulation(simulation._id, nextCutIds);
      } catch (err) {
        console.error('Re-render error:', err);
      } finally {
        setReRendering(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p>실사 수목 전지 분석 결과를 불러오는 중...</p>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="p-8 text-center text-slate-600">
        <p>시뮬레이션 데이터가 없습니다.</p>
        <button onClick={() => onNavigate('capture')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          나무 촬영하러 가기
        </button>
      </div>
    );
  }

  const { speciesName, targetGoal, originalImageUrl, cuttingGuides = [], simulatedImages } = simulation;

  // 현재 스테이지별 표시 이미지
  const currentGrowthImage = simulatedImages[currentStage === 'immediatelyAfter' ? 'immediatelyAfterUrl' : currentStage === 'after6Months' ? 'after6MonthsUrl' : currentStage === 'after1Year' ? 'after1YearUrl' : 'after3YearsUrl'] || simulatedImages.immediatelyAfterUrl;

  return (
    <div className="space-y-4 pb-24">
      <InspectBadge serialId="P03-SEC01-CRD01" itemName="실사 전지 및 미래 생장 시뮬레이션 결과 화면" />

      {/* 상단 수종 & 목적 안내 */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            AI 실사 분석 완료
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 mt-1">{speciesName}</h2>
          <p className="text-xs text-slate-500">{targetGoal}</p>
        </div>

        {cutGuideIds.length > 0 && (
          <button
            onClick={() => setCutGuideIds([])}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
          >
            <RefreshCw className="w-3 h-3" />
            <span>가위질 초기화</span>
          </button>
        )}
      </div>

      {/* 3대 뷰어 탭 전환기 */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'canvas' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>가상 가위질</span>
        </button>
        <button
          onClick={() => setActiveTab('beforeAfter')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'beforeAfter' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>전/후 비교</span>
        </button>
        <button
          onClick={() => setActiveTab('growth')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'growth' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>3년 생장 예측</span>
        </button>
      </div>

      {/* 인터랙티브 뷰어 본체 */}
      <div className="space-y-3">
        {activeTab === 'canvas' && (
          <div className="space-y-2">
            <BranchOverlayCanvas
              imageUrl={originalImageUrl}
              cuttingGuides={cuttingGuides}
              cutGuideIds={cutGuideIds}
              onToggleCutGuide={handleToggleCutGuide}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>제거 대상 가지: {cuttingGuides.length}개</span>
              <span className="font-bold text-emerald-600">
                가상 자른 가지: {cutGuideIds.length}개 ({Math.min(cutGuideIds.length * 7, 28)}% 엽량 감축)
              </span>
            </div>
          </div>
        )}

        {activeTab === 'beforeAfter' && (
          <BeforeAfterSlider
            beforeUrl={originalImageUrl}
            afterUrl={simulatedImages.immediatelyAfterUrl}
          />
        )}

        {activeTab === 'growth' && (
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-700">
              <img
                src={currentGrowthImage}
                alt="미래 생장 시뮬레이션 실사"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                생장 예측 단계: {currentStage === 'immediatelyAfter' ? '전지 직후' : currentStage === 'after6Months' ? '6개월 후 (신초)' : currentStage === 'after1Year' ? '1년 후 (수관 형성)' : '3년 후 (완성 수형)'}
              </div>
            </div>

            <GrowthTimelineBar
              currentStage={currentStage}
              onSelectStage={setCurrentStage}
            />
          </div>
        )}
      </div>

      {/* 10대 골든 룰 AI 코멘트 카드 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs">
        <InspectBadge serialId="P03-SEC03-CRD01" itemName="수목학적 전지 코멘트 카드" />
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>수목학적 전지 평가 및 골든 룰 준수 리포트</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          원줄기 쪽의 <strong>'지융부(Branch Collar)'</strong>를 다치지 않게 바깥눈 위 45도 각도로 잘라 캘러스(새살)가 빠르게 차오르도록 안내되었습니다.
          1회 엽량 절제율이 25% 미만으로 유지되어 수목 스트레스 없이 왕성한 수세가 유지됩니다.
        </p>
      </div>

      {/* 하단 고정 CTA 버튼 (조경사 매칭 직결 - 하단 네비게이션 바 바로 위) */}
      <div className="fixed bottom-[53px] left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-slate-200 z-30 max-w-md mx-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          data-serial-id="P03-SEC04-BTN01"
          className="relative w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <InspectBadge serialId="P03-SEC04-BTN01" itemName="이 수형대로 전문 조경사에게 견적 받기 버튼" />
          <Send className="w-4 h-4" />
          <span>이 수형대로 전문 조경사에게 견적 받기</span>
        </button>
      </div>

      {/* 견적 요청 모달 */}
      <QuoteRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        simulationId={simulation._id}
        simulationImage={simulatedImages.after3YearsUrl || simulatedImages.immediatelyAfterUrl}
        speciesName={speciesName}
        onSuccess={() => onNavigate('matching')}
      />
    </div>
  );
};

