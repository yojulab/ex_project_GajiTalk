import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { InspectBadge } from '../context/UiInspectContext';
import { 
  Users, UserCheck, ShieldCheck, UserPlus, Search, 
  RefreshCw, Edit3, Trash2, Check, X, Shield, Award, AlertCircle 
} from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  avatarUrl?: string;
  landscaperProfile?: {
    verificationStatus?: string;
    isMasterBadge?: boolean;
    companyName?: string;
    experienceYears?: number;
  };
  createdAt: string;
}

const AVAILABLE_ROLES = [
  { id: 'member', label: '정원주 (member)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: '조경사', label: '전문 조경사 (조경사)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: '관리 매니저', label: '관리 매니저 (관리 매니저)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'admin', label: '총괄 관리자 (admin)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export const UserManagePage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [counts, setCounts] = useState({
    totalCount: 0,
    memberCount: 0,
    landscaperCount: 0,
    managerCount: 0,
    adminCount: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // 모달 상태
  const [editModalUser, setEditModalUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // 신규 등록 모달
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createEmail, setCreateEmail] = useState<string>('');
  const [createName, setCreateName] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [createPhone, setCreatePhone] = useState<string>('');
  const [createRoles, setCreateRoles] = useState<string[]>(['member']);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: searchTerm || undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined
      });
      if (res.success) {
        setUsers(res.users || []);
        if (res.counts) {
          setCounts(res.counts);
        }
      } else {
        alert(res.message || '회원 목록을 불러오지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditModalUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditRoles(Array.isArray(user.roles) ? [...user.roles] : ['member']);
  };

  const handleToggleEditRole = (roleId: string) => {
    if (editRoles.includes(roleId)) {
      if (editRoles.length === 1) {
        alert('회원은 최소 1개 이상의 권한을 보유해야 합니다.');
        return;
      }
      setEditRoles(editRoles.filter(r => r !== roleId));
    } else {
      setEditRoles([...editRoles, roleId]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editModalUser) return;
    if (editRoles.length === 0) {
      alert('최소 1개 이상의 권한을 선택해주세요.');
      return;
    }
    setSavingEdit(true);
    try {
      const res = await adminApi.updateUser(editModalUser._id, {
        name: editName,
        phone: editPhone,
        roles: editRoles
      });
      if (res.success) {
        alert('회원 정보 및 권한이 성공적으로 변경되었습니다.');
        setEditModalUser(null);
        fetchUsers();
      } else {
        alert(`수정 실패: ${res.message}`);
      }
    } catch (err: any) {
      alert(`수정 중 오류 발생: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleCreateRole = (roleId: string) => {
    if (createRoles.includes(roleId)) {
      if (createRoles.length === 1) return;
      setCreateRoles(createRoles.filter(r => r !== roleId));
    } else {
      setCreateRoles([...createRoles, roleId]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createName || !createPassword) {
      alert('이메일, 이름, 비밀번호는 필수 입력 항목입니다.');
      return;
    }
    setCreating(true);
    try {
      const res = await adminApi.createUser({
        email: createEmail,
        name: createName,
        password: createPassword,
        phone: createPhone,
        roles: createRoles
      });
      if (res.success) {
        alert('신규 회원이 성공적으로 등록되었습니다.');
        setShowCreateModal(false);
        setCreateEmail('');
        setCreateName('');
        setCreatePassword('');
        setCreatePhone('');
        setCreateRoles(['member']);
        fetchUsers();
      } else {
        alert(`등록 실패: ${res.message}`);
      }
    } catch (err: any) {
      alert(`등록 중 오류 발생: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!window.confirm(`정말 '${user.name}' (${user.email}) 회원을 탈퇴/삭제 처리하시겠습니까?`)) {
      return;
    }
    try {
      const res = await adminApi.deleteUser(user._id);
      if (res.success) {
        alert('회원이 삭제되었습니다.');
        fetchUsers();
      } else {
        alert(`삭제 실패: ${res.message}`);
      }
    } catch (err: any) {
      alert(`삭제 오류: ${err.message}`);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">총괄관리자</span>;
      case '관리 매니저':
        return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">매니저</span>;
      case '조경사':
        return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">조경사</span>;
      case 'member':
      default:
        return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">정원주</span>;
    }
  };

  return (
    <div className="space-y-6">
      <InspectBadge serialId="P55-ADMIN-USERS" itemName="통합 회원 및 권한 관리 시스템 (단일 컬럼 array 권한 체계)" />

      {/* 헤더 & 신규등록 버튼 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            회원 및 권한 관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            정원주, 조경사, 운영 매니저, 총괄 관리자 계정 권한(array)을 통합 관리하고 권한을 신속하게 조정합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 text-sm font-medium shadow-sm"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            data-serial-id="P55-SEC01-BTN01"
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            신규 회원 직접 등록
          </button>
        </div>
      </div>

      {/* 통계 요약 카드 5종 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div 
          onClick={() => setSelectedRole('ALL')}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            selectedRole === 'ALL' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">전체 회원</div>
          <div className="text-2xl font-bold mt-1">{counts.totalCount}명</div>
        </div>
        <div 
          onClick={() => setSelectedRole('member')}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            selectedRole === 'member' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">정원주 (고객)</div>
          <div className="text-2xl font-bold mt-1">{counts.memberCount}명</div>
        </div>
        <div 
          onClick={() => setSelectedRole('조경사')}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            selectedRole === '조경사' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">전문 조경사 (파트너)</div>
          <div className="text-2xl font-bold mt-1">{counts.landscaperCount}명</div>
        </div>
        <div 
          onClick={() => setSelectedRole('관리 매니저')}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            selectedRole === '관리 매니저' 
              ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">관리 매니저</div>
          <div className="text-2xl font-bold mt-1">{counts.managerCount}명</div>
        </div>
        <div 
          onClick={() => setSelectedRole('admin')}
          className={`cursor-pointer p-4 rounded-xl border transition ${
            selectedRole === 'admin' 
              ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">총괄 관리자</div>
          <div className="text-2xl font-bold mt-1">{counts.adminCount}명</div>
        </div>
      </div>

      {/* 검색 & 필터 바 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름, 이메일, 전화번호로 회원 검색..."
            className="w-full pl-10 pr-24 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition"
          >
            검색
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'member', '조경사', '관리 매니저', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedRole === role
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? '전체 보기' : role}
            </button>
          ))}
        </div>
      </div>

      {/* 회원 목록 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <InspectBadge serialId="P55-SEC03-TBL01" itemName="회원 목록 및 권한(array) 관리 테이블" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">회원 정보</th>
                <th className="py-3 px-4">연락처</th>
                <th className="py-3 px-4">보유 권한 (roles array)</th>
                <th className="py-3 px-4">조경사 자격 상태</th>
                <th className="py-3 px-4">가입일시</th>
                <th className="py-3 px-4 text-right">계정 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    회원 목록을 불러오는 중입니다...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    조건에 부합하는 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {user.name ? user.name.slice(0, 1) : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {user.name}
                            {user.landscaperProfile?.isMasterBadge && (
                              <span title="인증 명인 배지 보유">
                                <Award className="w-4 h-4 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {user.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(user.roles) && user.roles.map((r) => getRoleBadge(r))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {user.roles?.includes('조경사') ? (
                        user.landscaperProfile?.verificationStatus === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <Check className="w-3.5 h-3.5" /> 승인완료 ({user.landscaperProfile.experienceYears || 0}년 경력)
                          </span>
                        ) : user.landscaperProfile?.verificationStatus === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                            심사대기 중
                          </span>
                        ) : (
                          <span className="text-slate-400">미인증</span>
                        )
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          data-serial-id="P55-SEC03-BTN01"
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          권한/수정
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          data-serial-id="P55-SEC03-BTN02"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="회원 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 회원 권한 수정 모달 */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <InspectBadge serialId="P55-SEC04-MOD01" itemName="회원 정보 및 권한(array) 수정 모달" />
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">회원 정보 및 권한 수정</h3>
              </div>
              <button 
                onClick={() => setEditModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">계정 이메일</label>
                <input
                  type="text"
                  disabled
                  value={editModalUser.email}
                  className="w-full px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm border border-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">연락처</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  보유 권한 설정 (단일 컬럼 array 다중 부여 가능)
                </label>
                <div className="space-y-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isChecked = editRoles.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        onClick={() => handleToggleEditRole(role.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium">{role.label}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-emerald-600" />}
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  * 정원주, 조경사, 매니저, 총괄 관리자 권한을 복수로 부여할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {savingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신규 회원 직접 등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <InspectBadge serialId="P55-SEC05-MOD02" itemName="관리자 신규 회원 직접 등록 모달" />
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">신규 회원 직접 등록</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">이메일 (아이디) *</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="user@soohyung.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">이름 *</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">비밀번호 *</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="최소 6자 이상"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">연락처</label>
                <input
                  type="text"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  부여할 권한 (roles array)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isChecked = createRoles.includes(role.id);
                    return (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => handleToggleCreateRole(role.id)}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{role.label.split(' ')[0]}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  회원 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
