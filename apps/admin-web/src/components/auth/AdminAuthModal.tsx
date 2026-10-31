import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Users, Check, Shield, Award } from 'lucide-react';
import { useAdminAuth, UserRole } from '../../context/AdminAuthContext';
import { adminApi } from '../../services/adminApi';
import { InspectBadge } from '../../context/UiInspectContext';

export const AdminAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, switchUser } = useAdminAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'demo'>('login');

  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState<string>('admin@soohyung.kr');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');

  // 회원가입 폼
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('admin123');
  const [regRoles, setRegRoles] = useState<UserRole[]>(['admin', '관리 매니저']);

  // 데모 유저 목록
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      adminApi.getDemoUsers().then(res => {
        if (res.success) setDemoUsers(res.users);
      }).catch(console.error);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleToggleRole = (role: UserRole) => {
    if (regRoles.includes(role)) {
      if (regRoles.length === 1) {
        alert('최소 1개 이상의 권한이 선택되어야 합니다.');
        return;
      }
      setRegRoles(regRoles.filter(r => r !== role));
    } else {
      setRegRoles([...regRoles, role]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginEmail, loginPassword);
    if (success) {
      alert('관리자 로그인이 완료되었습니다.');
    } else {
      alert('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }
    const success = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      roles: regRoles
    });
    if (success) {
      alert(`[${regRoles.join(', ')}] 권한의 관리자 계정이 생성되어 로그인되었습니다!`);
    } else {
      alert('계정 생성에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-slate-900">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <InspectBadge serialId="P50-SEC05-MOD01" itemName="관리자 로그인 및 계정 관리 모달" />

        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">관리자 백오피스 인증 센터</h3>
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
            <span>계정 등록</span>
          </button>
          <button
            onClick={() => setTab('demo')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'demo' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>데모 전환</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">관리자 이메일</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">데모 비밀번호: admin123</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-xs"
              >
                관리자 로그인
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">이름 / 직책</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="예: 김운영 매니저"
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
                  placeholder="manager@soohyung.kr"
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

              {/* 회원 권한 array 관리 */}
              <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">부여할 권한 (Array 관리)</label>
                  <span className="text-[10px] text-emerald-700 font-bold font-mono">
                    [{regRoles.join(', ')}]
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', '관리 매니저', '조경사', 'member'] as UserRole[]).map(role => {
                    const isChecked = regRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleToggleRole(role)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-1 ring-emerald-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs">{role}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-xs"
              >
                신규 관리자 계정 생성
              </button>
            </form>
          )}

          {tab === 'demo' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500">
                원하는 관리자 또는 조경사 계정으로 즉시 전환하여 권한별 기능을 테스트하세요:
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
                      profileImage: u.profileImage
                    })}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 border rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[130px]">
                      {u.roles?.map((r: string) => (
                        <span
                          key={r}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            r === 'admin'
                              ? 'bg-rose-100 text-rose-800'
                              : r === '관리 매니저'
                              ? 'bg-indigo-100 text-indigo-800'
                              : r === '조경사'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-200 text-slate-700'
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

