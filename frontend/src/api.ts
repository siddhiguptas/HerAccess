import {
  SearchResponse,
  ResourceDetail,
  ConflictDetail,
  ChangeEventDetail,
  HealthDashboardResponse,
  DemoStatusResponse
} from './types';

const API_BASE = 'http://localhost:8000';

export const api = {
  search: async (query: string, city: string = 'Lucknow', budget_max?: number, target_location?: string): Promise<SearchResponse> => {
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, city, budget_max, target_location })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getResources: async (category?: string, locality?: string): Promise<ResourceDetail[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (locality) params.append('locality', locality);
    const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getResourceDetail: async (id: number): Promise<ResourceDetail> => {
    const res = await fetch(`${API_BASE}/resources/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getConflicts: async (): Promise<ConflictDetail[]> => {
    const res = await fetch(`${API_BASE}/resources/conflicts`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getChanges: async (): Promise<ChangeEventDetail[]> => {
    const res = await fetch(`${API_BASE}/changes?limit=30`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getHealthDashboard: async (): Promise<HealthDashboardResponse> => {
    const res = await fetch(`${API_BASE}/health/dashboard`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  triggerCollectorRun: async (collectorId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/health/collectors/run/${collectorId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getRealHealStatus: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/real/status`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  triggerRealBreak: async (collectorId: string = 'c_mt1f0ke713h6n32pi4'): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/real/trigger-break?collector_id=${collectorId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  triggerRealHeal: async (collectorId: string = 'c_mt1f0ke713h6n32pi4', prompt?: string): Promise<any> => {
    const url = prompt
      ? `${API_BASE}/demo/real/trigger-heal?collector_id=${collectorId}&prompt=${encodeURIComponent(prompt)}`
      : `${API_BASE}/demo/real/trigger-heal?collector_id=${collectorId}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  resetRealHeal: async (collectorId: string = 'c_mt1f0ke713h6n32pi4'): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/real/reset?collector_id=${collectorId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getDemoStatus: async (): Promise<DemoStatusResponse> => {
    const res = await fetch(`${API_BASE}/demo/status`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  triggerDemoBreak: async (collectorId: string = 'c_hostel_sulekha_01'): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/trigger-break`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collector_id: collectorId,
        break_fields: ['monthly_price', 'curfew_time', 'primary_contact']
      })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  triggerDemoHeal: async (collectorId: string = 'c_hostel_sulekha_01'): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/trigger-heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collector_id: collectorId,
        problem_description: 'Price, curfew, and contact fields stopped extracting after listing structure changed.'
      })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  resetDemo: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getWatchlist: async (sessionId: string): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/watch?session_id=${sessionId}`);
    if (!res.ok) return [];
    return res.json();
  },

  addToWatchlist: async (sessionId: string, resourceId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/watch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, resource_id: resourceId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  removeFromWatchlist: async (sessionId: string, resourceId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/watch/${resourceId}?session_id=${sessionId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  expandCoverage: async (locality: string, city: string = 'Lucknow', category?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/coverage/expand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locality, city, category })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getCoverageJobStatus: async (jobId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/coverage/jobs/${jobId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
