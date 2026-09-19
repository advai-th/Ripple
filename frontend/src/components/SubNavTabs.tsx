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
  threshold?: number;
}

export const SubNavTabs: React.FC<SubNavTabsProps> = ({
  activeNavTab,
  onSelectNavTab,
  activeCohortTab,
  onSelectCohortTab,
  counts,
  onOpenReviewModal,
  threshold = 75,
}) => {
  return (
    <section className="bg-white border-b border-slate-200 px-5 py-1.5 flex flex-wrap items-center justify-between gap-3 select-none shrink-0">
      {/* View Switcher */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectNavTab('roster')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            activeNavTab === 'roster' || activeNavTab === 'value_comparison'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Roster
        </button>
        <button
          onClick={() => onSelectNavTab('analytics')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            activeNavTab === 'analytics' || activeNavTab === 'average_values'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Cohort Analytics
        </button>
      </div>

      {/* Filter by Status & Rule Action */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">Filter:</span>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectCohortTab('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              activeCohortTab === 'ALL'
                ? 'bg-[#1A1F2E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({counts.all})
          </button>
          
          <button
            onClick={() => onSelectCohortTab('AFFECTED')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              activeCohortTab === 'AFFECTED'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Needs Attention ({counts.affected})
          </button>
          
          <button
            onClick={() => onSelectCohortTab('AT_RISK')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              activeCohortTab === 'AT_RISK'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Borderline ({counts.atRisk})
          </button>
          
          <button
            onClick={() => onSelectCohortTab('UNAFFECTED')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              activeCohortTab === 'UNAFFECTED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Good Standing ({counts.unaffected})
          </button>
        </div>

        {/* Edit Rule Button */}
        <button
          onClick={onOpenReviewModal}
          className="ml-2 px-2.5 py-1 rounded-md border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
          title="Change the required passing threshold"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Rule: {threshold}%
        </button>
      </div>
    </section>
  );
};

