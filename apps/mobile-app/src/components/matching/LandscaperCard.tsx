import React from 'react';
import { Award, Star, MapPin, Wrench, ChevronRight, CheckCircle2 } from 'lucide-react';
import { InspectBadge } from '../../context/UiInspectContext';

interface Landscaper {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  landscaperProfile?: {
    companyName: string;
    experienceYears: number;
    certifications: string[];
    specialties: string[];
    serviceAreas: string[];
    isMasterBadge: boolean;
    ratingAvg: number;
    reviewCount: number;
    completedJobsCount: number;
    portfolios: {
      title: string;
      treeSpecies: string;
      beforeImageUrl: string;
      afterImageUrl: string;
      description: string;
    }[];
  };
}

interface Props {
  landscaper: Landscaper;
  onSelectForQuote: (landscaper: Landscaper) => void;
}

export const LandscaperCard: React.FC<Props> = ({ landscaper, onSelectForQuote }) => {
  const profile = landscaper.landscaperProfile;
  const portfolio = profile?.portfolios?.[0];

  return (
    <div className="relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <InspectBadge serialId="P05-SEC01-CRD01" itemName="조경사 프로필 및 포트폴리오 카드 (LandscaperCard)" />

      {/* 상단 프로필 정보 */}
      <div className="flex items-start gap-3.5 mb-3">
        <img
          src={landscaper.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'}
          alt={landscaper.name}
          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-sm text-slate-900">{landscaper.name}</h4>
            {profile?.isMasterBadge && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold border border-amber-300">
                <Award className="w-3 h-3 text-amber-600" />
                <span>인증 명인</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
            {profile?.companyName || '전문 조경사'} · 경력 {profile?.experienceYears || 10}년
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-0.5 font-bold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{profile?.ratingAvg ? profile.ratingAvg.toFixed(2) : '5.00'}</span>
            </span>
            <span>·</span>
            <span>시공완료 {profile?.completedJobsCount || 0}건</span>
          </div>
        </div>
      </div>

      {/* 보유 자격증 뱃지 */}
      {profile?.certifications && profile.certifications.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {profile.certifications.map((cert, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
              {cert}
            </span>
          ))}
        </div>
      )}

      {/* 활동 지역 & 전문 수종 */}
      <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1 mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{profile?.serviceAreas?.join(', ') || '전국 출장 가능'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wrench className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="truncate text-emerald-800 font-medium">{profile?.specialties?.join(' · ') || '수목 전지 전문'}</span>
        </div>
      </div>

      {/* 대표 Before & After 포트폴리오 */}
      {portfolio && (
        <div className="mb-3 p-2 bg-slate-100/70 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 block mb-1.5">실제 시공 Before / After 포트폴리오</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
              <img src={portfolio.beforeImageUrl} alt="전지 전" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/70 text-white text-[9px] rounded font-bold">Before</span>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
              <img src={portfolio.afterImageUrl} alt="전지 후" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] rounded font-bold">After</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 truncate">{portfolio.title}</p>
        </div>
      )}

      {/* 1:1 의뢰 버튼 */}
      <button
        onClick={() => onSelectForQuote(landscaper)}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
      >
        <span>이 명인에게 1:1 견적·첨삭 의뢰</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

