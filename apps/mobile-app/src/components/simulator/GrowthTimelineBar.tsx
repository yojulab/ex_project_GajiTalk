import React from 'react';
import { Calendar, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { InspectBadge } from '../../context/UiInspectContext';

export type GrowthStage = 'immediatelyAfter' | 'after6Months' | 'after1Year' | 'after3Years';

interface Props {
  currentStage: GrowthStage;
  onSelectStage: (stage: GrowthStage) => void;
}

export const GrowthTimelineBar: React.FC<Props> = ({ currentStage, onSelectStage }) => {
  const stages: { id: GrowthStage; label: string; period: string; desc: string; icon: any }[] = [
    {
      id: 'immediatelyAfter',
      label: '전지 직후',
      period: '0일',
      desc: '7대 기피 가지 정리 완료, 수관 골격 투광율 40% 확보',
      icon: ShieldCheck
    },
    {
      id: 'after6Months',
      label: '6개월 후',
      period: '+6개월',
      desc: '바깥눈(외아)에서 건강한 신초 새순 발생 및 1차 마디 형성',
      icon: Sparkles
    },
    {
      id: 'after1Year',
      label: '1년 후',
      period: '+1년',
      desc: '균형 잡힌 잎무더기(운두) 안정화 및 잔가지 분화 완성',
      icon: TrendingUp
    },
    {
      id: 'after3Years',
      label: '3년 후',
      period: '+3년',
      desc: '목표한 명품 구름형 수형 완성, 노거수의 품격 유지',
      icon: Calendar
    }
  ];

  return (
    <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <InspectBadge serialId="P03-SEC03-SLD02" itemName="시계열 생장 예측 타임라인바 (GrowthTimelineBar)" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>시계열 생장 예측 (Growth Predictor)</span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          실사 Inpainting AI
        </span>
      </div>

      {/* 4단계 스텝 버튼 바 */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
        {stages.map((stage) => {
          const isActive = currentStage === stage.id;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all text-center relative ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm font-bold ring-2 ring-emerald-500'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[11px] leading-tight">{stage.label}</span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5">{stage.period}</span>
            </button>
          );
        })}
      </div>

      {/* 현재 선택된 스테이지 설명 */}
      <div className="mt-2.5 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        <span>{stages.find(s => s.id === currentStage)?.desc}</span>
      </div>
    </div>
  );
};

