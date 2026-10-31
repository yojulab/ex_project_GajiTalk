import React, { useRef, useEffect, useState } from 'react';
import { Scissors, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { InspectBadge } from '../../context/UiInspectContext';

export interface CuttingGuide {
  guideId: string;
  branchType: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  cutLineCoords: { x: number; y: number }[];
  branchPolygon: { x: number; y: number }[];
  reason: string;
  expectedEffect: string;
}

interface Props {
  imageUrl: string;
  cuttingGuides: CuttingGuide[];
  cutGuideIds: string[];
  onToggleCutGuide: (guideId: string) => void;
}

export const BranchOverlayCanvas: React.FC<Props> = ({
  imageUrl,
  cuttingGuides,
  cutGuideIds,
  onToggleCutGuide
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeGuide, setActiveGuide] = useState<CuttingGuide | null>(null);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);

  // Canvas 드로잉
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    cuttingGuides.forEach((guide) => {
      const isCut = cutGuideIds.includes(guide.guideId);
      if (isCut) return; // 잘린 가지는 숨김

      // 1. 가지 폴리곤 반투명 하이라이트
      if (guide.branchPolygon && guide.branchPolygon.length > 2) {
        ctx.beginPath();
        const firstPt = guide.branchPolygon[0];
        ctx.moveTo((firstPt.x / 100) * width, (firstPt.y / 100) * height);
        for (let i = 1; i < guide.branchPolygon.length; i++) {
          const pt = guide.branchPolygon[i];
          ctx.lineTo((pt.x / 100) * width, (pt.y / 100) * height);
        }
        ctx.closePath();

        const colorMap = {
          HIGH: 'rgba(239, 68, 68, 0.35)',
          MEDIUM: 'rgba(245, 158, 11, 0.35)',
          LOW: 'rgba(16, 185, 129, 0.35)'
        };
        ctx.fillStyle = colorMap[guide.priority] || colorMap.HIGH;
        ctx.fill();
        ctx.strokeStyle = guide.priority === 'HIGH' ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 2. 점선 절단선(Cutting Line)
      if (guide.cutLineCoords && guide.cutLineCoords.length >= 2) {
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        const p1 = guide.cutLineCoords[0];
        const p2 = guide.cutLineCoords[1];
        ctx.moveTo((p1.x / 100) * width, (p1.y / 100) * height);
        ctx.lineTo((p2.x / 100) * width, (p2.y / 100) * height);
        ctx.stroke();

        ctx.strokeStyle = guide.priority === 'HIGH' ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    });
  }, [cuttingGuides, cutGuideIds]);

  // 클릭/터치 이벤트: 절단선 근처를 클릭하면 툴팁 노출 또는 절단 토글
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setSwipeStart({ x: xPct, y: yPct });

    // 클릭된 가이드 찾기
    const hit = cuttingGuides.find(g => {
      if (cutGuideIds.includes(g.guideId)) return false;
      const center = g.cutLineCoords[0];
      const dist = Math.hypot(center.x - xPct, center.y - yPct);
      return dist < 8; // 반경 8% 이내
    });

    if (hit) {
      setActiveGuide(hit);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!swipeStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const dragDist = Math.hypot(xPct - swipeStart.x, yPct - swipeStart.y);
    // 스와이프 가위질 제스처 (드래그 5% 이상)
    if (dragDist > 5) {
      const hit = cuttingGuides.find(g => {
        if (cutGuideIds.includes(g.guideId)) return false;
        const p = g.cutLineCoords[0];
        const d = Math.hypot(p.x - ((swipeStart.x + xPct) / 2), p.y - ((swipeStart.y + yPct) / 2));
        return d < 10;
      });
      if (hit) {
        onToggleCutGuide(hit.guideId);
        setActiveGuide(null);
      }
    }
    setSwipeStart(null);
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-700 select-none" ref={containerRef}>
      <InspectBadge serialId="P03-SEC02-CNV01" itemName="실사 절단선 오버레이 & 가상 가위질 Canvas" />

      {/* 실사 배경 이미지 */}
      <img
        src={imageUrl}
        alt="수목 실사 원본"
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* 인터랙티브 Canvas 오버레이 */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      />

      {/* 가위질 버튼 마커들 */}
      {cuttingGuides.map((guide, idx) => {
        const isCut = cutGuideIds.includes(guide.guideId);
        if (isCut) return null;
        const p = guide.cutLineCoords[0] || { x: 50, y: 50 };

        return (
          <div
            key={guide.guideId}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <button
              onClick={() => onToggleCutGuide(guide.guideId)}
              className="group flex items-center gap-1 bg-white/95 text-slate-900 px-2 py-1 rounded-full shadow-lg border border-slate-300 hover:scale-110 active:scale-95 transition-all text-[11px] font-bold"
              title="클릭 또는 스와이프하여 가상 가위질"
            >
              <Scissors className="w-3.5 h-3.5 text-rose-600 animate-pulse group-hover:rotate-45 transition-transform" />
              <span>{guide.branchType}</span>
            </button>
          </div>
        );
      })}

      {/* 활성화된 절단선 상세 툴팁 카드 */}
      {activeGuide && (
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl z-30 animate-fade-in text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeGuide.priority === 'HIGH' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'
              }`}>
                {activeGuide.priority} 우선순위
              </span>
              <span className="font-bold text-sm text-emerald-400">{activeGuide.branchType} 절단 가이드</span>
            </div>
            <button
              onClick={() => setActiveGuide(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 mb-1 leading-relaxed"><strong className="text-white">절단 사유:</strong> {activeGuide.reason}</p>
          <p className="text-slate-300 mb-2 leading-relaxed"><strong className="text-white">기대 효과:</strong> {activeGuide.expectedEffect}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                onToggleCutGuide(activeGuide.guideId);
                setActiveGuide(null);
              }}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>이 가지 가상 자르기</span>
            </button>
          </div>
        </div>
      )}

      {/* 안내 뱃지 */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none">
        <Info className="w-3 h-3 text-emerald-400" />
        <span>가위 마커 클릭 또는 라인 스와이프</span>
      </div>
    </div>
  );
};

