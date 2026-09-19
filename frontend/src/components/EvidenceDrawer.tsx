import React from 'react';
import type { ImpactResult } from '../types';

interface EvidenceDrawerProps {
  student: ImpactResult | null;
  onOpenNotifications: () => void;
  onOpenReviewModal?: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  student,
  onOpenNotifications,
  onOpenReviewModal,
}) => {
  if (!student) {
    return (
      <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400 text-xs text-center min-h-[240px]">
        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <p className="font-medium text-slate-500 text-[13px] mb-1">Select a Student Record</p>
        <p className="text-slate-400 max-w-[200px]">Click any row in the evaluation ledger to view deterministic proof and evidence trail.</p>
      </div>
    );
  }

  const isAffected = student.status === 'AFFECTED';
  const isAtRisk = student.status === 'AT_RISK';
  const isGPA = student.field?.toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';
  const decimals = isGPA ? 2 : 1;

  const gapVal = Number(
    student.gap ?? student.margin ?? (Number(student.actual_value || 0) - Number(student.required_value || 0))
  );
  const progressPct = isGPA
    ? (Number(student.actual_value || 0) / 4.0) * 100
    : Number(student.actual_value || 0);

  const statusColor = isAffected
    ? 'text-red-700 bg-red-50 border-red-200'
    : isAtRisk
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const statusLabel = isAffected ? 'Non-Compliant' : isAtRisk ? 'At Risk' : 'Compliant';
  const statusDot = isAffected ? 'bg-red-500' : isAtRisk ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#3B4F7A] text-white font-bold text-[11px] flex items-center justify-center">
            {student.display_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{student.display_name}</h3>
            <span className="text-[10px] text-slate-400 font-mono">ID: {student.student_id} · {student.course_id || 'CS-502'}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded text-[11px] border ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
          {statusLabel}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Metric vs Threshold */}
        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 font-semibold">Recorded vs. Required Threshold</span>
            <span className={`font-mono font-bold text-xs ${gapVal < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {gapVal < 0
                ? `${Math.abs(gapVal).toFixed(decimals)}${unit} deficit`
                : `+${gapVal.toFixed(decimals)}${unit} buffer`}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono mt-1">
            <span className="text-xl font-bold text-slate-900">
              {Number(student.actual_value || 0).toFixed(decimals)}{unit}
            </span>
            <span className="text-xs text-slate-400">
              Required: {Number(student.required_value || 0).toFixed(decimals)}{unit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAffected ? 'bg-red-500' : isAtRisk ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            {isAffected
              ? `Student falls below the regulatory threshold of ${Number(student.required_value || 0).toFixed(decimals)}${unit}. Intervention required.`
              : isAtRisk
              ? `Operating within a tight compliance window. Near-term review is recommended.`
              : `Satisfies institutional criteria with a compliant margin.`}
          </p>
        </div>

        {/* Evidence / Proof Formula */}
        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700">Deterministic Proof</span>
            <span className="text-[10px] font-mono text-[#3B4F7A] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Evaluated by code
            </span>
          </div>
          <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-700 break-all leading-relaxed">
            {student.calculation_display ||
              `${student.field} = ${student.actual_value}${unit} (threshold: ${student.required_value}${unit})`}
          </div>
          {student.future_sessions_needed !== undefined && student.future_sessions_needed !== null && (
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-200">
              <span className="text-slate-500">Sessions needed to reach threshold:</span>
              <span className="font-mono font-bold text-[#3B4F7A] bg-blue-50 px-2 py-0.5 rounded">
                {student.future_sessions_needed} session{student.future_sessions_needed === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onOpenNotifications}
            className="flex-1 py-2 px-3 rounded bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Dispatch Notice
          </button>
          {onOpenReviewModal && (
            <button
              onClick={onOpenReviewModal}
              className="py-2 px-3 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition"
            >
              Override
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
