import React from 'react';
import type { CohortSummary } from '../types';

interface ImpactBreakdownCardProps {
  summary: CohortSummary | null;
  onOpenNotifications: () => void;
  onOpenReviewModal: () => void;
  onSelectCohortTab?: (tab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED') => void;
  onBatchNotifyAffected?: () => void;
}

export const ImpactBreakdownCard: React.FC<ImpactBreakdownCardProps> = ({
  summary,
  onOpenNotifications,
  onOpenReviewModal,
  onSelectCohortTab,
  onBatchNotifyAffected,
}) => {
  const total = summary?.total_evaluated || 1;
  const affected = summary?.affected_count || 0;
  const atRisk = summary?.at_risk_count || 0;
  const unaffected = Math.max(0, total - affected - atRisk);

  const affectedPct = Math.round((affected / total) * 100);
  const atRiskPct = Math.round((atRisk / total) * 100);
  const unaffectedPct = Math.max(0, 100 - affectedPct - atRiskPct);

  const segments: Array<{
    tab: 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
    label: string;
    count: number;
    pct: number;
    color: string;
    textColor: string;
    lightBg: string;
  }> = [
    { tab: 'AFFECTED', label: 'Needs Attention', count: affected, pct: affectedPct, color: 'bg-red-500', textColor: 'text-red-700', lightBg: 'bg-red-50' },
    { tab: 'AT_RISK', label: 'Borderline', count: atRisk, pct: atRiskPct, color: 'bg-amber-400', textColor: 'text-amber-700', lightBg: 'bg-amber-50' },
    { tab: 'UNAFFECTED', label: 'Good Standing', count: unaffected, pct: unaffectedPct, color: 'bg-[#3B4F7A]', textColor: 'text-[#3B4F7A]', lightBg: 'bg-blue-50' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Cohort Status Breakdown</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click any group to filter {total} evaluated students</p>
        </div>
        <button
          onClick={onOpenReviewModal}
          className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-semibold transition"
          title="Adjust passing threshold"
        >
          Change Rule
        </button>
      </div>

      {/* Stacked horizontal bar */}
      <div className="mb-4">
        <div className="flex h-3.5 rounded-full overflow-hidden gap-0.5 bg-slate-100 p-0.5">
          {segments.map((s) => (
            s.pct > 0 && (
              <div
                key={s.label}
                onClick={() => onSelectCohortTab && onSelectCohortTab(s.tab)}
                className={`${s.color} rounded-full transition-all duration-500 cursor-pointer hover:opacity-85`}
                style={{ width: `${s.pct}%` }}
                title={`Filter ${s.label}: ${s.count} (${s.pct}%)`}
              />
            )
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
          <span>0%</span>
          <span>{total} students total</span>
          <span>100%</span>
        </div>
      </div>

      {/* Category breakdown rows */}
      <div className="space-y-2">
        {segments.map((s) => (
          <div 
            key={s.label} 
            onClick={() => onSelectCohortTab && onSelectCohortTab(s.tab)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color} shrink-0`}></span>
              <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{s.count}</span>
              <span className="text-[11px] text-slate-400 w-8 text-right">({s.pct}%)</span>
              <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      <div className="mt-4 pt-2">
        <button
          onClick={() => {
            if (onBatchNotifyAffected) onBatchNotifyAffected();
            else onOpenNotifications();
          }}
          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#3B4F7A] text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-[#3B4F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Send Notices to All Affected ({affected})
        </button>
      </div>
    </div>
  );
};

