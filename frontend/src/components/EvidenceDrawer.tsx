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
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400 text-xs text-center min-h-[260px]">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <p className="font-semibold text-slate-700 text-sm mb-1">Select a Student</p>
        <p className="text-slate-400 max-w-[220px] leading-relaxed">
          Click any student in the list to see their current standing and recovery options.
        </p>
      </div>
    );
  }

  const isAffected = student.status === 'AFFECTED';
  const isAtRisk = student.status === 'AT_RISK';
  const isGPA = student.field?.toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';
  const decimals = isGPA ? 2 : 1;

  const actualNum = Number(student.actual_value || 0);
  const requiredNum = Number(student.required_value || 0);
  const difference = actualNum - requiredNum;

  const statusColor = isAffected
    ? 'text-red-700 bg-red-50 border-red-200'
    : isAtRisk
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const statusLabel = isAffected ? 'Below Requirement' : isAtRisk ? 'Borderline' : 'Good Standing';
  const statusDot = isAffected ? 'bg-red-500' : isAtRisk ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Student Profile Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3B4F7A] text-white font-bold text-xs flex items-center justify-center">
            {student.display_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{student.display_name}</h3>
            <span className="text-xs text-slate-400">ID: {student.student_id} · Course {student.course_id || 'CS-502'}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-md text-xs border ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
          {statusLabel}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Simple Side-by-Side Numbers */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-500 mb-2">Student Performance Summary</div>
          
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="bg-white p-3 rounded-md border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">Current Standing</span>
              <span className="text-lg font-bold text-slate-900">
                {actualNum.toFixed(decimals)}{unit}
              </span>
            </div>
            <div className="bg-white p-3 rounded-md border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">Required to Pass</span>
              <span className="text-lg font-bold text-slate-700">
                {requiredNum.toFixed(decimals)}{unit}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Difference:</span>
            <span className={`font-bold ${difference < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {difference < 0
                ? `${Math.abs(difference).toFixed(decimals)}${unit} below requirement`
                : `+${difference.toFixed(decimals)}${unit} ahead of requirement`}
            </span>
          </div>
        </div>

        {/* Actionable Explanation in Plain English */}
        <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-[#3B4F7A] flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            What you need to know
          </div>
          
          <p className="leading-relaxed text-slate-600">
            {isAffected ? (
              <>
                <strong>{student.display_name}</strong> is currently not meeting the minimum policy requirement.
                {student.future_sessions_needed !== undefined && student.future_sessions_needed !== null ? (
                  <> They will need to attend at least <strong>{student.future_sessions_needed} more sessions</strong> without missing any to get back on track.</>
                ) : (
                  <> Academic intervention or advising is recommended before final grading.</>
                )}
              </>
            ) : isAtRisk ? (
              <>
                <strong>{student.display_name}</strong> meets the requirement for now, but is close to the cutoff. One absence may put them below the threshold.
              </>
            ) : (
              <>
                <strong>{student.display_name}</strong> is in full compliance with the course policy requirements. No action is required.
              </>
            )}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">
          <button
            onClick={onOpenNotifications}
            className="w-full py-2.5 px-4 rounded-lg bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Send Notice to {student.display_name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

