import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Users, Check, Shield, Award, UserCheck } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InspectBadge } from '../../context/UiInspectContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, switchUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'demo'>('login');

  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState<string>('garden1@soohyung.kr');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');

  // 회원가입 폼
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('admin123');
  const [regPhone, setRegPhone] = useState<string>('010-0000-0000');
  // 회원 권한 array 관리: member, admin, 조경사, 관리 매니저
  const [regRoles, setRegRoles] = useState<UserRole[]>(['member']);

  // 데모 유저 목록
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  // 상태 메시지 및 로딩
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setStatusMsg(null);
      api.getDemoUsers().then(res => {
        if (res.success) setDemoUsers(res.users);
      }).catch(console.error);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleToggleRole = (role: UserRole) => {
    if (regRoles.includes(role)) {
      if (regRoles.length === 1) {
        setStatusMsg({ type: 'error', text: '최소 1개 이상의 권한이 선택되어야 합니다.' });
        return;
      }
      setRegRoles(regRoles.filter(r => r !== role));
    } else {
      setRegRoles([...regRoles, role]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const result = await login(loginEmail.trim(), loginPassword.trim());
      if (result.success) {
        closeAuthModal();
      } else {
        setStatusMsg({ type: 'error', text: result.message || '로그인 실패: 이메일 또는 비밀번호를 확인해주세요.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || '서버 통신 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, password = 'admin123') => {
    setLoginEmail(email);
    setLoginPassword(password);
    setLoading(true);
    setStatusMsg(null);
    try {
      const result = await login(email, password);
      if (result.success) {
        closeAuthModal();
      } else {
        setStatusMsg({ type: 'error', text: result.message || '로그인 실패' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || '오류 발생' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      setStatusMsg({ type: 'error', text: '이름과 이메일을 입력해주세요.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const result = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim(),
        roles: regRoles
      });
      if (result.success) {
        setStatusMsg({ type: 'success', text: `[${regRoles.join(', ')}] 권한으로 가입되어 자동 로그인되었습니다!` });
        setTimeout(() => {
          closeAuthModal();
        }, 600);
      } else {
        setStatusMsg({ type: 'error', text: result.message || '회원가입에 실패했습니다.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || '서버 통신 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        <InspectBadge serialId="P01-SEC05-MOD01" itemName="통합 회원가입 및 로그인 모달 (AuthModal)" />

        {/* 헤더 */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">수형 회원 인증 센터</h3>
          </div>
          <button onClick={closeAuthModal} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 바 */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setTab('login')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인</span>
          </button>
          <button
            onClick={() => setTab('register')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>회원가입</span>
          </button>
          <button
            onClick={() => setTab('demo')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'demo' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>데모 빠른전환</span>
          </button>
        </div>

        {/* 본문 컨텐츠 */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* [1] 로그인 탭 */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1.5">⚡ 원클릭 빠른 데모 로그인:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('garden1@soohyung.kr')}
                    className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold text-left flex flex-col transition-all border border-emerald-300 shadow-sm cursor-pointer"
                  >
                    <span>정원주 김정원</span>
                    <span className="text-[9.5px] text-emerald-600 font-mono">garden1@soohyung.kr</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('master_choi@soohyung.kr')}
                    className="p-2 rounded-xl bg-white hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold text-left flex flex-col transition-all border border-indigo-300 shadow-sm cursor-pointer"
                  >
                    <span>최송석 조경명인</span>
                    <span className="text-[9.5px] text-indigo-600 font-mono">master_choi@soohyung.kr</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('tree_doc_han@soohyung.kr')}
                    className="p-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-[11px] font-bold text-left flex flex-col transition-all border border-amber-300 shadow-sm cursor-pointer"
                  >
                    <span>한수목 나무의사</span>
                    <span className="text-[9.5px] text-amber-600 font-mono">tree_doc_han@soohyung.kr</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@soohyung.kr')}
                    className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-900 text-[11px] font-bold text-left flex flex-col transition-all border border-slate-300 shadow-sm cursor-pointer"
                  >
                    <span>통합 총괄관리자</span>
                    <span className="text-[9.5px] text-slate-600 font-mono">admin@soohyung.kr</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <div className="h-px bg-slate-200 flex-1" />
                <span>또는 직접 이메일/비밀번호 입력</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">이메일 계정</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="name@soohyung.kr"
                  className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">데모 비밀번호: admin123</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 active:scale-98 text-white font-extrabold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? '로그인 처리 중...' : '로그인하기'}</span>
              </button>
            </form>
          )}

          {/* [2] 회원가입 탭 (권한 array 관리) */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">이름</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              {/* 회원 권한 array 관리 (member, admin, 조경사, 관리 매니저) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    회원 권한 선택 (Array 복수 관리)
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold font-mono">
                    [{regRoles.join(', ')}]
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  사용자에게 부여할 권한을 선택하세요 (하나의 컬럼에 array 형태로 안전하게 관리됩니다):
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(['member', '조경사', '관리 매니저', 'admin'] as UserRole[]).map(role => {
                    const isChecked = regRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleToggleRole(role)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-1 ring-emerald-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{role}</div>
                          <div className="text-[9.5px] text-slate-400">
                            {role === 'member' ? '일반 정원주' : role === '조경사' ? '전문 조경 파트너' : role === '관리 매니저' ? '현장/운영 매니저' : '총괄 관리자'}
                          </div>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>회원가입 완료 및 로그인</span>
              </button>
            </form>
          )}

          {/* [3] 데모 빠른 원클릭 전환 탭 */}
          {tab === 'demo' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-500">
                시드된 각 역할별 계정을 클릭하면 즉시 해당 권한(array)으로 전환됩니다:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {demoUsers.map(u => (
                  <div
                    key={u._id}
                    onClick={() => switchUser({
                      id: u._id,
                      _id: u._id,
                      name: u.name,
                      email: u.email,
                      roles: u.roles || ['member'],
                      profileImage: u.profileImage,
                      landscaperProfile: u.landscaperProfile
                    })}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-end max-w-[130px]">
                      {u.roles?.map((r: string) => (
                        <span
                          key={r}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            r === 'admin'
                              ? 'bg-rose-100 text-rose-800'
                              : r === '조경사'
                              ? 'bg-amber-100 text-amber-900'
                              : r === '관리 매니저'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

