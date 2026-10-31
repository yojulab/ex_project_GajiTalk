import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { InspectBadge } from '../context/UiInspectContext';
import {
  Scissors,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getDashboard();
        if (res.success) {
          setStats(res.stats);
          setTrends(res.weeklyTrends || []);
        }
      } catch (err) {
        console.error('Fetch dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">통합 대시보드 통계 로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <InspectBadge serialId="P50-SEC01-CRD01" itemName="통합 운영 대시보드 및 지표 요약 카드" />

      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">수형 통합 운영 대시보드</h2>
        <p className="text-xs text-slate-500 mt-1">
          실사 AI 전지 시뮬레이션 및 정원주-조경사 O2O 거래액, 매칭 체결 지표를 실시간 모니터링합니다.
        </p>
      </div>

      {/* 핵심 KPI 4대 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">누적 AI 전지 시뮬레이션</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalSimulations || 0}</span>
            <span className="text-xs text-slate-400 ml-1">건</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">전주 대비 +34% 증가</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">매칭 견적 요청 체결률</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-indigo-600">{stats?.matchingRate || 85}%</span>
            <span className="text-xs text-slate-400 ml-1">({stats?.matchedRequests}/{stats?.totalRequests}건)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">평균 견적 도착 소요시간 2.4시간</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">월간 총 시공 거래액</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {(stats?.grossVolume || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1">원</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            플랫폼 수수료(10%): {(stats?.feeRevenue || 0).toLocaleString()}원
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">검증된 조경사 파트너</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.verifiedLandscapers || 0}</span>
            <span className="text-xs text-slate-400 ml-1">명 / 전체 {stats?.totalLandscapers}명</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">인증 명인 2명 보유</p>
        </div>
      </div>

      {/* 주간 시뮬레이션 및 매칭 거래액 추이 차트 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <InspectBadge serialId="P50-SEC02-CRD01" itemName="주간 시뮬레이션 및 매칭 거래액 차트" />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">주간 AI 시뮬레이션 건수 & 매칭 체결 추이</h3>
            <p className="text-xs text-slate-400">최근 7일간의 일별 활성 사용량 통계</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">AI 시뮬레이션</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-slate-600">매칭 체결</span>
            </div>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="simulations" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="AI 시뮬레이션" />
              <Line type="monotone" dataKey="matches" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="매칭 체결 건수" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 하단 2개 서브 그리드: 지역별 수급 & 수목 전지 10대 골든 룰 준수율 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <InspectBadge serialId="P50-SEC03-CRD01" itemName="지역별 정원주-조경사 수급 현황 카드" />
          <h4 className="font-bold text-xs text-slate-900">주요 권역별 정원주 의뢰 및 조경사 매칭 수급</h4>
          <div className="space-y-2 text-xs">
            {[
              { region: '경기 양평/가평권', requests: 48, landscapers: 12, rate: '92%' },
              { region: '서울 강남/서초권', requests: 36, landscapers: 10, rate: '88%' },
              { region: '경기 파주/고양권', requests: 28, landscapers: 8, rate: '85%' },
              { region: '서울 성북/종로권', requests: 22, landscapers: 7, rate: '90%' }
            ].map(item => (
              <div key={item.region} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-700">{item.region}</span>
                <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                  <span>의뢰 {item.requests}건</span>
                  <span>조경사 {item.landscapers}명</span>
                  <span className="font-bold text-emerald-600">체결률 {item.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <InspectBadge serialId="P50-SEC03-CRD02" itemName="수목학적 10대 골든 룰 준수율 리포트 카드" />
          <h4 className="font-bold text-xs text-slate-900">현장 시공 10대 전지 골든 룰 준수율 통계</h4>
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 font-medium">1. 지융부(Branch Collar) 보존율</span>
                <span className="font-bold text-emerald-600">99.2%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 font-medium">2. 1회 엽량 절제율 30% 이내 준수율</span>
                <span className="font-bold text-emerald-600">96.8%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 font-medium">3. 직경 2cm 이상 상처 유합제 도포율</span>
                <span className="font-bold text-emerald-600">98.5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98.5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

