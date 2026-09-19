export interface PolicySample {
  sample_key: string;
  title: string;
  format: string;
}

export interface PolicyDetail {
  filename: string;
  title: string;
  content: string;
}

export interface RuleScope {
  semester?: string | null;
  department?: string | null;
  course_id?: string | null;
}

export interface ExtractedRule {
  rule_id: string;
  field: string;
  operator: string;
  threshold_value: number;
  previous_value?: number | null;
  scope?: string | RuleScope | any;
  source_document: string;
  source_section: string;
  source_page: number;
  raw_clause_text: string;
  confidence: number;
  human_confirmed: boolean;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  rule_type?: string;
}

export interface ImpactResult {
  student_id: string;
  display_name: string;
  course_id: string;
  rule_id: string;
  field: string;
  actual_value: number;
  required_value: number;
  operator: string;
  compliant: boolean;
  affected: boolean;
  status: 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
  gap: number;
  margin?: number;
  future_sessions_needed?: number | null;
  future_sessions_possible?: boolean;
  evidence_text: string;
  calculation_display: string;
  recommended_action?: string | null;
}

export interface CohortSummary {
  total_evaluated: number;
  affected_count: number;
  at_risk_count: number;
  unaffected_count: number;
  affected_percentage: number;
  at_risk_percentage: number;
}

export interface AnalysisResponse {
  rule: ExtractedRule;
  summary: CohortSummary;
  affected_students: ImpactResult[];
  at_risk_students: ImpactResult[];
  unaffected_students: ImpactResult[];
  all_results: ImpactResult[];
}

export interface AuditEntry {
  audit_id: string;
  timestamp: string;
  event_type: string;
  actor: string;
  rule_id?: string;
  details: Record<string, any>;
  status: string;
}

export interface NotificationPreview {
  student_id: string;
  display_name: string;
  primary_email: string;
  advisor_id: string;
  rule_id: string;
  channels: {
    email: {
      subject: string;
      body: string;
    };
    sms: {
      message: string;
    };
    advisor_task: {
      title: string;
      description: string;
      priority: string;
    };
  };
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
