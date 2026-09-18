import React from 'react';
import type { CohortSummary } from '../types';

interface MetricsCardsProps {
  summary: CohortSummary | null;
  onSelectTab: (tab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED') => void;
  activeTab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ summary, onSelectTab, activeTab }) => {
  const total = summary?.total_evaluated || 500;
  const affected = summary?.affected_count || 0;
  const affectedPct = summary?.affected_percentage?.toFixed(1) || '0.0';
  const atRisk = summary?.at_risk_count || 0;
  const atRiskPct = summary?.at_risk_percentage?.toFixed(1) || '0.0';
  const unaffected = summary?.unaffected_count || total - (affected + atRisk);
  const unaffectedPct = ((unaffected / total) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
      {/* 1. Affected Students */}
      <div
        onClick={() => onSelectTab('AFFECTED')}
        className={`bg-surface-container-lowest p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
          activeTab === 'AFFECTED' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-outline-variant/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-rose-700">Affected Students</span>
          <span className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200">
            <span className="material-symbols-outlined text-[16px]">dangerous</span>
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-headline font-bold text-on-surface">{affected}</span>
          <span className="text-xs font-semibold text-rose-600">({affectedPct}%)</span>
        </div>
        <div className="mt-2 text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px] text-rose-500">trending_up</span>
          <span>Fails qualification threshold</span>
        </div>
      </div>

      {/* 2. At Risk Students */}
      <div
        onClick={() => onSelectTab('AT_RISK')}
        className={`bg-surface-container-lowest p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
          activeTab === 'AT_RISK' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-outline-variant/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-800">At-Risk Buffer</span>
          <span className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
            <span className="material-symbols-outlined text-[16px]">warning</span>
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-headline font-bold text-on-surface">{atRisk}</span>
          <span className="text-xs font-semibold text-amber-700">({atRiskPct}%)</span>
        </div>
        <div className="mt-2 text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px] text-amber-600">info</span>
          <span>Within 5% safety margin</span>
        </div>
      </div>

      {/* 3. Compliant / Unaffected */}
      <div
        onClick={() => onSelectTab('UNAFFECTED')}
        className={`bg-surface-container-lowest p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
          activeTab === 'UNAFFECTED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-outline-variant/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-800">Compliant</span>
          <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-headline font-bold text-on-surface">{unaffected}</span>
          <span className="text-xs font-semibold text-emerald-700">({unaffectedPct}%)</span>
        </div>
        <div className="mt-2 text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
          <span>Safely satisfies policy criteria</span>
        </div>
      </div>

      {/* 4. Total Evaluated Cohort */}
      <div
        onClick={() => onSelectTab('ALL')}
        className={`bg-surface-container-lowest p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
          activeTab === 'ALL' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-on-surface">Total Cohort</span>
          <span className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[16px]">groups</span>
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-headline font-bold text-on-surface">{total}</span>
          <span className="text-xs font-semibold text-primary">Students</span>
        </div>
        <div className="mt-2 text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px] text-primary">sync</span>
          <span>100% Deterministic evaluation</span>
        </div>
      </div>
    </div>
  );
};
