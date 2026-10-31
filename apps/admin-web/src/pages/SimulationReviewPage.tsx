import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { PruningCanvasEditor } from '../components/studio/PruningCanvasEditor';
import { InspectBadge } from '../context/UiInspectContext';
import { ShieldCheck, CheckCircle, Save, Sparkles, AlertCircle } from 'lucide-react';

export const SimulationReviewPage: React.FC = () => {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [selectedSim, setSelectedSim] = useState<any>(null);
  const [currentGuides, setCurrentGuides] = useState<any[]>([]);
  const [adminNote, setAdminNote] = useState<string>('지융부 보존 룰셋 일치 및 외아 45도 절단선 검수 완료');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const res = await adminApi.getSimulations();
        if (res.success && res.simulations.length > 0) {
          setSimulations(res.simulations);
          setSelectedSim(res.simulations[0]);
          setCurrentGuides(res.simulations[0].cuttingGuides || []);
        }
      } catch (err) {
        console.error('Fetch simulations error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimulations();
  }, []);

  const handleSelectSim = (sim: any) => {
    setSelectedSim(sim);
    setCurrentGuides(sim.cuttingGuides || []);
  };

  const handleSaveReview = async () => {
    if (!selectedSim) return;
    setSaving(true);
    try {
      const res = await adminApi.reviewSimulation(selectedSim._id, {
        cuttingGuides: currentGuides,
        adminReviewNote: adminNote
      });
      if (res.success) {
        alert('절단선 검수가 완료되었으며 고품질 AI 학습 데이터셋으로 공식 승인되었습니다!');
      }
    } catch (err: any) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">시뮬레이션 검수 데이터 로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <InspectBadge serialId="P53-SEC01-CRD01" itemName="AI 전지 검수 및 전문가 Canvas 첨삭 스튜디오 화면" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">전문가 Canvas 전지 첨삭 스튜디오</h2>
          <p className="text-xs text-slate-500 mt-1">
            사용자가 생성한 AI 전지 절단선을 검수하고, 교정된 고품질 절단 데이터를 모델 학습용으로 축적합니다.
          </p>
        </div>
        <button
          onClick={handleSaveReview}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '학습셋 반영 중...' : '검수 승인 & AI 학습셋 반영'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 검수 대상 시뮬레이션 목록 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700">검수 대기 시뮬레이션 목록</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {simulations.map(sim => {
              const isSelected = selectedSim?._id === sim._id;
              return (
                <div
                  key={sim._id}
                  onClick={() => handleSelectSim(sim)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                    isSelected ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <img
                    src={sim.originalImageUrl}
                    alt={sim.speciesName}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-bold text-slate-900 truncate">{sim.speciesName}</span>
                      {sim.isReviewedByAdmin && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                          검수완료
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{sim.targetGoal}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                      절단 포인트 {sim.cuttingGuides?.length || 0}개
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 중앙 & 우측: Canvas 에디터 & 첨삭 코멘트 패널 */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSim && (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <PruningCanvasEditor
                  imageUrl={selectedSim.originalImageUrl}
                  guides={currentGuides}
                  onChangeGuides={setCurrentGuides}
                />
              </div>

              {/* 검수 코멘트 & 룰셋 체크리스트 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>수목 생리학적 10대 골든 룰 검수 메모</span>
                </h4>

                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl text-xs resize-none"
                  placeholder="AI 학습용 정답 라벨 코멘트를 입력하세요"
                />

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>지융부(Branch Collar) 훼손 없는 기부 절단</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>외아(바깥눈) 위 45도 사선 절단선 준수</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

