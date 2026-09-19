import React from 'react';

interface SubNavTabsProps {
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
  activeCohortTab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
  onSelectCohortTab: (tab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED') => void;
  counts: {
    all: number;
    affected: number;
    atRisk: number;
    unaffected: number;
  };
  onOpenReviewModal: () => void;
}

export const SubNavTabs: React.FC<SubNavTabsProps> = ({
  activeNavTab,
  onSelectNavTab,
  activeCohortTab,
  onSelectCohortTab,
  counts,
  onOpenReviewModal,
}) => {
  return (
    <section className="bg-white border-b border-slate-200 px-5 flex items-center justify-between select-none shrink-0">
      {/* Main Sub-Nav Tabs */}
      <div className="flex items-center gap-0 overflow-x-auto">
        {[
          { id: 'value_comparison', label: 'Evaluation Results' },
          { id: 'average_values', label: 'Statistical Summary' },
          { id: 'configure_analysis', label: 'Rule Configuration', action: onOpenReviewModal },
          { id: 'pipeline', label: 'Pipeline Stages' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.action) tab.action();
              else onSelectNavTab(tab.id);
            }}
            className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeNavTab === tab.id
                ? 'border-[#3B4F7A] text-[#3B4F7A]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cohort Filter Pills */}
      <div className="flex items-center gap-1.5 py-2 pl-4">
        <button
          onClick={() => onSelectCohortTab('ALL')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
            activeCohortTab === 'ALL'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => onSelectCohortTab('AFFECTED')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
            activeCohortTab === 'AFFECTED'
              ? 'bg-red-700 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          Non-Compliant ({counts.affected})
        </button>
        <button
          onClick={() => onSelectCohortTab('AT_RISK')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
            activeCohortTab === 'AT_RISK'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          At Risk ({counts.atRisk})
        </button>
        <button
          onClick={() => onSelectCohortTab('UNAFFECTED')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
            activeCohortTab === 'UNAFFECTED'
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          Compliant ({counts.unaffected})
        </button>
      </div>
    </section>
  );
};
