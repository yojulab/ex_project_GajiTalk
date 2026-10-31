import React, { useState } from 'react';
import { UiInspectProvider, InspectBadge } from './context/UiInspectContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { MatchingManagePage } from './pages/MatchingManagePage';
import { LandscaperVerifyPage } from './pages/LandscaperVerifyPage';
import { SimulationReviewPage } from './pages/SimulationReviewPage';
import { SpeciesManagePage } from './pages/SpeciesManagePage';
import { UserManagePage } from './pages/UserManagePage';
import {
  LayoutDashboard,
  Layers,
  Award,
  Scissors,
  BookOpen,
  TreePine,
  ExternalLink,
  Shield,
  LogIn,
  LogOut,
  UserCheck,
  Users
} from 'lucide-react';

const AdminMainContent: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const { adminUser, isLoggedIn, logout, openAuthModal } = useAdminAuth();

  const getPageMeta = () => {
    switch (activeMenu) {
      case 'dashboard': return { title: '통합 운영 대시보드', code: 'P50' };
      case 'users': return { title: '통합 회원 및 권한 관리', code: 'P55' };
      case 'matching': return { title: '매칭 및 분쟁 중재', code: 'P51' };
      case 'verify': return { title: '조경사 자격 심사', code: 'P52' };
      case 'studio': return { title: 'AI 전지 검수 스튜디오', code: 'P53' };
      case 'species': return { title: '수종 도감 및 단가표 관리', code: 'P54' };
      default: return { title: '수형 관리자', code: 'P50' };
    }
  };

  const pageMeta = getPageMeta();

  return (
    <UiInspectProvider pageTitle={pageMeta.title} pageCode={pageMeta.code}>
      <div className="min-h-screen bg-slate-100 flex text-slate-900 font-['Pretendard',sans-serif]">

        {/* 좌측 관리자 고정 사이드바 */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0">
          <div className="space-y-6">
            {/* 로고 */}
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight text-white block">
                  수형 <span className="text-emerald-400 text-xs font-bold">ADMIN</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">통합 백오피스 & 스튜디오</span>
              </div>
            </div>

            {/* 내비게이션 메뉴 */}
            <nav className="space-y-1 text-xs">
              {[
                { id: 'dashboard', label: '운영 대시보드', code: 'P50', icon: LayoutDashboard },
                { id: 'users', label: '회원 및 권한 관리', code: 'P55', icon: Users },
                { id: 'matching', label: '매칭 & 분쟁 중재', code: 'P51', icon: Layers },
                { id: 'verify', label: '조경사 파트너 심사', code: 'P52', icon: Award },
                { id: 'studio', label: '전문가 첨삭 스튜디오', code: 'P53', icon: Scissors },
                { id: 'species', label: '수종 도감 & 표준 단가', code: 'P54', icon: BookOpen },
              ].map(item => {
                const isActive = activeMenu === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.code}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 하단 모바일 앱 바로가기 및 관리자 프로필 */}
          <div className="space-y-2">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>정원주 모바일 앱</span>
                <span className="text-emerald-400 font-bold">:30018</span>
              </div>
              <a
                href="http://localhost:30018"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <span>모바일 앱 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* 본문 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* 상단 헤더 (로그인 정보 & 권한 뱃지) */}
          <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>수형 관리 시스템</span>
              <span>/</span>
              <span className="font-bold text-slate-900">{pageMeta.title}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-indigo-600">
                {pageMeta.code}
              </span>
            </div>

            {/* 우측 관리자 프로필 & 로그인/로그아웃 */}
            <div className="flex items-center gap-3 text-xs">
              {isLoggedIn && adminUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openAuthModal}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-left"
                    title="계정 정보 및 전환"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {adminUser.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{adminUser.name}</div>
                      <div className="flex gap-1 mt-0.5">
                        {adminUser.roles?.map(r => (
                          <span key={r} className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>관리자 로그인</span>
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 p-8">
            {activeMenu === 'dashboard' && <DashboardPage />}
            {activeMenu === 'users' && <UserManagePage />}
            {activeMenu === 'matching' && <MatchingManagePage />}
            {activeMenu === 'verify' && <LandscaperVerifyPage />}
            {activeMenu === 'studio' && <SimulationReviewPage />}
            {activeMenu === 'species' && <SpeciesManagePage />}
          </main>
        </div>

        {/* 관리자 인증 모달 */}
        <AdminAuthModal />
      </div>
    </UiInspectProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminMainContent />
    </AdminAuthProvider>
  );
};

export default App;
