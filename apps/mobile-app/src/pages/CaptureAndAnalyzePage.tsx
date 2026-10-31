import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { InspectBadge } from '../context/UiInspectContext';

interface Props {
  onNavigate: (page: string, params?: any) => void;
}

export const CaptureAndAnalyzePage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [speciesName, setSpeciesName] = useState<string>('소나무(반송/조형소나무)');
  const [targetGoal, setTargetGoal] = useState<string>('구름형(운두) 다듬기 및 통풍 개선');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 실사 수목 프리셋 사진들
  const treePresets = [
    {
      species: '소나무(반송/조형소나무)',
      name: '양평 80년생 조형 반송',
      url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=85',
      goal: '구름형(운두) 다듬기 및 통풍 개선'
    },
    {
      species: '단풍나무(청단풍/공작단풍)',
      name: '마당 앞 성목 청단풍',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
      goal: '자연 우산형 수형 유지 및 채광 개선'
    },
    {
      species: '배롱나무(목백일홍)',
      name: '정원 중앙 백일홍',
      url: 'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=1000&q=85',
      goal: '개방형 수관 및 맹아지 정리'
    }
  ];

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setSpeciesName(treePresets[idx].species);
    setTargetGoal(treePresets[idx].goal);
    setCustomImageUrl(treePresets[idx].url);
  };

  const handleStartAnalysis = async () => {
    setLoading(true);
    try {
      const activeUrl = customImageUrl || treePresets[selectedPreset].url;
      const res = await api.analyzeTree({
        imageUrl: activeUrl,
        speciesName,
        targetGoal
      });
      if (res.success && res.simulation) {
        onNavigate('simulation', { simulationId: res.simulation._id });
      } else {
        alert('분석에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      alert(`오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      <InspectBadge serialId="P02-SEC01-CRD01" itemName="수목 촬영 및 AI 전지 분석 화면" />

      {/* 상단 안내 */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">나무 촬영 및 AI 분석</h2>
        <p className="text-xs text-slate-500 mt-1">
          정원 나무의 전체 수형이 잘 보이도록 촬영하거나 실사 프리셋을 선택하세요.
        </p>
      </div>

      {/* 촬영 / 프리셋 선택 영역 */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700">촬영 또는 실사 프리셋 선택</label>
        
        {/* 선택된 프리셋 대형 프리뷰 */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-300">
          <img
            src={customImageUrl || treePresets[selectedPreset].url}
            alt="선택된 수목 사진"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex flex-col justify-between p-3.5">
            <span className="self-start px-2.5 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold rounded-full">
              {speciesName}
            </span>
            <div className="text-white text-xs">
              <span className="font-bold block">{treePresets[selectedPreset]?.name || '선택된 수목'}</span>
              <span className="text-[10px] text-emerald-300">AI 비전 세그멘테이션 대기중</span>
            </div>
          </div>
        </div>

        {/* 3대 실사 프리셋 썸네일 */}
        <div className="grid grid-cols-3 gap-2">
          {treePresets.map((preset, idx) => {
            const isSelected = selectedPreset === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-emerald-600 ring-2 ring-emerald-400 scale-95' : 'border-slate-200 opacity-70'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[9px] font-bold truncate rounded">
                  {preset.species.split('(')[0]}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 수종 및 목표 수형 설정 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5 text-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1">수종 선택</label>
          <select
            value={speciesName}
            onChange={e => setSpeciesName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-xs bg-slate-50"
          >
            <option value="소나무(반송/조형소나무)">소나무 (반송 / 조형소나무)</option>
            <option value="단풍나무(청단풍/공작단풍)">단풍나무 (청단풍 / 공작단풍)</option>
            <option value="배롱나무(목백일홍)">배롱나무 (목백일홍)</option>
            <option value="정원 유실수(감나무/매실/모과)">정원 유실수 (감나무 / 매실나무)</option>
            <option value="에메랄드그린/측백류">에메랄드그린 / 서양측백류</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">목표 수형 및 전지 목적</label>
          <select
            value={targetGoal}
            onChange={e => setTargetGoal(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-xs bg-slate-50"
          >
            <option value="구름형(운두) 다듬기 및 통풍 개선">구름형(운두) 다듬기 및 통풍 개선 (소나무 특화)</option>
            <option value="자연 우산형 수형 유지 및 채광 개선">자연 우산형 수형 유지 및 채광 개선 (단풍나무)</option>
            <option value="수고 억제 및 개방형 수관 교정">수고(높이) 억제 및 개방형 수관 교정</option>
            <option value="화아(꽃눈) 보호 및 묵은 꽃대 정리">화아(꽃눈) 보호 및 묵은 가지 정리 (배롱나무)</option>
          </select>
        </div>

        <div className="p-2.5 bg-emerald-50/70 rounded-xl text-[11px] text-emerald-900 border border-emerald-200 leading-relaxed">
          🌿 <strong>10대 전지 골든 룰 자동 적용:</strong> 지융부(Branch Collar) 보존, 외아(바깥눈) 위 45도 사선 절단, 1회 엽량 30% 이내 절제 기준이 적용됩니다.
        </div>
      </div>

      {/* 분석 시작 버튼 */}
      <button
        onClick={handleStartAnalysis}
        disabled={loading}
        data-serial-id="P02-SEC02-BTN01"
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <InspectBadge serialId="P02-SEC02-BTN01" itemName="실사 전지 및 생장 시뮬레이션 생성 버튼" />
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI 비전 가지 세그멘테이션 중...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <span>AI 실사 전지 & 생장 시뮬레이션 시작</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </div>
  );
};

