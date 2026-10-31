import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { InspectBadge } from '../context/UiInspectContext';
import { Award, CheckCircle2, XCircle, ShieldAlert, FileText, Star, RefreshCw } from 'lucide-react';

export const LandscaperVerifyPage: React.FC = () => {
  const [landscapers, setLandscapers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchLandscapers = async () => {
    try {
      const res = await adminApi.getLandscapers(filterStatus || undefined);
      if (res.success) {
        setLandscapers(res.landscapers || []);
      }
    } catch (err) {
      console.error('Fetch landscapers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandscapers();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await adminApi.verifyLandscaper(id, { status });
      if (res.success) {
        alert(res.message);
        fetchLandscapers();
      }
    } catch (err: any) {
      alert(`상태 변경 실패: ${err.message}`);
    }
  };

  const handleToggleMaster = async (id: string, current: boolean) => {
    try {
      const res = await adminApi.verifyLandscaper(id, { isMasterBadge: !current });
      if (res.success) {
        alert(!current ? '인증 명인 배지가 수여되었습니다.' : '명인 배지가 해제되었습니다.');
        fetchLandscapers();
      }
    } catch (err: any) {
      alert(`배지 변경 실패: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">조경사 심사 목록 로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <InspectBadge serialId="P52-SEC01-CRD01" itemName="조경사 파트너 자격 심사 및 명인 배지 관리 화면" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">조경사 자격 심사 & 명인 배지 관리</h2>
          <p className="text-xs text-slate-500 mt-1">
            신규 파트너의 조경기술사·기사·나무의사 자격증과 시공 포트폴리오를 심사하고 우수 명인 배지를 부여합니다.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {['', 'PENDING', 'VERIFIED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {st === '' ? '전체' : st === 'PENDING' ? '심사대기' : st === 'VERIFIED' ? '인증완료' : '반려'}
            </button>
          ))}
        </div>
      </div>

      {/* 조경사 심사 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {landscapers.map(land => {
          const profile = land.landscaperProfile;
          const isPending = profile?.verificationStatus === 'PENDING';
          const isVerified = profile?.verificationStatus === 'VERIFIED';
          const portfolio = profile?.portfolios?.[0];

          return (
            <div
              key={land._id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all space-y-4 ${
                isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={land.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'}
                    alt={land.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900">{land.name}</h4>
                      {profile?.isMasterBadge && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[9.5px] font-bold border border-amber-300 flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>인증 명인</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{profile?.companyName || '상호 미등록'} · 경력 {profile?.experienceYears || 0}년</p>
                    <p className="text-[10px] text-slate-400">{land.email} · {land.phone}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isPending ? 'bg-amber-100 text-amber-900' : isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {profile?.verificationStatus}
                </span>
              </div>

              {/* 자격증 목록 */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-500 block text-[10px] mb-1">제출 자격 증명</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.certifications && profile.certifications.length > 0 ? (
                    profile.certifications.map((c: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-slate-700 rounded border border-slate-200 text-[10px] font-medium">
                        ✓ {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">자격증 미제출 (경력 검토 필요)</span>
                  )}
                </div>
              </div>

              {/* 대표 시공 포트폴리오 */}
              {portfolio && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <span className="font-bold text-slate-500 block text-[10px]">시공 Before & After 포트폴리오</span>
                  <div className="grid grid-cols-2 gap-2">
                    <img src={portfolio.beforeImageUrl} alt="전" className="aspect-video rounded object-cover" />
                    <img src={portfolio.afterImageUrl} alt="후" className="aspect-video rounded object-cover" />
                  </div>
                  <p className="text-[10px] text-slate-600 truncate mt-1">{portfolio.title}</p>
                </div>
              )}

              {/* 심사 액션 버튼들 */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleToggleMaster(land._id, profile?.isMasterBadge || false)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1 ${
                    profile?.isMasterBadge
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{profile?.isMasterBadge ? '명인 배지 해제' : '명인 배지 부여'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(land._id, 'REJECTED')}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs border border-rose-200"
                  >
                    반려
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(land._id, 'VERIFIED')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm"
                  >
                    자격 승인
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

