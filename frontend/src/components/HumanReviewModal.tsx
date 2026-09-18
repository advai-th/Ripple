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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </span>
            <div>
              <h2 className="text-sm font-headline font-bold text-on-surface">
                Human-in-the-Loop Rule Verification
              </h2>
              <p className="text-[11px] text-outline">
                Verify AI-extracted criteria before executing deterministic evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Provenance Banner */}
          <div className="p-3 rounded-lg bg-surface border border-outline-variant/60">
            <div className="flex items-center justify-between text-[11px] font-code text-outline mb-1">
              <span>SOURCE: {rule.source_document}</span>
              <span>SECTION: {rule.source_section}</span>
            </div>
            <blockquote className="italic text-on-surface-variant text-[11px] border-l-2 border-primary/40 pl-2 mt-1">
              "{rule.raw_clause_text || 'All candidates must satisfy minimum requirements.'}"
            </blockquote>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-outline font-bold mb-1 uppercase tracking-wider text-[10px]">
                Target Field
              </label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface border border-outline-variant/60 font-code text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-bold mb-1 uppercase tracking-wider text-[10px]">
                Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface border border-outline-variant/60 font-code text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value=">=">&gt;= (Greater Than or Equal)</option>
                <option value=">">&gt; (Greater Than)</option>
                <option value="<=">&lt;= (Less Than or Equal)</option>
                <option value="==">== (Exact Match)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-outline font-bold mb-1 uppercase tracking-wider text-[10px]">
                Threshold Value
              </label>
              <input
                type="number"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-md bg-surface border border-outline-variant/60 font-code text-on-surface font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-bold mb-1 uppercase tracking-wider text-[10px]">
                Evaluation Scope
              </label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface border border-outline-variant/60 font-code text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* AI Confidence */}
          <div className="flex items-center justify-between p-2.5 rounded bg-primary-fixed/20 border border-primary/20 text-[11px]">
            <span className="text-on-surface font-medium">Strands Policy Extraction Confidence:</span>
            <span className="font-code font-bold text-primary">
              {(rule.confidence * 100).toFixed(1)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-outline-variant text-on-surface hover:bg-surface font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Confirm & Run Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
