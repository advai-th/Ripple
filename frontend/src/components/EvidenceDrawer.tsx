import React from 'react';
import type { ImpactResult } from '../types';

interface EvidenceDrawerProps {
  student: ImpactResult | null;
  onOpenNotifications: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ student, onOpenNotifications }) => {
  if (!student) {
    return (
      <aside className="w-96 border-l border-outline-variant bg-surface-container-lowest p-6 flex flex-col items-center justify-center text-outline text-xs">
        <span className="material-symbols-outlined text-[36px] text-outline/40 mb-2">id_card</span>
        <span>Select a student record from the ledger to inspect deterministic compliance calculations.</span>
      </aside>
    );
  }

  const isAffected = student.status === 'AFFECTED';
  const isAtRisk = student.status === 'AT_RISK';
  const isGPA = student.field?.toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';
  const decimals = isGPA ? 2 : 1;

  const gapVal = Number(student.gap ?? student.margin ?? (Number(student.actual_value || 0) - Number(student.required_value || 0)));
  const progressPct = isGPA ? (Number(student.actual_value || 0) / 4.0) * 100 : Number(student.actual_value || 0);

  return (
    <aside className="w-96 border-l border-outline-variant bg-surface-container-lowest flex flex-col shrink-0 overflow-y-auto shadow-md">
      {/* Drawer Header */}
      <div className="p-5 border-b border-outline-variant/60 bg-surface-container-low">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
            Evidence Ledger · Record Inspection
          </span>
          <span className="font-code text-[11px] text-on-surface-variant font-semibold bg-surface px-1.5 py-0.5 rounded border border-outline-variant/50">
            {student.student_id}
          </span>
        </div>

        <h2 className="text-base font-headline font-bold text-on-surface mt-2 tracking-tight">
          {student.display_name}
        </h2>

        <div className="flex items-center gap-2 mt-2">
          {isAffected ? (
            <span className="px-2 py-0.5 rounded text-[11px] bg-rose-100 text-rose-800 font-bold border border-rose-200">
              AFFECTED
            </span>
          ) : isAtRisk ? (
            <span className="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800 font-bold border border-amber-200">
              AT RISK
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              UNAFFECTED
            </span>
          )}
          <span className="text-xs text-outline font-medium">Course: {student.course_id || 'CS-502'}</span>
        </div>
      </div>

      {/* Drawer Content */}
      <div className="p-5 space-y-5 flex-1 text-xs">
        {/* Metric Deficit / Margin Block */}
        <div className="p-3.5 rounded-lg bg-surface border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-outline font-semibold">Current vs Required</span>
            <span
              className={`font-code font-bold ${
                gapVal < 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {gapVal < 0
                ? `${Math.abs(gapVal).toFixed(decimals)}${unit} Deficit`
                : `+${gapVal.toFixed(decimals)}${unit} Compliant Margin`}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between font-code">
            <span className="text-sm font-bold text-on-surface">
              {Number(student.actual_value || 0).toFixed(decimals)}{unit}
            </span>
            <span className="text-xs text-outline">
              Target: {Number(student.required_value || 0).toFixed(decimals)}{unit}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-surface-container mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isAffected ? 'bg-rose-500' : isAtRisk ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>

          <p className="text-[11px] mt-2 text-on-surface-variant leading-relaxed">
            {isAffected
              ? `${Math.abs(gapVal).toFixed(decimals)}${unit} below the mandatory institution threshold.`
              : isAtRisk
              ? `Satisfies policy criteria, but remains within ${gapVal.toFixed(decimals)}${unit} of failure threshold.`
              : `Safely satisfies policy criteria with +${gapVal.toFixed(decimals)}${unit} buffer.`}
          </p>
        </div>

        {/* Deterministic Evaluation Formula */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Deterministic Calc Proof
            </span>
            <span className="text-[10px] font-semibold text-primary">Zero-Hallucination</span>
          </div>
          <div
            className={`p-3 rounded-lg border font-code text-xs font-semibold leading-relaxed ${
              isAffected
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {student.calculation_display ||
              `Actual (${student.actual_value}) ${isAffected ? '<' : '>='} Target (${student.required_value})`}
          </div>
        </div>

        {/* Recovery Remediation Plan (for Attendance or At-Risk) */}
        {student.future_sessions_needed !== null && student.future_sessions_needed !== undefined && (
          <div className="p-3.5 rounded-lg bg-primary-fixed/20 border border-primary/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">model_training</span>
              <span className="font-bold text-on-surface text-xs">Attendance Recovery Plan</span>
            </div>
            <div className="mt-2 text-xs text-on-surface-variant leading-relaxed">
              Required Consecutive Sessions:{' '}
              <strong className="text-primary font-code text-sm">
                {student.future_sessions_needed} classes
              </strong>
            </div>
            <p className="text-[11px] text-outline mt-1 font-code">
              Formula: ceil((Target * Total - 100 * Attended) / (100 - Target))
            </p>
          </div>
        )}

        {/* Policy Citation & Ground Truth */}
        <div className="p-3 rounded-lg bg-surface border border-outline-variant/60">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
            Policy Clause Provenance
          </span>
          <p className="text-xs text-on-surface font-medium leading-relaxed">
            {student.evidence_text ||
              `Evaluated against Rule ${student.rule_id} for field ${student.field} (${student.operator} ${student.required_value}).`}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onOpenNotifications}
            className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
            Simulate Interventions & Notices
          </button>
        </div>
      </div>
    </aside>
  );
};
