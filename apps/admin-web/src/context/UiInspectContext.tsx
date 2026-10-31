import React, { createContext, useContext, useState, useEffect } from 'react';

interface UiInspectContextType {
  inspectMode: boolean;
  toggleInspectMode: () => void;
  copyInspectInfo: (serialId: string, itemName: string) => void;
  toastMessage: string | null;
}

const UiInspectContext = createContext<UiInspectContextType>({
  inspectMode: false,
  toggleInspectMode: () => {},
  copyInspectInfo: () => {},
  toastMessage: null,
});

export const UiInspectProvider: React.FC<{ children: React.ReactNode; pageTitle: string; pageCode: string }> = ({
  children,
  pageTitle,
  pageCode
}) => {
  const [inspectMode, setInspectMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleInspectMode = () => {
    setInspectMode((prev) => {
      const next = !prev;
      setToastMessage(next ? '🔍 UI inspect 활성화 (클릭 시 4대 정보 복사)' : 'UI inspect 비활성화 (숨김)');
      setTimeout(() => setToastMessage(null), 2500);
      return next;
    });
  };

  const copyInspectInfo = (serialId: string, itemName: string) => {
    const uri = window.location.href;
    const pageInfo = `${pageTitle} (${pageCode}) - 수형 (SOOHYUNG) 관리자`;
    const textToCopy = `- 일련번호: ${serialId}\n- 페이지명: ${pageInfo}\n- URI: ${uri}\n- 항목명: ${itemName}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setToastMessage(`📋 [${serialId}] 4대 정보 복사 완료!`);
        setTimeout(() => setToastMessage(null), 2000);
      }).catch(() => {
        prompt('클립보드 복사:', textToCopy);
      });
    } else {
      prompt('클립보드 복사:', textToCopy);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'i' || e.key === 'I')) || (e.ctrlKey && e.shiftKey && (e.key === 't' || e.key === 'T'))) {
        e.preventDefault();
        toggleInspectMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <UiInspectContext.Provider value={{ inspectMode, toggleInspectMode, copyInspectInfo, toastMessage }}>
      {children}
      {/* 플로팅 FAB 토글 버튼 */}
      <button
        onClick={toggleInspectMode}
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all ${
          inspectMode
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-300'
            : 'bg-slate-900/90 text-slate-200 hover:bg-slate-900'
        }`}
        title="단축키 Alt+I 로 UI inspect 모드를 켜고 끌 수 있습니다"
      >
        <span>🏷️</span>
        <span>{inspectMode ? 'UI inspect ON (Alt+I)' : 'UI inspect (Alt+I)'}</span>
      </button>

      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-2xl backdrop-blur border border-slate-700 animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </UiInspectContext.Provider>
  );
};

export const useUiInspect = () => useContext(UiInspectContext);

export const InspectBadge: React.FC<{ serialId: string; itemName: string }> = ({ serialId, itemName }) => {
  const { inspectMode, copyInspectInfo } = useUiInspect();
  const [copied, setCopied] = useState(false);

  if (!inspectMode) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyInspectInfo(serialId, itemName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      data-serial-id={serialId}
      title={`${itemName} - 클릭하여 4대 정보 복사`}
      className={`absolute -top-2 -left-1 z-40 px-1.5 py-0.5 text-[9.5px] font-mono font-bold rounded shadow-md border transition-transform hover:scale-110 cursor-pointer ${
        copied
          ? 'bg-emerald-500 text-white border-emerald-300'
          : 'bg-indigo-600 text-white border-white/40 hover:bg-indigo-700'
      }`}
    >
      {copied ? '[Copied! ✓]' : serialId}
    </button>
  );
};

