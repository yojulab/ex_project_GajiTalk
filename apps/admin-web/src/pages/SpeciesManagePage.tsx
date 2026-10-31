import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { InspectBadge } from '../context/UiInspectContext';
import { BookOpen, Calendar, DollarSign, Plus, Save, CheckCircle2 } from 'lucide-react';

export const SpeciesManagePage: React.FC = () => {
  const [speciesList, setSpeciesList] = useState<any[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // 폼 상태
  const [smallPrice, setSmallPrice] = useState<number>(80000);
  const [mediumPrice, setMediumPrice] = useState<number>(180000);
  const [largePrice, setLargePrice] = useState<number>(350000);
  const [difficultyNote, setDifficultyNote] = useState<string>('');

  const fetchSpecies = async () => {
    try {
      const res = await adminApi.getSpecies();
      if (res.success && res.species.length > 0) {
        setSpeciesList(res.species);
        setSelectedSpecies(res.species[0]);
        setSmallPrice(res.species[0].standardPriceGuide?.smallTreePrice || 80000);
        setMediumPrice(res.species[0].standardPriceGuide?.mediumTreePrice || 180000);
        setLargePrice(res.species[0].standardPriceGuide?.largeTreePrice || 350000);
        setDifficultyNote(res.species[0].standardPriceGuide?.difficultyNote || '');
      }
    } catch (err) {
      console.error('Fetch species error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, []);

  const handleSelectSpecies = (sp: any) => {
    setSelectedSpecies(sp);
    setSmallPrice(sp.standardPriceGuide?.smallTreePrice || 80000);
    setMediumPrice(sp.standardPriceGuide?.mediumTreePrice || 180000);
    setLargePrice(sp.standardPriceGuide?.largeTreePrice || 350000);
    setDifficultyNote(sp.standardPriceGuide?.difficultyNote || '');
  };

  const handleSavePriceGuide = async () => {
    if (!selectedSpecies) return;
    setSaving(true);
    try {
      const updated = {
        ...selectedSpecies,
        standardPriceGuide: {
          smallTreePrice: smallPrice,
          mediumTreePrice: mediumPrice,
          largeTreePrice: largePrice,
          difficultyNote
        }
      };
      const res = await adminApi.createOrUpdateSpecies(updated);
      if (res.success) {
        alert('수종 표준 권장 견적 단가표가 업데이트되었습니다.');
        fetchSpecies();
      }
    } catch (err: any) {
      alert(`단가표 저장 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">수종 도감 및 단가표 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <InspectBadge serialId="P54-SEC01-CRD01" itemName="수종 도감 및 표준 단가 기준표 관리 화면" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">수종 도감 & 표준 권장 단가 관리</h2>
          <p className="text-xs text-slate-500 mt-1">
            소나무, 단풍나무 등 주요 조경수의 10대 전지 골든 룰셋과 수고별(소/중/대형) 권장 시공 단가표를 관리합니다.
          </p>
        </div>
        <button
          onClick={handleSavePriceGuide}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '저장 중...' : '표준 단가 기준표 저장'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 수종 도감 목록 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700">등록된 조경 수목 목록</h3>
          <div className="space-y-2">
            {speciesList.map(sp => {
              const isSelected = selectedSpecies?._id === sp._id;
              return (
                <div
                  key={sp._id}
                  onClick={() => handleSelectSpecies(sp)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{sp.koreanName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {sp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mb-2">{sp.scientificName}</p>
                  
                  {/* 전지 적기 월별 뱃지 */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>적기: {sp.pruningSeason?.join(', ')}월</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 중앙 & 우측: 상세 전지 룰셋 및 수고별 표준 단가표 */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSpecies && (
            <>
              {/* 표준 권장 단가 설정 카드 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">
                      [{selectedSpecies.koreanName}] 수고별 표준 권장 견적 단가 기준표
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">1그루당 표준 시공가 (원)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">소형목 (수고 2m 미만)</label>
                    <input
                      type="number"
                      step="10000"
                      value={smallPrice}
                      onChange={e => setSmallPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-bold text-slate-800 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">중형목 (수고 2m ~ 4m)</label>
                    <input
                      type="number"
                      step="10000"
                      value={mediumPrice}
                      onChange={e => setMediumPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-bold text-slate-800 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">대형목 (수고 4m 이상)</label>
                    <input
                      type="number"
                      step="10000"
                      value={largePrice}
                      onChange={e => setLargePrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-bold text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">수종별 작업 난이도 및 조경사 주의 코멘트</label>
                  <textarea
                    value={difficultyNote}
                    onChange={e => setDifficultyNote(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-xl text-xs resize-none"
                    placeholder="작업 난이도 및 10대 골든 룰 주의사항"
                  />
                </div>
              </div>

              {/* 10대 전지 골든 룰셋 카드 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2 border-b pb-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900">현장 10대 골든 룰셋 ({selectedSpecies.pruningRules?.length || 0}개 수칙)</h4>
                </div>

                <div className="space-y-2">
                  {selectedSpecies.pruningRules?.map((rule: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-emerald-800">{rule.branchType}</span>
                        <span className="px-2 py-0.2 bg-emerald-100 text-emerald-900 rounded text-[10px] font-bold">
                          {rule.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

