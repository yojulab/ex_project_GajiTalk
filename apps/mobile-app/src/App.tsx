import React, { useState } from 'react';
import { UiInspectProvider, InspectBadge } from './context/UiInspectContext';
import { HomePage } from './pages/HomePage';
import { CaptureAndAnalyzePage } from './pages/CaptureAndAnalyzePage';
import { SimulationResultPage } from './pages/SimulationResultPage';
import { MyGardenPage } from './pages/MyGardenPage';
import { LandscaperDirectoryPage } from './pages/LandscaperDirectoryPage';
import { MatchingStatusPage } from './pages/MatchingStatusPage';
import { PartnerJobBoardPage } from './pages/PartnerJobBoardPage';
import {
  TreePine,
  Scissors,
  Users,
  Calendar,
  Home,
  Briefcase,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isPartnerMode, setIsPartnerMode] = useState<boolean>(false);
  const [navParams, setNavParams] = useState<any>(null);

  const handleNavigate = (page: string, params?: any) => {
    setActiveTab(page);
    setNavParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageMeta = () => {
    if (isPartnerMode) {
      return { title: '조경사 파트너 잡보드', code: 'P07' };
    }
    switch (activeTab) {
      case 'home': return { title: '정원주 메인 홈', code: 'P01' };
      case 'capture': return { title: '수목 촬영 및 AI 분석', code: 'P02' };
      case 'simulation': return { title: '실사 전지 & 생장 시뮬레이션', code: 'P03' };
      case 'garden': return { title: '내 정원 타임라인', code: 'P04' };
      case 'directory': return { title: '전문 조경사 탐색', code: 'P05' };
      case 'matching': return { title: '내 견적 의뢰 현황', code: 'P06' };
      default: return { title: '수형 모바일', code: 'P00' };
    }
  };

  const pageMeta = getPageMeta();

  return (
    <UiInspectProvider pageTitle={pageMeta.title} pageCode={pageMeta.code}>
      <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative">

          {/* 상단 글로벌 헤더 */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-950 block leading-tight">
                  수형 <span className="text-emerald-600 text-xs font-bold">SOOHYUNG</span>
                </span>
                <span className="text-[9.5px] text-slate-400 block font-medium">실사 전지 & 조경사 매칭</span>
              </div>
            </div>

            {/* 정원주 ⇄ 조경사 모드 전환 바 */}
            <div className="relative">
              <InspectBadge serialId="P01-SEC01-BTN02" itemName="정원주/조경사 모드 전환 스위치" />
              <button
                onClick={() => {
                  setIsPartnerMode(!isPartnerMode);
                  setActiveTab(isPartnerMode ? 'home' : 'partner');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isPartnerMode
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isPartnerMode ? '조경사 파트너' : '정원주 모드'}</span>
              </button>
            </div>
          </header>

          {/* 본문 콘텐츠 */}
          <main className="flex-1 p-4">
            {isPartnerMode ? (
              <PartnerJobBoardPage />
            ) : (
              <>
                {activeTab === 'home' && <HomePage onNavigate={handleNavigate} />}
                {activeTab === 'capture' && <CaptureAndAnalyzePage onNavigate={handleNavigate} />}
                {activeTab === 'simulation' && (
                  <SimulationResultPage
                    simulationId={navParams?.simulationId}
                    onNavigate={handleNavigate}
                  />
                )}
                {activeTab === 'garden' && <MyGardenPage onNavigate={handleNavigate} />}
                {activeTab === 'directory' && <LandscaperDirectoryPage onNavigate={handleNavigate} />}
                {activeTab === 'matching' && <MatchingStatusPage onNavigate={handleNavigate} />}
              </>
            )}
          </main>

          {/* 하단 네비게이션 바 */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-2 flex justify-around items-center">
            {isPartnerMode ? (
              <>
                <button
                  onClick={() => setActiveTab('partner')}
                  className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                    activeTab === 'partner' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">작업 탐색</span>
                </button>
                <button
                  onClick={() => setIsPartnerMode(false)}
                  className="flex flex-col items-center py-1 px-3 text-slate-400 hover:text-slate-700"
                >
                  <Home className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">정원주 모드로</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('home')}
                  className={`flex flex-col items-center py-1 px-2 transition-all ${
                    activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Home className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">홈</span>
                </button>
                <button
                  onClick={() => handleNavigate('simulation')}
                  className={`flex flex-col items-center py-1 px-2 transition-all ${
                    activeTab === 'simulation' || activeTab === 'capture' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Scissors className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">전지 AI</span>
                </button>
                <button
                  onClick={() => handleNavigate('garden')}
                  className={`flex flex-col items-center py-1 px-2 transition-all ${
                    activeTab === 'garden' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <TreePine className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">내 정원</span>
                </button>
                <button
                  onClick={() => handleNavigate('directory')}
                  className={`flex flex-col items-center py-1 px-2 transition-all ${
                    activeTab === 'directory' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">조경사</span>
                </button>
                <button
                  onClick={() => handleNavigate('matching')}
                  className={`flex flex-col items-center py-1 px-2 transition-all ${
                    activeTab === 'matching' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Calendar className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">내 견적</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </UiInspectProvider>
  );
};
export default App;

