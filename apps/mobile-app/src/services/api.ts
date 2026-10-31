// 클라이언트 브라우저 환경에 맞는 최적의 API Base URL 결정
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // 상대경로 /api 지정 시 즉시 반환 (가장 안전한 리버스 프록시)
  if (!envUrl || envUrl === '/api') return '/api';

  if (typeof window !== 'undefined') {
    // 만약 localhost가 하드코딩되어 있는데 사용자가 다른 IP나 호스트로 접속한 경우
    // 브라우저 머신에 30020 포트가 없으므로 무조건 상대경로 /api로 통신해야 Failed to fetch 방지
    if (envUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  return envUrl;
};

const BASE_URL = resolveApiBaseUrl();

export const api = {
  // 인증
  async login(data: { email: string; password?: string }) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok && !json.message) {
        json.message = `HTTP ${res.status} 오류`;
      }
      return json;
    } catch (err: any) {
      return { success: false, message: `네트워크 연결 실패 (${err.message})` };
    }
  },

  async register(data: any) {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `네트워크 연결 실패 (${err.message})` };
    }
  },

  async logout() {
    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: true };
    }
  },

  async getDemoUsers() {
    try {
      const res = await fetch(`${BASE_URL}/auth/demo-users`);
      return await res.json();
    } catch (err: any) {
      return { success: false, users: [] };
    }
  },

  // 시뮬레이션
  async analyzeTree(data: { imageUrl: string; speciesName: string; targetGoal: string }) {
    const res = await fetch(`${BASE_URL}/simulations/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getSimulation(id: string) {
    const res = await fetch(`${BASE_URL}/simulations/${id}`);
    return res.json();
  },

  async listSimulations() {
    const res = await fetch(`${BASE_URL}/simulations`);
    return res.json();
  },

  async reRenderSimulation(id: string, selectedGuideIds: string[]) {
    const res = await fetch(`${BASE_URL}/simulations/${id}/re-render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedGuideIds })
    });
    return res.json();
  },

  // 정원
  async getMyGarden() {
    const res = await fetch(`${BASE_URL}/gardens/my`);
    return res.json();
  },

  async createGarden(data: any) {
    const res = await fetch(`${BASE_URL}/gardens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 매칭 & 조경사
  async getLandscapers(params?: { specialty?: string; isMaster?: boolean; area?: string }) {
    const query = new URLSearchParams();
    if (params?.specialty) query.append('specialty', params.specialty);
    if (params?.isMaster) query.append('isMaster', 'true');
    if (params?.area) query.append('area', params.area);
    const res = await fetch(`${BASE_URL}/landscapers?${query.toString()}`);
    return res.json();
  },

  async getLandscaper(id: string) {
    const res = await fetch(`${BASE_URL}/landscapers/${id}`);
    return res.json();
  },

  async createMatchingRequest(data: any) {
    const res = await fetch(`${BASE_URL}/matching/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMatchingRequests(role?: string, userId?: string) {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (userId) query.append('userId', userId);
    const res = await fetch(`${BASE_URL}/matching/requests?${query.toString()}`);
    return res.json();
  },

  async getMatchingRequest(id: string) {
    const res = await fetch(`${BASE_URL}/matching/requests/${id}`);
    return res.json();
  },

  async submitQuote(requestId: string, data: any) {
    const res = await fetch(`${BASE_URL}/matching/requests/${requestId}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async acceptQuote(requestId: string, quoteId: string) {
    const res = await fetch(`${BASE_URL}/matching/requests/${requestId}/accept-quote`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId })
    });
    return res.json();
  },

  async completeJob(requestId: string, data: any) {
    const res = await fetch(`${BASE_URL}/matching/requests/${requestId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async reviewJob(requestId: string, data: { rating: number; comment: string }) {
    const res = await fetch(`${BASE_URL}/matching/requests/${requestId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 수종 도감
  async getSpecies() {
    const res = await fetch(`${BASE_URL}/species`);
    return res.json();
  }
};

