import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InspectBadge } from '../context/UiInspectContext';
import { MapPin, DollarSign, Calendar, Send, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';

export const PartnerJobBoardPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeReq, setActiveReq] = useState<any>(null);

  // 견적 작성 폼 상태
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(550000);
  const [laborCost, setLaborCost] = useState<number>(380000);
  const [equipmentCost, setEquipmentCost] = useState<number>(80000);
  const [wasteDisposalCost, setWasteDisposalCost] = useState<number>(90000);
  const [availableDate, setAvailableDate] = useState<string>('2026-11-14');
  const [expertComment, setExpertComment] = useState<string>('지융부를 온전히 보존하고 바깥눈 45도 사선 절단으로 3년 후 완성 수형까지 고려하여 정성껏 작업하겠습니다. 유합제 도포 포함.');

  // 시공 완료 보고 폼 상태
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [workSummary, setWorkSummary] = useState<string>('도장지 6개 및 내향지 10개 지융부 보존 절단 완료. 상처면 유합제 도포 및 잔가지 트럭 수거 마감.');

  const fetchJobBoard = async () => {
    try {
      const res = await api.getMatchingRequests();
      if (res.success) {
        setRequests(res.requests);
        if (res.requests.length > 0) setActiveReq(res.requests[0]);
      }
    } catch (err) {
      console.error('Fetch job board error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobBoard();
  }, []);

  const handlePriceChange = (val: number) => {
    setPrice(val);
    setLaborCost(Math.round(val * 0.7));
    setEquipmentCost(Math.round(val * 0.15));
    setWasteDisposalCost(Math.round(val * 0.15));
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    try {
      await api.submitQuote(activeReq._id, {
        price,
        priceBreakdown: { laborCost, equipmentCost, wasteDisposalCost },
        availableDate,
        expertComment
      });
      alert('정밀 입찰 견적서가 고객님께 성공적으로 발송되었습니다!');
      setIsQuoteModalOpen(false);
      fetchJobBoard();
    } catch (err: any) {
      alert(`견적 제출 실패: ${err.message}`);
    }
  };

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    try {
      await api.completeJob(activeReq._id, {
        beforeImages: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'],
        afterImages: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'],
        workSummary
      });
      alert('시공 완료 보고서가 제출되었으며 정원주의 타임라인에 자동 아카이빙되었습니다!');
      setIsCompleteModalOpen(false);
      fetchJobBoard();
    } catch (err: any) {
      alert(`보고서 제출 실패: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">작업 요청 목록 불러오는 중...</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      <InspectBadge serialId="P07-SEC01-CRD01" itemName="조경사 파트너 잡보드 및 입찰/보고 화면" />

      {/* 조경사 파트너 헤더 */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">
            전문 조경사 파트너 모드
          </span>
          <span className="text-xs text-slate-400">내 활동 반경 내 일감</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">주변 정원 작업 요청 (Job Board)</h2>
        <p className="text-xs text-slate-400 mt-1">
          고객이 첨부한 AI 목표 수형을 확인하고 기술 견적서를 입찰하세요.
        </p>
      </div>

      {/* 일감 목록 */}
      <div className="space-y-3">
        {requests.map(req => {
          const isSelected = activeReq?._id === req._id;
          const sim = req.simulationIds?.[0];

          return (
            <div
              key={req._id}
              onClick={() => setActiveReq(req)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'MATCHED' ? 'bg-indigo-100 text-indigo-800' : req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {req.status === 'MATCHED' ? '내게 시공 배정됨' : req.status === 'COMPLETED' ? '시공완료' : '견적 입찰중'}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{req.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">희망 예산</span>
                  <span className="text-xs font-bold text-slate-700">~{req.budgetRange?.max?.toLocaleString()}원</span>
                </div>
              </div>

              {/* 고객이 첨부한 AI 시뮬레이션 목표 수형 썸네일 */}
              {sim && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 mb-2.5">
                  <img
                    src={sim.simulatedImages?.immediatelyAfterUrl || sim.originalImageUrl}
                    alt="고객 목표 수형"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="text-[11px] min-w-0">
                    <span className="font-bold text-emerald-800 block truncate">
                      🎯 고객 희망: {sim.speciesName} ({sim.targetGoal})
                    </span>
                    <span className="text-slate-500 text-[10px] block">
                      AI 절단 가이드라인 {sim.cuttingGuides?.length || 0}개 지점 첨부됨
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">{req.description}</p>

              {/* 하단 액션 버튼 */}
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                {req.status === 'MATCHED' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReq(req);
                      setIsCompleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>시공 완료 보고서 제출하기</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReq(req);
                      setIsQuoteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>상세 견적서 입찰하기</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 조경사 견적서 작성 모달 */}
      {isQuoteModalOpen && activeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">맞춤 견적서(입찰) 발송</h3>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">총 견적 금액 (원)</label>
                <input
                  type="number"
                  step="10000"
                  value={price}
                  onChange={e => handlePriceChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-sm text-emerald-700"
                  required
                />
              </div>

              {/* 3대 표준 내역 분리 */}
              <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                <span className="font-bold text-slate-600 block text-[10px]">투명 견적 내역 (10대 골든 룰 기준)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9.5px] text-slate-400">기술 인건비</label>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={e => setLaborCost(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400">장비비</label>
                    <input
                      type="number"
                      value={equipmentCost}
                      onChange={e => setEquipmentCost(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400">폐기물 처리</label>
                    <input
                      type="number"
                      value={wasteDisposalCost}
                      onChange={e => setWasteDisposalCost(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">시공 가능 일자</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={e => setAvailableDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">전문가 제안 코멘트</label>
                <textarea
                  value={expertComment}
                  onChange={e => setExpertComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs"
              >
                견적서 고객에게 발송
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 시공 완료 보고서 모달 */}
      {isCompleteModalOpen && activeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">현장 시공 완료 보고서 제출</h3>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCompleteJob} className="space-y-3">
              <p className="text-slate-500 text-[11px]">
                실제 시공 완료된 전/후 사진과 향후 관리 당부사항을 등록하면 고객의 정원 타임라인에 자동 아카이빙됩니다.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">작업 내역 및 정원주 관리 팁 요약</label>
                <textarea
                  value={workSummary}
                  onChange={e => setWorkSummary(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-xl text-xs resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs"
              >
                시공 완료 보고서 제출 및 정산 요청
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

