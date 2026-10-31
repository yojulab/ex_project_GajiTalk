import React from 'react';
import { Camera, Sparkles, Scissors, Users, ArrowRight, ShieldCheck, TreePine, Calendar } from 'lucide-react';
import { InspectBadge } from '../context/UiInspectContext';

interface Props {
  onNavigate: (page: string, params?: any) => void;
  onSwitchMode?: () => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="space-y-5 pb-20">
      <InspectBadge serialId="P01-SEC01-CRD01" itemName="정원주 메인 홈 배너 및 시작 카드" />

      {/* 히어로 배너 */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-forest-800 to-slate-900 text-white p-6 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI 실사 전지 시뮬레이터 & 명인 매칭</span>
          </div>

          <h1 className="text-2xl font-extrabold leading-tight">
            찍으면 보이는 나무의 미래,<br />
            <span className="text-emerald-400">명인의 손길</span>까지.
          </h1>

          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xs">
            만화풍이 아닌 실제 나무 사진 위에서 자를 가지를 짚어주고, 3년 뒤 생장 모습을 실사로 예측합니다.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('capture')}
              data-serial-id="P01-SEC01-BTN01"
              className="relative flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all text-sm"
            >
              <InspectBadge serialId="P01-SEC01-BTN01" itemName="나무 촬영 및 AI 전지 분석 시작 버튼" />
              <Camera className="w-5 h-5 text-slate-950" />
              <span>내 나무 촬영하고 즉시 분석하기</span>
            </button>
          </div>
        </div>

        {/* 배경 수목 실사 실루엣 */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-25 pointer-events-none">
          <TreePine className="w-full h-full text-emerald-300" />
        </div>
      </div>

      {/* 계절별 수목 전지 골든 타임 알림 */}
      <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
        <InspectBadge serialId="P01-SEC02-CRD01" itemName="계절별 전지 적기 알림 카드" />
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-amber-950">지금은 [소나무 가을 잎솎기] 적기입니다</h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">10~12월</span>
            </div>
            <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed">
              묵은 갈색 솔잎을 털어내고 내향지를 솎아주면 겨울철 설해(눈 무게 피해)와 응애 월동을 예방할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 핵심 3대 서비스 퀵 내비게이션 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 실사 시뮬레이터 */}
        <div
          onClick={() => onNavigate('simulation')}
          className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 cursor-pointer transition-all space-y-2 group"
        >
          <InspectBadge serialId="P01-SEC03-BTN01" itemName="AI 실사 수목 시뮬레이터 카드" />
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">실사 전지 시뮬레이터</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">7대 기피 가지 가상 가위질 & 3년 생장 예측</p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5 pt-1">
            <span>체험하기</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* 조경사 O2O 매칭 */}
        <div
          onClick={() => onNavigate('directory')}
          className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 cursor-pointer transition-all space-y-2 group"
        >
          <InspectBadge serialId="P01-SEC03-BTN02" itemName="인증 명인 조경사 찾기 카드" />
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">전문 조경사 찾기</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">소나무 명인, 나무의사 포트폴리오 비교</p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-indigo-600 gap-0.5 pt-1">
            <span>조경사 둘러보기</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 실사 전지 전/후 대표 쇼케이스 */}
      <div className="relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <InspectBadge serialId="P01-SEC04-CRD01" itemName="실사 전지 Before/After 쇼케이스" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-900">10대 전지 골든 룰 실제 시공 사례</h3>
          </div>
          <button onClick={() => onNavigate('simulation')} className="text-[11px] text-emerald-600 font-semibold">
            자세히 보기
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80"
              alt="전지 전 실사"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white text-[9.5px] rounded font-bold">
              전지 전 (도장지 무성)
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80"
              alt="전지 직후 실사"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[9.5px] rounded font-bold">
              전지 직후 (구름형 수형)
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          양평 서종면 전원주택 80년생 반송: 지융부를 온전히 보존한 기부 절단으로 3단 운두 수형 완성.
        </p>
      </div>
    </div>
  );
};

