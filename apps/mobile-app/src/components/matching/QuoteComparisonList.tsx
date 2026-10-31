import React from 'react';
import { Award, Star, CheckCircle, Shield, Calendar, Clock, DollarSign } from 'lucide-react';
import { InspectBadge } from '../../context/UiInspectContext';

interface Quote {
  _id?: string;
  quoteId?: string;
  landscaperId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    landscaperProfile?: {
      companyName: string;
      experienceYears: number;
      isMasterBadge: boolean;
      ratingAvg: number;
      reviewCount: number;
      specialties: string[];
    };
  };
  price: number;
  priceBreakdown: {
    laborCost: number;
    equipmentCost: number;
    wasteDisposalCost: number;
  };
  availableDate: string;
  expertComment: string;
  status: string;
}

interface Props {
  quotes: Quote[];
  matchedQuoteId?: string;
  onAcceptQuote: (quoteId: string) => void;
  isReadOnly?: boolean;
}

export const QuoteComparisonList: React.FC<Props> = ({
  quotes,
  matchedQuoteId,
  onAcceptQuote,
  isReadOnly = false
}) => {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">아직 접수된 조경사 견적이 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">내 정원 반경 내 전문 조경사들이 수형을 검토 중입니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <InspectBadge serialId="P06-SEC04-CRD01" itemName="조경사 입찰 견적 비교 리스트 (QuoteComparisonList)" />

      {quotes.map((quote, idx) => {
        const qId = quote._id || quote.quoteId || String(idx);
        const landscaper = quote.landscaperId;
        const profile = landscaper?.landscaperProfile;
        const isAccepted = quote.status === 'ACCEPTED' || matchedQuoteId === qId;

        return (
          <div
            key={qId}
            className={`relative p-4 rounded-2xl border transition-all ${
              isAccepted
                ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            {isAccepted && (
              <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                <CheckCircle className="w-3 h-3" />
                <span>채택 완료 (시공 확정)</span>
              </div>
            )}

            {/* 조경사 프로필 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={landscaper?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'}
                  alt={landscaper?.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{landscaper?.name}</span>
                    {profile?.isMasterBadge && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9.5px] font-bold border border-amber-300">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>인증 명인</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {profile?.companyName || '전문 조경사'} · 경력 {profile?.experienceYears || 10}년
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-600">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{profile?.ratingAvg ? profile.ratingAvg.toFixed(2) : '5.00'}</span>
                    <span className="text-slate-400">({profile?.reviewCount || 0}개 리뷰)</span>
                  </div>
                </div>
              </div>

              {/* 총 견적 금액 */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">총 견적 금액</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {quote.price.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 견적 상세 내역 (10대 골든 룰 비용 분리) */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
              <div>
                <span className="text-slate-400 block">기술 인건비</span>
                <span className="font-bold text-slate-700">{(quote.priceBreakdown?.laborCost || 0).toLocaleString()}원</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-slate-400 block">사다리/장비비</span>
                <span className="font-bold text-slate-700">{(quote.priceBreakdown?.equipmentCost || 0).toLocaleString()}원</span>
              </div>
              <div>
                <span className="text-slate-400 block">폐기물 처리비</span>
                <span className="font-bold text-slate-700">{(quote.priceBreakdown?.wasteDisposalCost || 0).toLocaleString()}원</span>
              </div>
            </div>

            {/* 전문가 코멘트 */}
            {quote.expertComment && (
              <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-slate-700 leading-relaxed mb-3">
                <strong className="text-emerald-900 block mb-0.5">💬 조경사 제안 코멘트:</strong>
                <p>{quote.expertComment}</p>
              </div>
            )}

            {/* 하단 액션 */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>방문 가능일: {new Date(quote.availableDate).toLocaleDateString('ko-KR')}</span>
              </span>

              {!isReadOnly && !isAccepted && (
                <button
                  onClick={() => onAcceptQuote(qId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>이 견적 채택하기</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

