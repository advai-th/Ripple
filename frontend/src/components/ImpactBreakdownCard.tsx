import React from 'react';
import type { CohortSummary } from '../types';

interface ImpactBreakdownCardProps {
  summary: CohortSummary | null;
  onOpenNotifications: () => void;
  onOpenReviewModal: () => void;
}

export const ImpactBreakdownCard: React.FC<ImpactBreakdownCardProps> = ({
  summary,
  onOpenNotifications,
  onOpenReviewModal,
}) => {
  const total = summary?.total_evaluated || 1;
  const affected = summary?.affected_count || 0;
  const atRisk = summary?.at_risk_count || 0;
  const unaffected = Math.max(0, total - affected - atRisk);

  const affectedPct = Math.round((affected / total) * 100);
  const atRiskPct = Math.round((atRisk / total) * 100);
  const unaffectedPct = Math.max(0, 100 - affectedPct - atRiskPct);

  const segments = [
    { label: 'Non-Compliant', count: affected, pct: affectedPct, color: 'bg-red-500', textColor: 'text-red-700', lightBg: 'bg-red-50' },
    { label: 'At Risk', count: atRisk, pct: atRiskPct, color: 'bg-amber-400', textColor: 'text-amber-700', lightBg: 'bg-amber-50' },
    { label: 'Compliant', count: unaffected, pct: unaffectedPct, color: 'bg-[#3B4F7A]', textColor: 'text-[#3B4F7A]', lightBg: 'bg-blue-50' },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cohort Distribution</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Current enforcement breakdown</p>
        </div>
        <button
          onClick={onOpenReviewModal}
          className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
          title="Configure policy parameters"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Stacked horizontal bar */}
      <div className="mb-4">
        <div className="flex h-4 rounded overflow-hidden gap-0.5">
          {segments.map((s) => (
            s.pct > 0 && (
              <div
                key={s.label}
                className={`${s.color} transition-all duration-500`}
                style={{ width: `${s.pct}%` }}
                title={`${s.label}: ${s.count} (${s.pct}%)`}
              />
            )
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0%</span>
          <span>{total} total</span>
          <span>100%</span>
        </div>
      </div>

      {/* Category breakdown rows */}
      <div className="space-y-2.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-sm ${s.color} shrink-0`}></span>
              <span className="text-xs font-medium text-slate-600">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-800 w-6 text-right">{s.count}</span>
              <span className="text-[11px] text-slate-400 w-8 text-right">({s.pct}%)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance rate summary */}
      <div className="mt-4 p-3 rounded bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Overall Compliance Rate</span>
          <span className={`text-sm font-bold ${unaffectedPct >= 70 ? 'text-emerald-700' : unaffectedPct >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
            {unaffectedPct}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${unaffectedPct >= 70 ? 'bg-emerald-500' : unaffectedPct >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
            style={{ width: `${unaffectedPct}%` }}
          />
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4">
        <button
          onClick={onOpenNotifications}
          className="w-full py-2 px-3 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[#3B4F7A] text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Dispatch Notices to Affected ({affected})
        </button>
      </div>
    </div>
  );
};
