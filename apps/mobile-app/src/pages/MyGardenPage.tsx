import React, { useState, useEffect } from 'react';
import { TreePine, Plus, MapPin, Calendar, Clock, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { InspectBadge } from '../context/UiInspectContext';

interface Props {
  onNavigate: (page: string, params?: any) => void;
}

export const MyGardenPage: React.FC<Props> = ({ onNavigate }) => {
  const [garden, setGarden] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTreeIdx, setSelectedTreeIdx] = useState<number>(0);

  useEffect(() => {
    const fetchGarden = async () => {
      try {
        const res = await api.getMyGarden();
        if (res.success && res.garden) {
          setGarden(res.garden);
        }
      } catch (err) {
        console.error('Fetch garden error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGarden();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-xs">내 정원 정보를 불러오는 중...</div>;
  }

  const trees = garden?.trees || [];
  const activeTree = trees[selectedTreeIdx] || null;

  return (
    <div className="space-y-4 pb-20">
      <InspectBadge serialId="P04-SEC01-CRD01" itemName="내 정원 프로필 및 수목 생장 타임라인 화면" />

      {/* 정원 프로필 카드 */}
      <div className="bg-gradient-to-br from-emerald-800 to-forest-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-full text-[10px] font-bold text-emerald-200">
              {garden?.gardenType === 'DETACHED_HOUSE' ? '전원주택 정원' : '정원 프로필'} · {garden?.areaPyeong || 100}평
            </span>
            <span className="text-xs text-emerald-200">관리 수목 {trees.length}그루</span>
          </div>

          <h2 className="text-xl font-extrabold">{garden?.gardenName || '내 힐링 정원'}</h2>
          
          <p className="text-xs text-emerald-100/80 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{garden?.address || '경기도 양평군 서종면 문호리'}</span>
          </p>
        </div>
      </div>

      {/* 보유 수목 탭 선택기 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xs text-slate-800">관리 대상 수목 선택</h3>
          <button
            onClick={() => onNavigate('capture')}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 나무 등록</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {trees.map((tree: any, idx: number) => {
            const isSelected = selectedTreeIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedTreeIdx(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">{tree.nickname || tree.speciesName}</div>
                <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {tree.speciesName} · 수고 {tree.heightMeters}m
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 수목의 생장 타임라인 (Timeline Logs) */}
      {activeTree && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <InspectBadge serialId="P04-SEC02-CRD01" itemName="수목별 시계열 관리 이력 타임라인 카드" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TreePine className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-slate-900">
                {activeTree.nickname}의 시계열 생장 & 시공 이력
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              목표: {activeTree.targetStyle}
            </span>
          </div>

          {activeTree.timelineLogs && activeTree.timelineLogs.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeTree.timelineLogs.map((log: any, idx: number) => (
                <div key={idx} className="relative space-y-1.5">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(log.recordedAt).toLocaleDateString('ko-KR')}</span>
                    <span className="font-semibold text-emerald-700">공식 기록</span>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                    <img src={log.imageUrl} alt="타임라인 사진" className="w-full h-full object-cover" />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {log.memo}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              <p>아직 등록된 전지/시공 이력이 없습니다.</p>
              <button
                onClick={() => onNavigate('simulation')}
                className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
              >
                AI 전지 시뮬레이션 기록 남기기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

