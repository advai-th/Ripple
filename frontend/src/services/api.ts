import type { 
  PolicySample, 
  PolicyDetail, 
  ExtractedRule, 
  AnalysisResponse, 
  AuditEntry,
  NotificationPreview
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '');


export const api = {
  async getSamples(): Promise<PolicySample[]> {
    const res = await fetch(`${API_BASE}/policies/samples`);
    if (!res.ok) throw new Error('Failed to fetch policy samples');
    return res.json();
  },

  async getSampleContent(sampleKey: string): Promise<PolicyDetail> {
    const res = await fetch(`${API_BASE}/policies/samples/${encodeURIComponent(sampleKey)}`);
    if (!res.ok) throw new Error(`Failed to load sample ${sampleKey}`);
    return res.json();
  },

  async uploadPolicy(file: File, title?: string): Promise<{ filename: string; text: string; page_count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const res = await fetch(`${API_BASE}/policies/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Policy upload failed');
    }
    return res.json();
  },

  async extractRule(policyText: string, filename: string): Promise<{ extracted_rule: ExtractedRule; raw_clauses: any[] }> {
    const res = await fetch(`${API_BASE}/rules/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policy_text: policyText, filename }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Rule extraction failed');
    }
    return res.json();
  },

  async confirmRule(ruleId: string, overrides?: Partial<ExtractedRule> & { confirmed_by?: string }): Promise<{ status: string; rule: ExtractedRule; confirmed: boolean }> {
    const res = await fetch(`${API_BASE}/rules/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rule_id: ruleId,
        human_confirmed: true,
        confirmed_by: overrides?.confirmed_by || 'Dr. Aris Thorne',
        ...overrides,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Rule confirmation failed');
    }
    return res.json();
  },

  async rejectRule(ruleId: string, reason: string, rejectedBy = 'Dr. Aris Thorne'): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/rules/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rule_id: ruleId,
        reason,
        rejected_by: rejectedBy,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Rule rejection failed');
    }
    return res.json();
  },

  async runAnalysis(ruleId: string, atRiskThreshold = 5.0): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyses/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule_id: ruleId, at_risk_threshold: atRiskThreshold }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Evaluation analysis failed');
    }
    return res.json();
  },

  async getAuditLogs(limit = 10): Promise<AuditEntry[]> {
    const res = await fetch(`${API_BASE}/audit?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit log');
    return res.json();
  },

  async simulateNotification(ruleId: string, studentIds: string[]): Promise<{ preview: NotificationPreview[] }> {
    const res = await fetch(`${API_BASE}/notifications/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule_id: ruleId, student_ids: studentIds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to simulate notifications');
    }
    return res.json();
  },

  async getAwsStatus(): Promise<import('../types').AwsDiagnostics> {
    const res = await fetch(`${API_BASE}/aws/status`);
    if (!res.ok) throw new Error('Failed to fetch AWS status');
    return res.json();
  },

  async syncAws(): Promise<any> {
    const res = await fetch(`${API_BASE}/aws/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'AWS synchronization failed');
    }
    return res.json();
  },

  async testBedrock(): Promise<{ success: boolean; engine: string; latency_ms: number; message?: string; result_preview?: string }> {
    const res = await fetch(`${API_BASE}/aws/test-bedrock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Bedrock test failed');
    }
    return res.json();
  },
};

