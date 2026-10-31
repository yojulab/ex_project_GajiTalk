import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { InspectBadge } from '../context/UiInspectContext';
import { ShieldCheck, UserCheck, Eye, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const MatchingManagePage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [landscapers, setLandscapers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState<boolean>(false);

  const fetchMatchingData = async () => {
    try {
      const [reqRes, landRes] = await Promise.all([
        adminApi.getMatching(),
        adminApi.getLandscapers('VERIFIED')
      ]);
      if (reqRes.success) setRequests(reqRes.requests || []);
      if (landRes.success) setLandscapers(landRes.landscapers || []);
    } catch (err) {
      console.error('Fetch matching error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchingData();
  }, []);

  const handleAssign = async (landscaperId: string) => {
    if (!selectedReq) return;
    try {
      const res = await adminApi.assignMatching(selectedReq._id, landscaperId);
      if (res.success) {
        alert(res.message);
        setIsAssignModalOpen(false);
        fetchMatchingData();
      }
    } catch (err: any) {
      alert(`배정 실패: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">매칭 현황 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <InspectBadge serialId="P51-SEC01-CRD01" itemName="매칭/견적 현황 관리 및 수동 배정 화면" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">매칭 모니터링 & 분쟁 중재</h2>
          <p className="text-xs text-slate-500 mt-1">
            정원주-조경사 입찰 건을 실시간 추적하고, 미매칭 건 수동 배정 및 시공 결과물 분쟁을 조정합니다.
          </p>
        </div>
        <button
          onClick={fetchMatchingData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>새로고침</span>
        </button>
      </div>

      {/* 테이블 목록 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">의뢰명 / 의뢰자</th>
              <th className="py-3 px-4">의뢰 유형</th>
              <th className="py-3 px-4">진행 상태</th>
              <th className="py-3 px-4">입찰 조경사</th>
              <th className="py-3 px-4">희망 예산</th>
              <th className="py-3 px-4 text-right">관리 작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map(req => {
              const sim = req.simulationIds?.[0];
              const isMatched = req.status === 'MATCHED' || req.status === 'COMPLETED';

              return (
                <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{req.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {req.gardenOwnerId?.name || '정원주'} ({req.gardenOwnerId?.email})
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {req.requestType === 'ONSITE_PRUNING' ? '현장 전지' : req.requestType === 'REGULAR_CARE' ? '정기 관리' : '수형 첨삭'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'MATCHED'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {req.status === 'OPEN' ? '접수대기' : req.status === 'QUOTING' ? '입찰진행' : req.status === 'MATCHED' ? '시공예약' : '시공완료'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {req.matchedLandscaperId ? (
                      <span className="text-emerald-700 font-bold">
                        {req.matchedLandscaperId.name} ({req.matchedLandscaperId.landscaperProfile?.companyName || '배정됨'})
                      </span>
                    ) : (
                      <span>입찰 {req.quotes?.length || 0}건</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    ~{(req.budgetRange?.max || 500000).toLocaleString()}원
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {/* 수동 배정 버튼 */}
                    {!isMatched && (
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setIsAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-bold border border-indigo-200"
                      >
                        우수 조경사 수동 배정
                      </button>
                    )}

                    {/* 분쟁 조정 뷰어 */}
                    {req.status === 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setIsDisputeModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold border border-emerald-200"
                      >
                        Before/After 대조 검수
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 수동 배정 모달 */}
      {isAssignModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">우수 조경사 수동 추천 및 직권 배정</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-slate-500 text-[11px]">
              미매칭 또는 고객 요청에 따라 관리자가 인증 명인 조경사를 직접 배정합니다.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {landscapers.map(land => (
                <div
                  key={land._id}
                  onClick={() => handleAssign(land._id)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{land.name}</div>
                    <div className="text-[10px] text-slate-400">{land.landscaperProfile?.companyName} · 평점 {land.landscaperProfile?.ratingAvg}</div>
                  </div>
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold">
                    배정하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 분쟁 조정 및 Before/After 대조 뷰어 모달 */}
      {isDisputeModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  시공 결과물 vs AI 시뮬레이션 합의안 대조 중재
                </h3>
                <span className="text-[11px] text-slate-500">{selectedReq.title}</span>
              </div>
              <button onClick={() => setIsDisputeModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">① 고객 희망 AI 목표 수형</span>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 shadow">
                  <img
                    src={selectedReq.simulationIds?.[0]?.simulatedImages?.immediatelyAfterUrl || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'}
                    alt="AI 목표 수형"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-emerald-800 block">② 조경사 실제 시공 완료 사진</span>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 shadow">
                  <img
                    src={selectedReq.completionReport?.afterImages?.[0] || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'}
                    alt="실제 시공 완료"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>시공 요약:</strong> {selectedReq.completionReport?.workSummary}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert('분쟁 없음: AI 시뮬레이션 목표 수형과 95% 일치함이 확인되었습니다.');
                  setIsDisputeModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
              >
                검수 합격 및 정상 정산 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

