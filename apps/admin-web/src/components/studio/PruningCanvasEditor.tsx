import React, { useRef, useEffect, useState } from 'react';
import { Scissors, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { InspectBadge } from '../../context/UiInspectContext';

interface CuttingGuide {
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
  guides: CuttingGuide[];
  onChangeGuides: (guides: CuttingGuide[]) => void;
}

export const PruningCanvasEditor: React.FC<Props> = ({ imageUrl, guides, onChangeGuides }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [newCutLine, setNewCutLine] = useState<{ x: number; y: number }[]>([]);

  // 캔버스 드로잉
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    guides.forEach((g, idx) => {
      const isSelected = selectedIdx === idx;

      // 1. 폴리곤
      if (g.branchPolygon && g.branchPolygon.length > 2) {
        ctx.beginPath();
        ctx.moveTo((g.branchPolygon[0].x / 100) * width, (g.branchPolygon[0].y / 100) * height);
        for (let i = 1; i < g.branchPolygon.length; i++) {
          ctx.lineTo((g.branchPolygon[i].x / 100) * width, (g.branchPolygon[i].y / 100) * height);
        }
        ctx.closePath();
        ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.45)' : 'rgba(239, 68, 68, 0.35)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#2563eb' : '#ef4444';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();
      }

      // 2. 점선 절단선
      if (g.cutLineCoords && g.cutLineCoords.length >= 2) {
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo((g.cutLineCoords[0].x / 100) * width, (g.cutLineCoords[0].y / 100) * height);
        ctx.lineTo((g.cutLineCoords[1].x / 100) * width, (g.cutLineCoords[1].y / 100) * height);
        ctx.stroke();

        ctx.strokeStyle = isSelected ? '#2563eb' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    });

    // 신규 그리는 중인 절단선
    if (newCutLine.length === 2) {
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo((newCutLine[0].x / 100) * width, (newCutLine[0].y / 100) * height);
      ctx.lineTo((newCutLine[1].x / 100) * width, (newCutLine[1].y / 100) * height);
      ctx.stroke();
      ctx.restore();
    }
  }, [guides, selectedIdx, newCutLine]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setNewCutLine([{ x, y }]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (newCutLine.length === 1) {
      const p1 = newCutLine[0];
      const p2 = { x, y };
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (dist > 3) {
        // 새 가이드 추가
        const newGuide: CuttingGuide = {
          guideId: `GUIDE-ADMIN-${Date.now()}`,
          branchType: '도장지',
          priority: 'HIGH',
          cutLineCoords: [p1, p2],
          branchPolygon: [p1, { x: (p1.x + p2.x) / 2 + 5, y: (p1.y + p2.y) / 2 - 10 }, p2],
          reason: '전문가 Canvas 에디터에서 신규 지정한 도장지 절단선입니다.',
          expectedEffect: '지융부 보존 기부 절단으로 하부 주지 채광 확보'
        };
        onChangeGuides([...guides, newGuide]);
        setSelectedIdx(guides.length);
      }
    }

    setIsDrawing(false);
    setNewCutLine([]);
  };

  const handleDeleteSelected = () => {
    if (guides.length <= 1) {
      alert('최소 1개 이상의 절단선이 유지되어야 합니다.');
      return;
    }
    const next = guides.filter((_, idx) => idx !== selectedIdx);
    onChangeGuides(next);
    setSelectedIdx(0);
  };

  return (
    <div className="space-y-3">
      <InspectBadge serialId="P53-SEC05-CNV01" itemName="전문가용 Canvas 절단선 첨삭 에디터" />

      {/* Canvas 에디터 영역 */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-700 select-none">
        <img src={imageUrl} alt="수목 원본" className="w-full h-full object-cover pointer-events-none" />
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />

        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
          전문가 첨삭 모드: 드래그하여 신규 절단선 추가
        </div>
      </div>

      {/* 가이드 선택 및 편집 패널 */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800">
            절단선 목록 ({guides.length}개 포인트)
          </span>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>선택 절단선 삭제</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {guides.map((g, idx) => (
            <button
              key={g.guideId}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                selectedIdx === idx
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{idx + 1}. {g.branchType} ({g.priority})</span>
            </button>
          ))}
        </div>

        {/* 선택된 절단선 속성 편집 */}
        {guides[selectedIdx] && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">가지 유형 (7대 기피 가지)</label>
              <select
                value={guides[selectedIdx].branchType}
                onChange={e => {
                  const next = [...guides];
                  next[selectedIdx].branchType = e.target.value;
                  onChangeGuides(next);
                }}
                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
              >
                <option value="도장지">도장지 (웃자란 가지)</option>
                <option value="내향지">내향지 (안쪽 자람 가지)</option>
                <option value="교차지">교차지 (얽힌 가지)</option>
                <option value="하향지">하향지 (처진 가지)</option>
                <option value="병충해가지">병충해가지 / 고사지</option>
                <option value="평행지">평행지</option>
                <option value="맹아지">맹아지 (뿌리순)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">우선순위</label>
              <select
                value={guides[selectedIdx].priority}
                onChange={e => {
                  const next = [...guides];
                  next[selectedIdx].priority = e.target.value as any;
                  onChangeGuides(next);
                }}
                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
              >
                <option value="HIGH">HIGH (필수 제거)</option>
                <option value="MEDIUM">MEDIUM (선택 솎기)</option>
                <option value="LOW">LOW (약전정)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

