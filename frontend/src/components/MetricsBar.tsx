import React from 'react';
import type { CohortSummary, ExtractedRule } from '../types';

interface MetricsBarProps {
  summary: CohortSummary | null;
  extractedRule: ExtractedRule | null;
  currentPolicyTitle: string;
  activeTab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
  onSelectTab: (tab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: { all: number; affected: number; atRisk: number; unaffected: number };
  onExportCSV: () => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  summary,
  extractedRule,
  currentPolicyTitle,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  counts,
  onExportCSV,
}) => {
  const isGPA = extractedRule?.field?.toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';
  const thresholdVal = extractedRule ? `${extractedRule.threshold_value}${unit}` : '75%';

  const affectedPct = summary?.affected_percentage?.toFixed(1) || '0.0';
  const atRiskPct = summary?.at_risk_percentage?.toFixed(1) || '0.0';

  return (
    <div className="w-full bg-surface-container-lowest border-b border-outline-variant/60 px-6 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
      {/* 1. Left: Policy Context & Filter Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Active Regulation Tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-md border border-outline-variant/40 text-xs">
          <span className="font-semibold text-on-surface truncate max-w-[200px] xl:max-w-xs">
            {currentPolicyTitle || 'Active Policy'}
          </span>
          <span className="font-code font-bold text-primary bg-primary-fixed/60 px-1.5 py-0.2 rounded text-[11px]">
            {extractedRule?.operator || '>='} {thresholdVal}
          </span>
        </div>

        {/* Filter Pills with Counts */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
          {/* ALL */}
          <button
            onClick={() => onSelectTab('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs border border-outline-variant/50'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>All</span>
            <span className="font-code text-[11px] text-outline font-medium">({counts.all})</span>
          </button>

          {/* AFFECTED */}
          <button
            onClick={() => onSelectTab('AFFECTED')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'AFFECTED'
                ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200 shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Affected</span>
            <span className="font-code text-[11px] font-bold text-rose-700">
              {counts.affected} <span className="font-normal text-rose-500">({affectedPct}%)</span>
            </span>
          </button>

          {/* AT RISK */}
          <button
            onClick={() => onSelectTab('AT_RISK')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'AT_RISK'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>At Risk</span>
            <span className="font-code text-[11px] font-bold text-amber-800">
              {counts.atRisk} <span className="font-normal text-amber-600">({atRiskPct}%)</span>
            </span>
          </button>

          {/* UNAFFECTED */}
          <button
            onClick={() => onSelectTab('UNAFFECTED')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'UNAFFECTED'
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Compliant</span>
            <span className="font-code text-[11px] font-bold text-emerald-800">
              ({counts.unaffected})
            </span>
          </button>
        </div>
      </div>

      {/* 2. Right: Search & Export CSV */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-60">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Filter ID, name, course..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-surface-container-low border border-outline-variant/50 rounded-md text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors"
          />
        </div>

        <button
          onClick={onExportCSV}
          className="px-3 py-1 bg-surface-container-low hover:bg-surface border border-outline-variant/50 rounded-md text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          title="Download complete cohort impact ledger as CSV"
        >
          <span className="material-symbols-outlined text-[16px] text-outline">download</span>
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
};
