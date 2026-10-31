const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const adminApi = {
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

  async updateUserRoles(userId: string, roles: string[]) {
    const res = await fetch(`${BASE_URL}/auth/users/${userId}/roles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles })
    });
    return res.json();
  },

  async getDashboard() {
    const res = await fetch(`${BASE_URL}/admin/dashboard`);
    return res.json();
  },

  async getLandscapers(status?: string) {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/admin/landscapers${query}`);
    return res.json();
  },

  async verifyLandscaper(id: string, data: { status?: string; isMasterBadge?: boolean }) {
    const res = await fetch(`${BASE_URL}/admin/landscapers/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMatching() {
    const res = await fetch(`${BASE_URL}/admin/matching`);
    return res.json();
  },

  async assignMatching(id: string, landscaperId: string) {
    const res = await fetch(`${BASE_URL}/admin/matching/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landscaperId })
    });
    return res.json();
  },

  async getSimulations() {
    const res = await fetch(`${BASE_URL}/simulations`);
    return res.json();
  },

  async reviewSimulation(id: string, data: { cuttingGuides: any[]; adminReviewNote?: string }) {
    const res = await fetch(`${BASE_URL}/admin/simulations/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getSpecies() {
    const res = await fetch(`${BASE_URL}/admin/species`);
    return res.json();
  },

  async createOrUpdateSpecies(data: any) {
    const res = await fetch(`${BASE_URL}/admin/species`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

