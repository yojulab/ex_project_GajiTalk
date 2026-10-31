const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const adminApi = {
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

