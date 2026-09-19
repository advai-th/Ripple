import React, { useState, useEffect } from 'react';
import type { ExtractedRule } from '../types';

interface RuleReviewPageProps {
  rule: ExtractedRule | null;
  policyTitle: string;
  policyContent?: string;
  policyFilename?: string;
  onConfirmRule: (overrides: Partial<ExtractedRule>) => Promise<void>;
  onRejectRule: (reason: string) => Promise<void>;
  onBackToDashboard: () => void;
  isConfirming?: boolean;
  reviewerName?: string;
}

export const RuleReviewPage: React.FC<RuleReviewPageProps> = ({
  rule,
  policyTitle,
  policyContent,
  policyFilename,
  onConfirmRule,
  onRejectRule,
  onBackToDashboard,
  isConfirming = false,
  reviewerName = 'Dr. Aris Thorne',
}) => {
  // Form / Editable State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(80);
  const [operator, setOperator] = useState<string>('>=');
  const [field, setField] = useState<string>('attendance_percentage');
  const [scope, setScope] = useState<string>('S5');
  const [hasUserEdited, setHasUserEdited] = useState<boolean>(false);

  // Modals inside page
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Synchronize initial state from extracted rule
  useEffect(() => {
    if (rule) {
      setThreshold(rule.threshold_value ?? 80);
      setOperator(rule.operator || '>=');
      setField(rule.field || 'attendance_percentage');

      if (rule.scope && typeof rule.scope === 'object') {
        const s: any = rule.scope;
        if (s.semester) {
          setScope(s.semester);
        } else if (s.department) {
          setScope(s.department);
        } else if (s.course_id) {
          setScope(s.course_id);
        } else {
          setScope('all_students');
        }
      } else if (typeof rule.scope === 'string') {
        setScope(rule.scope);
      } else {
        setScope('all_students');
      }
      setHasUserEdited(false);
    }
  }, [rule]);

  if (!rule) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">No Rule Selected for Review</h2>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">Please select an institutional policy from the dashboard to review its extracted compliance rule.</p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-[#3B4F7A] text-white rounded-lg text-xs font-semibold hover:bg-[#2E3F63] transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Helpers
  const isGPA = String(field || '').toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';
  const displayUnit = isGPA ? ' GPA' : '%';

  const getMetricName = (f: string) => {
    const str = String(f || '').toLowerCase();
    if (str.includes('attendance')) return 'Minimum Attendance Percentage';
    if (str.includes('gpa')) return 'Minimum Grade Point Average (GPA)';
    if (str.includes('credit')) return 'Required Completed Credits';
    return String(f).replace(/_/g, ' ') || 'Attendance';
  };

  const getOperatorPhrase = (op: string) => {
    switch (op) {
      case '>=': return 'at least';
      case '>': return 'strictly greater than';
      case '<=': return 'at most';
      case '<': return 'strictly less than';
      case '==': return 'exactly equal to';
      default: return 'at least';
    }
  };

  const getOperatorSymbolLabel = (op: string) => {
    switch (op) {
      case '>=': return 'At least (≥)';
      case '>': return 'Strictly greater than (>)';
      case '<=': return 'At most (≤)';
      case '==': return 'Exactly equal to (=)';
      default: return 'At least (≥)';
    }
  };

  const getScopeName = (s: any) => {
    if (!s) return 'All Enrolled Students';
    if (typeof s === 'object') {
      const parts: string[] = [];
      if (s.semester) parts.push(`Semester ${s.semester} (S5) Students`);
      if (s.department) parts.push(`${s.department} Department`);
      if (s.course_id) parts.push(`Course ${s.course_id}`);
      return parts.length > 0 ? parts.join(', ') : 'All Enrolled Students';
    }

    const str = String(s).trim();
    if (str === '' || str === '[object Object]' || str.toLowerCase() === 'all' || str.toLowerCase() === 'all_students') {
      return 'All Enrolled Students';
    }
    if (str.toLowerCase() === 's5' || str.toLowerCase() === 'semester_5' || str.toLowerCase() === 'semester 5') {
      return 'Semester 5 (S5) Students';
    }
    if (str.toLowerCase() === 'first_year' || str.toLowerCase().includes('fresh')) {
      return 'First-Year Students Only';
    }
    if (str.toLowerCase() === 'graduating_seniors' || str.toLowerCase().includes('senior')) {
      return 'Graduating Seniors Only';
    }
    if (/^s\d+$/i.test(str)) {
      return `Semester ${str.toUpperCase()} Students`;
    }
    return str.replace(/_/g, ' ');
  };

  const getDeterministicExpression = () => {
    const varName = isGPA ? 'GPA' : field;
    const scopePart = scope === 'all_students' ? 'All Enrolled Students' : `Semester = ${scope}`;
    return {
      expression: `${varName} ${operator} ${threshold}${unit}`,
      scope: scopePart,
    };
  };

  const getMetricAction = () => {
    const doc = String(rule.source_document || policyTitle || '').toLowerCase();
    if (isGPA) {
      if (doc.includes('honor') || doc.includes('fellowship') || doc.includes('scholarship')) {
        return 'maintain honors and fellowship eligibility';
      }
      return 'remain in satisfactory academic standing';
    }
    if (field.includes('attendance')) {
      return 'qualify to appear for final examinations';
    }
    return 'satisfy institutional compliance standards';
  };

  // Previous requirement
  const previousValue = rule.previous_value;
  const hasPrevious = previousValue !== undefined && previousValue !== null;

  // Handle Edit Changes
  const handleFieldChange = (newField: string) => {
    setField(newField);
    setHasUserEdited(true);
    if (newField.includes('gpa') && threshold > 10) {
      setThreshold(3.5);
    } else if (!newField.includes('gpa') && threshold <= 10) {
      setThreshold(80);
    }
  };

  const handleResetToAI = () => {
    if (rule) {
      setThreshold(rule.threshold_value ?? 80);
      setOperator(rule.operator || '>=');
      setField(rule.field || 'attendance_percentage');
      if (rule.scope && typeof rule.scope === 'object') {
        const s: any = rule.scope;
        setScope(s.semester || 'all_students');
      } else {
        setScope(rule.scope || 'all_students');
      }
      setHasUserEdited(false);
      setIsEditMode(false);
    }
  };

  // Confirmation Trigger
  const handleExecuteConfirmation = async () => {
    try {
      setIsSubmitting(true);
      let scopePayload: any = null;
      if (scope === 'all_students') {
        scopePayload = { semester: null, department: null, course_id: null };
      } else if (/^s\d+$/i.test(scope) || scope.toLowerCase().startsWith('semester_')) {
        const sem = scope.replace(/semester_/i, '').toUpperCase();
        scopePayload = { semester: sem, department: null, course_id: null };
      } else {
        scopePayload = { semester: null, department: scope, course_id: null };
      }

      await onConfirmRule({
        threshold_value: Number(threshold),
        value: Number(threshold),
        operator,
        field,
        scope: scopePayload,
      });
      setIsConfirmDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rejection Trigger
  const handleExecuteRejection = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setIsSubmitting(true);
      await onRejectRule(rejectionReason.trim());
      setIsRejectDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deterministic = getDeterministicExpression();
  const rawDocumentName = rule.source_document || policyFilename || `${policyTitle.toLowerCase().replace(/\s+/g, '_')}.txt`;
  const rawSection = rule.source_section || 'Section 2.4';
  const rawPage = rule.source_page || 1;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 flex flex-col min-w-0">
      
      {/* ===================================================================== */}
      {/* 1. TOP BAR / BREADCRUMBS & CONTEXTUAL HEADER                         */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={onBackToDashboard}
              className="hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Policies
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={onBackToDashboard}
              className="hover:text-slate-900 transition truncate max-w-xs cursor-pointer"
            >
              {policyTitle || 'Academic Regulation 2026'}
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Rule Review</span>
          </nav>

          {/* Title and Purpose Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Review Policy Rule
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                Verify Ripple's interpretation before evaluating student records.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Awaiting Human Verification
              </span>
            </div>
          </div>

          {/* Human Verification Notice Banner */}
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#0155eb] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <div className="leading-relaxed">
              <strong className="font-semibold text-slate-900 mr-1">Administrative Checkpoint:</strong>
              Ripple has interpreted the uploaded policy and extracted candidate criteria. As administrator, you must verify or edit these parameters before the deterministic evaluation engine evaluates student records.
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. COMPACT WORKFLOW INDICATOR                                         */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 shrink-0">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">✓</span>
            <span className="text-slate-900 font-semibold">Upload</span>
          </div>

          <div className="w-8 h-px bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 shrink-0">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">✓</span>
            <span className="text-slate-900 font-semibold">AI Analysis</span>
          </div>

          <div className="w-8 h-px bg-slate-200 shrink-0" />

          {/* Current Step: Human Review */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0155eb] shrink-0 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
            <span className="w-5 h-5 rounded-full bg-[#0155eb] text-white flex items-center justify-center text-[10px] font-black">●</span>
            <span>Human Review (Active)</span>
          </div>

          <div className="w-8 h-px bg-slate-200 shrink-0" />

          {/* Pending Step: Validation */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 shrink-0">
            <span className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px]">○</span>
            <span>Validation</span>
          </div>

          <div className="w-8 h-px bg-slate-200 shrink-0" />

          {/* Pending Step: Impact */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 shrink-0">
            <span className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px]">○</span>
            <span>Impact</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT: TWO-COLUMN STRUCTURED WORKSPACE                      */}
      {/* ===================================================================== */}
      <div className="max-w-7xl mx-auto w-full p-6 pb-28 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================= */}
          {/* MAIN COLUMN (Left / 7 cols)                                       */}
          {/* 1. Policy Change Card                                             */}
          {/* 2. Structured Rule (with live edit preview)                       */}
          {/* 3. Plain English Summary Card                                     */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* --------------------------------------------------------------- */}
            {/* 1. Policy Change Card (Prominent Header)                        */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-wider text-slate-500">
                    Policy Change
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clear delta between historical standard and the newly enacted directive
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md">
                  What Actually Changed?
                </span>
              </div>

              {/* Requirement Delta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                
                {/* Previous Requirement */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Previous Requirement
                  </span>
                  <div className="my-2">
                    <span className="text-3xl font-black text-slate-700 tracking-tight">
                      {hasPrevious ? `${previousValue}${unit}` : 'None Recorded'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Historical institutional baseline
                  </span>
                </div>

                {/* New Requirement */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0155eb] uppercase tracking-wider">
                      New Requirement
                    </span>
                    {hasPrevious && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0155eb]">
                        {isGPA ? `+${(threshold - previousValue).toFixed(2)} GPA` : `+${(threshold - previousValue).toFixed(1)}%`}
                      </span>
                    )}
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-black text-[#0155eb] tracking-tight">
                      {threshold}{unit}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Enacted policy threshold
                  </span>
                </div>
              </div>

              {/* Scope & Metric Summary */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-normal">Metric: </span>
                  <strong className="text-slate-800 font-semibold">{getMetricName(field)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-normal">Applies to: </span>
                  <strong className="text-slate-800 font-semibold">{getScopeName(scope)}</strong>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* 2. Structured Rule Card (AI Interpretation + Deterministic View) */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
              
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded bg-[#3B4F7A]/10 text-[#3B4F7A] font-bold text-[11px] uppercase tracking-wider">
                    AI-Extracted Rule
                  </span>
                  {hasUserEdited && (
                    <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                      ● Modified by administrator
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="text-xs text-[#0155eb] hover:text-[#00399e] font-semibold cursor-pointer"
                    >
                      Done Editing
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-md bg-white transition cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      Edit Rule
                    </button>
                  )}
                </div>
              </div>

              {/* View vs Edit Mode Fields */}
              {isEditMode ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Requirement Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Requirement To Check
                      </label>
                      <select
                        value={field}
                        onChange={(e) => handleFieldChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A]"
                      >
                        <option value="attendance_percentage">Attendance Percentage (%)</option>
                        <option value="gpa">Minimum Grade Point Average (GPA)</option>
                        <option value="credits_completed">Course Credits Completed</option>
                      </select>
                    </div>

                    {/* Operator */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Condition / Operator
                      </label>
                      <select
                        value={operator}
                        onChange={(e) => {
                          setOperator(e.target.value);
                          setHasUserEdited(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A]"
                      >
                        <option value=">=">At least (≥)</option>
                        <option value=">">Strictly greater than (&gt;)</option>
                        <option value="<=">At most (≤)</option>
                        <option value="==">Exactly equal to (=)</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Required Value ({unit || 'Points'})
                      </label>
                      <input
                        type="number"
                        step={isGPA ? '0.1' : '1'}
                        value={threshold}
                        onChange={(e) => {
                          setThreshold(parseFloat(e.target.value) || 0);
                          setHasUserEdited(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-bold text-xs focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A]"
                      />
                    </div>

                    {/* Scope */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Scope of Application
                      </label>
                      <select
                        value={scope}
                        onChange={(e) => {
                          setScope(e.target.value);
                          setHasUserEdited(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A]"
                      >
                        <option value="all_students">All Enrolled Students</option>
                        <option value="S5">Semester 5 (S5) Students</option>
                        <option value="first_year">First-Year Students</option>
                        <option value="graduating_seniors">Graduating Seniors</option>
                        {scope && !['all_students', 'S5', 'first_year', 'graduating_seniors'].includes(scope) && (
                          <option value={scope}>{getScopeName(scope)}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {hasUserEdited && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-amber-700 font-medium">
                        Values modified. Deterministic preview below updated in real time.
                      </span>
                      <button
                        type="button"
                        onClick={handleResetToAI}
                        className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Reset to AI Interpretation
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Requirement
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {getMetricName(field)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Condition
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {getOperatorSymbolLabel(operator)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Required Value
                    </span>
                    <span className="text-xs font-black text-slate-900 block">
                      {threshold}{unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Scope
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block truncate" title={getScopeName(scope)}>
                      {getScopeName(scope)}
                    </span>
                  </div>
                </div>
              )}

              {/* Dedicated "Rule that will be evaluated" Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#0155eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Rule that will be evaluated
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Deterministic Engine Syntax
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-1 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span>{deterministic.expression}</span>
                    <span className="text-slate-400 text-[11px]">Condition</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-300 text-[11px]">
                    <span>Scope: {deterministic.scope}</span>
                    <span className="text-slate-400">Target Cohort</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  This deterministic rule specification will be passed to the evaluation engine to assess individual student records.
                </p>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* 3. Plain English Summary Card                                   */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Plain English Summary
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs sm:text-sm leading-relaxed space-y-2">
                <p>
                  Students will <strong>{getMetricAction()}</strong> when their <strong>{getMetricName(field)}</strong> is <strong>{getOperatorPhrase(operator)} {threshold}{unit}</strong>.
                </p>
                <p className="text-emerald-900/90 text-xs">
                  {hasPrevious ? (
                    <>This requirement was revised from <strong>{previousValue}{unit}</strong> and applies to <strong>{getScopeName(scope)}</strong>.</>
                  ) : (
                    <>This requirement applies strictly to <strong>{getScopeName(scope)}</strong>.</>
                  )}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Derived directly from the verified deterministic rule parameters above.
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECONDARY COLUMN (Right / 5 cols)                                 */}
          {/* 1. Source Evidence Card                                           */}
          {/* 2. Review Status / Metadata Card                                  */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* --------------------------------------------------------------- */}
            {/* 1. Source Evidence Card                                         */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#3B4F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Source Evidence
                </h3>

                <button
                  type="button"
                  onClick={() => setIsDocumentViewerOpen(true)}
                  className="text-xs text-[#0155eb] hover:text-[#00399e] font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Open Document
                </button>
              </div>

              {/* Document Citation Metadata */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Document</span>
                  <span className="font-mono text-slate-800 font-medium truncate max-w-[200px]" title={rawDocumentName}>
                    {rawDocumentName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Section Citation</span>
                  <span className="font-bold text-slate-800">{rawSection}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Location</span>
                  <span className="text-slate-700 font-medium">Page {rawPage}</span>
                </div>
              </div>

              {/* Relevant Verbatim Text Callout */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Relevant Policy Text
                </span>
                <div className="p-3.5 rounded-lg bg-slate-50 border-l-3 border-[#3B4F7A] text-xs italic text-slate-700 leading-relaxed">
                  "{rule.raw_clause_text || 'The minimum attendance requirement has been revised to 80% for all scheduled instructional sessions.'}"
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocumentViewerOpen(true)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  View Full Policy in Viewer
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* 2. Review Status / Metadata Card                                */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3.5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Governance & Metadata
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Review Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Pending Verification
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Reviewer Assigned</span>
                  <span className="font-semibold text-slate-800">{reviewerName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Target Entity</span>
                  <span className="font-mono text-slate-700">student_course_record</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Extraction Engine</span>
                  <span className="text-slate-700 font-medium">Claude 3.5 Sonnet / Bedrock</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Rule Identifier</span>
                  <span className="font-mono text-[11px] text-slate-500">{rule.rule_id}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                Verification by university administration ensures strict accountability and non-repudiation in downstream student actions.
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. FIXED ADMINISTRATOR ACTIONS FOOTER                                 */}
      {/* ===================================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-4 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left: Reject Rule */}
          <div>
            <button
              type="button"
              onClick={() => setIsRejectDialogOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Reject Rule
            </button>
          </div>

          {/* Right: Edit & Confirm Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isEditMode ? (
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close Editor
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Edit Rule
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting || isConfirming}
              onClick={() => setIsConfirmDialogOpen(true)}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0155eb] hover:bg-[#00399e] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting || isConfirming ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>Confirm Rule</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. CONFIRMATION DIALOG MODAL (Section 13)                              */}
      {/* ===================================================================== */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-zoom-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0155eb] shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Confirm this rule?</h3>
                <p className="text-xs text-slate-500">Verify deterministic parameters before student evaluation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ripple will use the following confirmed rule to evaluate the selected student records:
            </p>

            {/* Confirmed Rule Representation Box */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-1">
              <div className="font-bold">{deterministic.expression}</div>
              <div className="text-slate-400 text-[11px]">Scope: {deterministic.scope}</div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Once confirmed, the rule will proceed to <strong>deterministic validation</strong>.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecuteConfirmation}
                className="px-5 py-2 rounded-xl bg-[#0155eb] hover:bg-[#00399e] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. REJECTION DIALOG MODAL                                             */}
      {/* ===================================================================== */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-zoom-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Reject Policy Rule</h3>
                <p className="text-xs text-slate-500">Stops evaluation and records a governance audit log</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please specify the institutional or regulatory reason why Ripple's interpretation is being rejected:
            </p>

            <div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. The extracted clause applies only to lab components, not overall lecture attendance."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-red-200 focus:border-red-500 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || isSubmitting}
                onClick={handleExecuteRejection}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. SOURCE DOCUMENT VIEWER MODAL                                       */}
      {/* ===================================================================== */}
      {isDocumentViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 fade-zoom-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0155eb] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{rawDocumentName}</h3>
                  <p className="text-xs text-slate-500">Official Institutional Source Record · {rawSection} (Page {rawPage})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDocumentViewerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-700 bg-slate-50/50 leading-relaxed whitespace-pre-wrap selection:bg-yellow-200">
              {policyContent || (
                `ACADEMIC REGULATION 2026: DIRECTIVE ON STUDENT ELIGIBILITY
Office of the Registrar & Academic Affairs
Published: January 15, 2026
Document ID: DOC-ACAD-2026-04

1.0 PURPOSE & OVERVIEW
This circular sets forth binding academic requirements for all enrolled students across undergraduate and postgraduate programmes for the Spring 2026 term.

2.0 SCOPE OF APPLICATION
This directive applies strictly to all S5 undergraduate engineering courses across all departments.

3.0 ATTENDANCE & EXAMINATION ELIGIBILITY
Section 3.1: Regular class attendance is mandatory for instructional coherence and laboratory certification.
Section 3.2: The minimum attendance requirement for eligibility to appear for the end-semester examination has been revised from 75% to 80%.
Section 3.3: Students who fail to achieve at least 80% aggregate attendance in their respective courses prior to the commencement of final assessments will be barred from examinations unless an official administrative dispensation is formally registered.

4.0 IMPLEMENTATION TIMELINE
Effective immediately upon notification. Course instructors and departments shall update compliance rosters accordingly.`
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Cited in extraction: <strong className="text-slate-800 font-semibold">{rawSection}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsDocumentViewerOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Close Document
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
