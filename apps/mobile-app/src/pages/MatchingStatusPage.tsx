import React, { useState, useEffect } from 'react';
import { QuoteComparisonList } from '../components/matching/QuoteComparisonList';
import { api } from '../services/api';
import { InspectBadge } from '../context/UiInspectContext';
import { Clock, CheckCircle2, ShieldCheck, Star, RefreshCw, ChevronRight } from 'lucide-react';

interface Props {
  onNavigate: (page: string, params?: any) => void;
}

export const MatchingStatusPage: React.FC<Props> = ({ onNavigate }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeReqId, setActiveReqId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('시뮬레이션대로 완벽하게 시공되었습니다!');

  const fetchRequests = async () => {
    try {
      const res = await api.getMatchingRequests();
      if (res.success && res.requests.length > 0) {
        setRequests(res.requests);
        setActiveReqId(res.requests[0]._id);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAcceptQuote = async (quoteId: string) => {
    if (!activeReqId) return;
    try {
      const res = await api.acceptQuote(activeReqId, quoteId);
      if (res.success) {
        alert('조경사 견적이 채택되어 시공 예약이 확정되었습니다!');
        fetchRequests();
      }
    } catch (err: any) {
      alert(`채택 실패: ${err.message}`);
    }
  };

  const handleSubmitReview = async () => {
    if (!activeReqId) return;
    try {
      const res = await api.reviewJob(activeReqId, {
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.success) {
        alert('소중한 후기와 별점이 등록되었습니다!');
        fetchRequests();
      }
    } catch (err: any) {
      alert(`리뷰 등록 실패: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">견적 요청 현황 불러오는 중...</div>;
  }

  const activeRequest = requests.find(r => r._id === activeReqId) || requests[0];

  return (
    <div className="space-y-4 pb-20">
      <InspectBadge serialId="P06-SEC01-CRD01" itemName="내 견적 요청 및 매칭 진행 현황 화면" />

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">내 시공 의뢰 및 견적 현황</h2>
        <p className="text-xs text-slate-500 mt-1">
          조경사들이 제안한 상세 견적(인건비/장비비/폐기물비)을 비교하고 채택하세요.
        </p>
      </div>

      {/* 요청서 선택 탭 */}
      {requests.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {requests.map((req, idx) => {
            const isSelected = req._id === activeReqId;
            const statusLabel = req.status === 'OPEN' ? '접수완료' : req.status === 'QUOTING' ? '입찰중' : req.status === 'MATCHED' ? '시공예약' : '시공완료';
            return (
              <button
                key={req._id}
                onClick={() => setActiveReqId(req._id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    req.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {statusLabel}
                  </span>
                  <span className="text-[10px] text-slate-400">입찰 {req.quotes?.length || 0}건</span>
                </div>
                <div className="text-xs font-bold truncate max-w-[180px]">{req.title}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          <p>등록된 견적 요청이 없습니다.</p>
          <button
            onClick={() => onNavigate('simulation')}
            className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
          >
            AI 시뮬레이션 후 견적 요청하기
          </button>
        </div>
      )}

      {/* 활성 요청 상세 정보 */}
      {activeRequest && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeRequest.requestType === 'ONSITE_PRUNING' ? '현장 방문 수목 전지' : '사계절 정기 관리'}
              </span>
              <span className="text-slate-400 text-[10px]">
                {new Date(activeRequest.createdAt).toLocaleDateString('ko-KR')} 등록
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{activeRequest.title}</h3>
            <p className="text-slate-600 leading-relaxed text-[11px]">{activeRequest.description}</p>
          </div>

          {/* 시공 완료 보고서 영역 (COMPLETED 일 때) */}
          {activeRequest.status === 'COMPLETED' && activeRequest.completionReport && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-sm space-y-3">
              <InspectBadge serialId="P06-SEC02-CRD01" itemName="시공 완료 Before/After 보고서 카드" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>현장 시공 완료 보고서 (Before & After)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                  정원 타임라인 반영됨
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow">
                  <img src={activeRequest.completionReport.beforeImages[0]} alt="시공 전" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">시공 전</span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow">
                  <img src={activeRequest.completionReport.afterImages[0]} alt="시공 후" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">시공 후</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-950 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <strong>작업 요약:</strong> {activeRequest.completionReport.workSummary}
              </p>

              {/* 리뷰 작성 또는 작성된 리뷰 표시 */}
              {activeRequest.review ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>정원주 평점: {activeRequest.review.rating}점 / 5.0</span>
                  </div>
                  <p className="text-slate-700 italic">"{activeRequest.review.comment}"</p>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
                  <label className="block font-bold text-slate-800">조경사 별점 및 후기 남기기</label>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewRating(num)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                          reviewRating === num ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        ★ {num}점
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="시공 만족도 후기를 입력하세요"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                  <button
                    onClick={handleSubmitReview}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                  >
                    후기 등록하기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 조경사 견적서 비교 목록 */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">
              도착한 조경사 입찰 견적 ({activeRequest.quotes?.length || 0}건)
            </h4>
            <QuoteComparisonList
              quotes={activeRequest.quotes || []}
              matchedQuoteId={activeRequest.matchedQuoteId}
              onAcceptQuote={handleAcceptQuote}
              isReadOnly={activeRequest.status === 'COMPLETED'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

