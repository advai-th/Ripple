import React, { useState, useEffect } from 'react';
import type { ExtractedRule } from '../types';

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: ExtractedRule | null;
  onConfirmRule: (updatedRule: Partial<ExtractedRule>) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  onClose,
  rule,
  onConfirmRule,
}) => {
  const [threshold, setThreshold] = useState<number>(75);
  const [operator, setOperator] = useState<string>('>=');
  const [field, setField] = useState<string>('attendance_percentage');
  const [scope, setScope] = useState<string>('all_students');

  useEffect(() => {
    if (rule) {
      setThreshold(rule.threshold_value);
      setOperator(rule.operator || '>=');
      setField(rule.field || 'attendance_percentage');
      setScope(rule.scope || 'all_students');
    }
  }, [rule]);

  if (!isOpen || !rule) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRule({
      threshold_value: Number(threshold),
      operator,
      field,
      scope,
    });
  };

  const getMetricName = (f: any) => {
    const str = String(f || '');
    if (str.toLowerCase().includes('attendance')) return 'Attendance Percentage';
    if (str.toLowerCase().includes('gpa')) return 'Grade Point Average (GPA)';
    if (str.toLowerCase().includes('credit')) return 'Completed Credits';
    return str.replace(/_/g, ' ') || 'Attendance';
  };

  const getScopeName = (s: any) => {
    const str = String(s || '');
    if (str.toLowerCase().includes('all')) return 'All Enrolled Students';
    if (str.toLowerCase().includes('fresh')) return 'First-Year Students Only';
    if (str.toLowerCase().includes('senior')) return 'Final-Year Students Only';
    return str.replace(/_/g, ' ') || 'All Students';
  };

  const isGPA = String(field || '').toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden fade-zoom-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3B4F7A]/10 flex items-center justify-center text-[#3B4F7A]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Review Policy Criteria</h2>
              <p className="text-xs text-slate-500">Confirm or adjust the rule requirements before scanning students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Source Policy Citation */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
              <span>Document: <strong className="text-slate-700">{rule.source_document || 'Policy Document'}</strong></span>
              <span>Section: <strong className="text-slate-700">{rule.source_section || '§3.2'}</strong></span>
            </div>
            <p className="italic text-slate-700 text-xs pl-2.5 border-l-2 border-[#3B4F7A] mt-2 leading-relaxed">
              "{rule.raw_clause_text || 'Students are required to maintain a minimum attendance threshold to remain eligible for examination.'}"
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Requirement To Check
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A] text-xs cursor-pointer"
              >
                <option value="attendance_percentage">Attendance Percentage (%)</option>
                <option value="gpa">Minimum Grade Point Average (GPA)</option>
                <option value="credits_completed">Course Credits Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Passing Condition
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A] text-xs cursor-pointer"
                >
                  <option value=">=">At least (≥)</option>
                  <option value=">">Strictly greater than (&gt;)</option>
                  <option value="<=">At most (≤)</option>
                  <option value="==">Exactly equal to (=)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Required Value ({unit || 'Points'})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={isGPA ? '0.1' : '1'}
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A]"
                  />
                  {unit && (
                    <span className="absolute right-3 top-2 text-slate-400 font-semibold">
                      {unit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Who Does This Apply To?
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A] text-xs cursor-pointer"
              >
                <option value="all_students">All Enrolled Students</option>
                <option value="first_year">First-Year Students</option>
                <option value="graduating_seniors">Graduating Seniors</option>
              </select>
            </div>
          </div>

          {/* Plain English Summary Box */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-emerald-800">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Plain English Summary
            </div>
            <p className="text-xs leading-relaxed text-emerald-950">
              A student will pass if their <strong>{getMetricName(field)}</strong> is <strong>at least {threshold}{unit}</strong>. This policy applies to <strong>{getScopeName(scope)}</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Confirm & Scan Students
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
