import React, { useState } from 'react';
import { X, Send, Calendar, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { InspectBadge } from '../../context/UiInspectContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  simulationId?: string;
  simulationImage?: string;
  speciesName?: string;
  targetLandscaperId?: string;
  targetLandscaperName?: string;
  onSuccess?: () => void;
}

export const QuoteRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  simulationId,
  simulationImage,
  speciesName = '소나무(반송)',
  targetLandscaperId,
  targetLandscaperName,
  onSuccess
}) => {
  const [requestType, setRequestType] = useState<string>('ONSITE_PRUNING');
  const [title, setTitle] = useState<string>(`${speciesName} 목표 수형대로 전지 시공 견적 요청합니다`);
  const [description, setDescription] = useState<string>('AI 시뮬레이션으로 확인한 수형대로 지융부를 보존하여 깔끔하게 전지해주실 조경사님을 모십니다. 잔가지 폐기물 수거 희망합니다.');
  const [preferredDate, setPreferredDate] = useState<string>('2026-11-15');
  const [minBudget, setMinBudget] = useState<number>(300000);
  const [maxBudget, setMaxBudget] = useState<number>(600000);
  const [submitting, setSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createMatchingRequest({
        requestType,
        title,
        description,
        simulationIds: simulationId ? [simulationId] : [],
        preferredDates: [preferredDate],
        budgetRange: { min: minBudget, max: maxBudget },
        targetLandscaperId: targetLandscaperId || undefined
      });
      alert('조경사 견적 요청서가 성공적으로 등록되었습니다! 입찰 견적이 도착하면 알림을 보내드립니다.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`오류: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <InspectBadge serialId="P03-SEC04-MOD01" itemName="AI 시뮬레이션 첨부 견적 요청 모달 (QuoteRequestModal)" />

        {/* 헤더 */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">
              {targetLandscaperName ? `[1:1 지정] ${targetLandscaperName} 님께 견적 의뢰` : '전문 조경사 시공 견적 요청 (공개 입찰)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* AI 시뮬레이션 첨부 프리뷰 */}
          {simulationImage && (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
              <img
                src={simulationImage}
                alt="첨부된 목표 수형"
                className="w-16 h-16 rounded-lg object-cover shadow-sm border border-emerald-300 flex-shrink-0"
              />
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold mb-1">
                  AI 목표 수형 자동 첨부됨
                </span>
                <p className="text-[11px] text-emerald-950 font-semibold">{speciesName} 시뮬레이션 결과</p>
                <p className="text-[10px] text-emerald-700">조경사가 첨부된 실사 절단선 및 미래 생장 이미지를 직접 확인합니다.</p>
              </div>
            </div>
          )}

          {/* 의뢰 유형 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">시공 / 자문 의뢰 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ONSITE_PRUNING', label: '현장 방문 수목 전지' },
                { id: 'REGULAR_CARE', label: '사계절 정기 관리 (구독)' },
                { id: 'REMOTE_COACHING', label: '비대면 원격 수형 첨삭' },
                { id: 'LANDSCAPE_DESIGN', label: '정원 리모델링 / 식재' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRequestType(t.id)}
                  className={`py-2 px-2.5 rounded-xl border text-left font-medium transition-all ${
                    requestType === t.id
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold ring-1 ring-emerald-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 의뢰 제목 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">요청서 제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
              required
            />
          </div>

          {/* 상세 내용 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">상세 요청 사항 (장비 진입, 폐기물 수거 등)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
              placeholder="예: 3m 이상 사다리 필요 여부, 폐기물 트럭 수거 희망 등"
            />
          </div>

          {/* 희망 일정 & 예산 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">희망 방문일</label>
              <input
                type="date"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">희망 예산 (최대, 원)</label>
              <input
                type="number"
                step="50000"
                value={maxBudget}
                onChange={e => setMaxBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200">
            💡 <strong>10대 골든 룰 보장:</strong> 등록된 조경사는 수목 생리학적 지융부 보존과 상처 유합제 처리를 원칙으로 시공합니다.
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? '견적 요청 발송 중...' : '견적 요청서 발송하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

