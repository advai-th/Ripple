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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden fade-zoom-in">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#3B4F7A]/10 flex items-center justify-center text-[#3B4F7A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Human-in-the-Loop Verification</h2>
              <p className="text-[11px] text-slate-400">Review AI-extracted rule before deterministic evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Source Policy Citation */}
          <div className="p-3 rounded bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
              <span>SOURCE: {rule.source_document || 'policy-document.pdf'}</span>
              <span>SECTION: {rule.source_section || '§3.2'}</span>
            </div>
            <blockquote className="italic text-slate-600 text-[11px] border-l-2 border-[#3B4F7A]/40 pl-2 mt-1 leading-relaxed">
              "{rule.raw_clause_text || 'All candidates must satisfy the minimum attendance requirement.'}"
            </blockquote>
          </div>

          {/* Structured Predicate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Target Field
              </label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 font-mono text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#3B4F7A] focus:bg-white transition text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 font-mono text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#3B4F7A] focus:bg-white transition text-xs cursor-pointer"
              >
                <option value=">=">&gt;= (Greater Than or Equal)</option>
                <option value=">">&gt; (Greater Than)</option>
                <option value="<=">&lt;= (Less Than or Equal)</option>
                <option value="==">== (Exact Match)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Threshold Value
              </label>
              <input
                type="number"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 font-mono text-slate-900 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#3B4F7A] focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Evaluation Scope
              </label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 font-mono text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#3B4F7A] focus:bg-white transition text-xs"
              />
            </div>
          </div>

          {/* Predicate preview */}
          <div className="p-2.5 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed">
            <span className="text-slate-400">// Auto-generated predicate preview</span><br />
            <span>{'{'} field: <span className="text-amber-300">"{field}"</span>, operator: <span className="text-amber-300">"{operator}"</span>, value: <span className="text-sky-300">{threshold}</span>, scope: <span className="text-amber-300">"{scope}"</span> {'}'}</span>
          </div>

          {/* AI Confidence */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#3B4F7A]/5 border border-[#3B4F7A]/20 text-[11px]">
            <span className="text-slate-600 font-medium">AI Extraction Confidence (Strands Agents):</span>
            <span className="font-mono font-bold text-[#3B4F7A]">
              {(rule.confidence * 100).toFixed(1)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Confirm & Run Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
