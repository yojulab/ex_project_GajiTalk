import React, { useState, useRef } from 'react';
import { InspectBadge } from '../../context/UiInspectContext';

interface Props {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<Props> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = '전지 전 (현재)',
  afterLabel = '전지 직후 (AI 실사)'
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-700 select-none cursor-ew-resize touch-none"
    >
      <InspectBadge serialId="P03-SEC03-SLD01" itemName="전지 전/직후 비교 슬라이더 (BeforeAfterSlider)" />

      {/* After 이미지 (베이스) */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-3 right-3 bg-emerald-700/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
        {afterLabel}
      </div>

      {/* Before 이미지 (클립 영역) */}
      <div
        style={{ width: `${sliderPos}%` }}
        className="absolute inset-0 h-full overflow-hidden border-r-2 border-white shadow-2xl"
      >
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
          {beforeLabel}
        </div>
      </div>

      {/* 중앙 분할선 & 원형 핸들 */}
      <div
        style={{ left: `${sliderPos}%` }}
        className="absolute top-0 bottom-0 -translate-x-1/2 pointer-events-none flex items-center justify-center"
      >
        <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center border-2 border-emerald-500 font-bold text-xs">
          ↔
        </div>
      </div>
    </div>
  );
};

