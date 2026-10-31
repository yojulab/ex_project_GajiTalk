import React, { useState, useEffect } from 'react';
import { UiInspectProvider, InspectBadge } from './context/UiInspectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
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
  ArrowRightLeft,
  LogIn,
  LogOut,
  UserCheck,
  Smartphone
} from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isPartnerMode, setIsPartnerMode] = useState<boolean>(false);
  const [navParams, setNavParams] = useState<any>(null);
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem('soohyung_device_frame');
    return saved !== null ? saved === 'true' : false; // 기본값: 사용자 선호 유지
  });
  const { user, isLoggedIn, logout, openAuthModal, hasRole } = useAuth();

  const toggleDeviceFrame = () => {
    setIsDeviceFrame(prev => {
      const next = !prev;
      localStorage.setItem('soohyung_device_frame', String(next));
      return next;
    });
  };

  const handleNavigate = (page: string, params?: any) => {
    setActiveTab(page);
    setNavParams(params || null);
    if (!isDeviceFrame) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const scrollContainer = document.getElementById('device-screen-scroll');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleTogglePartnerMode = () => {
    if (!isPartnerMode) {
      // 조경사 권한 체크 (roles: ['조경사'])
      if (!hasRole('조경사')) {
        const confirmSwitch = confirm('조경사 파트너 모드는 [조경사] 권한이 필요합니다. 조경사 권한이 있는 계정으로 전환하거나 권한을 추가하시겠습니까?');
        if (confirmSwitch) {
          openAuthModal();
        }
        return;
      }
      setIsPartnerMode(true);
      setActiveTab('partner');
    } else {
      setIsPartnerMode(false);
      setActiveTab('home');
    }
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

  // 내부 모바일 화면 콘텐츠 컴포넌트
  const renderAppContent = (inFrame: boolean) => (
    <div className={`w-full ${inFrame ? 'h-full flex flex-col relative' : 'max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative pb-16'}`}>
      {/* 상단 글로벌 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between">
        <div
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-950 block leading-tight">
              수형 <span className="text-emerald-600 text-[10px] font-bold">SOOHYUNG</span>
            </span>
            <span className="text-[8.5px] text-slate-400 block font-medium">실사 전지 & 조경사 매칭</span>
          </div>
        </div>

        {/* 우측: 모드 전환, 로그인, 그리고 최상단 오른쪽 끝: 기기 프레임 모드 버튼 */}
        <div className="flex items-center gap-1.5">
          {/* 정원주 ⇄ 조경사 모드 전환 바 */}
          <div className="relative">
            <InspectBadge serialId="P01-SEC01-BTN02" itemName="정원주/조경사 모드 전환 스위치" />
            <button
              onClick={handleTogglePartnerMode}
              data-serial-id="P01-SEC01-BTN02"
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm cursor-pointer ${
                isPartnerMode
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{isPartnerMode ? '조경사' : '정원주'}</span>
            </button>
          </div>

          {/* 로그인/로그아웃 버튼 */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-1">
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[9.5px] font-bold text-slate-700 cursor-pointer"
                title="계정 정보 및 전환"
              >
                <img
                  src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="max-w-[42px] truncate">{user.name}</span>
                <span className="px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[7.5px] font-mono">
                  {user.roles?.[0]}
                </span>
              </button>
              <button
                onClick={logout}
                className="p-1 rounded-full bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[11px] font-bold shadow-sm cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>로그인</span>
            </button>
          )}

          {/* [핵심 요구사항] 최상단 오른쪽 끝: 기기 프레임 모드 버튼과 기능 */}
          <div className="relative pl-1 border-l border-slate-200">
            <InspectBadge serialId="P01-SEC01-BTN03" itemName="스마트폰 기기 프레임 모드 토글" />
            <button
              onClick={toggleDeviceFrame}
              data-serial-id="P01-SEC01-BTN03"
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isDeviceFrame
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isDeviceFrame ? '기기 프레임 끄기 (전체 화면 모드)' : '스마트폰 기기 프레임 모드 켜기'}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 본문 콘텐츠 */}
      <main className="flex-1 p-3.5">
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
      <nav className={`${inFrame ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 flex justify-around items-center`}>
        {isPartnerMode ? (
          <>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'partner' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">작업 탐색</span>
            </button>
            <button
              onClick={() => setIsPartnerMode(false)}
              className="flex flex-col items-center py-1 px-3 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">정원주 모드로</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleNavigate('home')}
              className={`flex flex-col items-center py-0.5 px-2 transition-all cursor-pointer ${
                activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span className="text-[9.5px]">홈</span>
            </button>
            <button
              onClick={() => handleNavigate('simulation')}
              className={`flex flex-col items-center py-0.5 px-2 transition-all cursor-pointer ${
                activeTab === 'simulation' || activeTab === 'capture' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Scissors className="w-4 h-4 mb-0.5" />
              <span className="text-[9.5px]">전지 AI</span>
            </button>
            <button
              onClick={() => handleNavigate('garden')}
              className={`flex flex-col items-center py-0.5 px-2 transition-all cursor-pointer ${
                activeTab === 'garden' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <TreePine className="w-4 h-4 mb-0.5" />
              <span className="text-[9.5px]">내 정원</span>
            </button>
            <button
              onClick={() => handleNavigate('directory')}
              className={`flex flex-col items-center py-0.5 px-2 transition-all cursor-pointer ${
                activeTab === 'directory' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              <span className="text-[9.5px]">조경사</span>
            </button>
            <button
              onClick={() => handleNavigate('matching')}
              className={`flex flex-col items-center py-0.5 px-2 transition-all cursor-pointer ${
                activeTab === 'matching' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4 mb-0.5" />
              <span className="text-[9.5px]">내 견적</span>
            </button>
          </>
        )}
      </nav>

      {/* 인증 모달 */}
      <AuthModal />
    </div>
  );

  return (
    <UiInspectProvider pageTitle={pageMeta.title} pageCode={pageMeta.code}>
      {isDeviceFrame ? (
        /* 스마트폰 기기 프레임 모드 (iPhone / Galaxy 스타일 목업) */
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-center text-slate-900 select-none sm:select-auto">
          {/* 상단 기기 정보 및 토글 안내 */}
          <div className="mb-3 flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/90 text-slate-300 rounded-full text-xs border border-slate-700/80 shadow-lg backdrop-blur">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">스마트폰 기기 프레임 모드 (390 × 844)</span>
            <button
              onClick={toggleDeviceFrame}
              className="ml-2 px-2 py-0.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
            >
              일반 뷰로 전환
            </button>
          </div>

          {/* 스마트폰 하드웨어 외곽 베젤 */}
          <div className="relative w-[390px] h-[844px] bg-slate-950 rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_2px_rgba(255,255,255,0.1)] border-[4px] border-slate-800 ring-8 ring-slate-950 flex flex-col">
            {/* 상단 다이나믹 아일랜드 노치 */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3 pointer-events-none shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-950/60" />
            </div>

            {/* 스마트폰 스크린 뷰포트 (내부 스크롤) */}
            <div
              id="device-screen-scroll"
              className="w-full h-full bg-white rounded-[42px] overflow-y-auto overflow-x-hidden flex flex-col relative"
            >
              {renderAppContent(true)}
            </div>

            {/* 하단 홈 인디케이터 바 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/80 rounded-full z-50 pointer-events-none" />
          </div>
        </div>
      ) : (
        /* 일반 반응형 모바일 뷰 */
        <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900">
          {renderAppContent(false)}
        </div>
      )}
    </UiInspectProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
