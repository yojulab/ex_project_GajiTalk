import React, { useState, useEffect } from 'react';
import { LandscaperCard } from '../components/matching/LandscaperCard';
import { QuoteRequestModal } from '../components/matching/QuoteRequestModal';
import { api } from '../services/api';
import { InspectBadge } from '../context/UiInspectContext';
import { Search, Award, Filter, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (page: string, params?: any) => void;
}

export const LandscaperDirectoryPage: React.FC<Props> = ({ onNavigate }) => {
  const [landscapers, setLandscapers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [onlyMaster, setOnlyMaster] = useState<boolean>(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedLandscaper, setSelectedLandscaper] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchLandscapers = async () => {
      setLoading(true);
      try {
        const res = await api.getLandscapers({
          isMaster: onlyMaster ? true : undefined,
          specialty: selectedSpecialty || undefined
        });
        if (res.success) {
          setLandscapers(res.landscapers);
        }
      } catch (err) {
        console.error('Fetch landscapers error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandscapers();
  }, [onlyMaster, selectedSpecialty]);

  const handleOpenQuoteModal = (landscaper: any) => {
    setSelectedLandscaper(landscaper);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-20">
      <InspectBadge serialId="P05-SEC01-CRD01" itemName="전문 조경사 탐색 및 포트폴리오 디렉토리 화면" />

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">전문 조경사 디렉토리</h2>
        <p className="text-xs text-slate-500 mt-1">
          자격증과 실제 Before/After 시공 포트폴리오가 검증된 명인 조경사를 만나보세요.
        </p>
      </div>

      {/* 필터 칩스 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setOnlyMaster(!onlyMaster)}
          className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-bold border transition-all ${
            onlyMaster
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>인증 명인 배지만</span>
        </button>

        {['소나무전지', '병충해방제', '단풍나무전지', '정원디자인'].map(spec => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(selectedSpecialty === spec ? '' : spec)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-medium border transition-all ${
              selectedSpecialty === spec
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* 조경사 리스트 */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">조경사 목록 불러오는 중...</div>
      ) : landscapers.length > 0 ? (
        <div className="space-y-3.5">
          {landscapers.map(landscaper => (
            <LandscaperCard
              key={landscaper._id}
              landscaper={landscaper}
              onSelectForQuote={handleOpenQuoteModal}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-xs">
          선택한 조건의 조경사가 없습니다. 필터를 재설정해보세요.
        </div>
      )}

      {/* 1:1 의뢰 모달 */}
      {selectedLandscaper && (
        <QuoteRequestModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLandscaper(null);
          }}
          targetLandscaperId={selectedLandscaper._id}
          targetLandscaperName={selectedLandscaper.name}
          onSuccess={() => onNavigate('matching')}
        />
      )}
    </div>
  );
};

