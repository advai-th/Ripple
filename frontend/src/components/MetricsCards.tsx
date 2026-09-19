import React from 'react';
import type { CohortSummary } from '../types';

interface MetricsCardsProps {
  summary: CohortSummary | null;
  onOpenReviewModal?: () => void;
  activePoliciesCount?: number;
  onSelectCohortTab?: (tab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED') => void;
  activeCohortTab?: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  summary,
  onOpenReviewModal,
  activePoliciesCount = 4,
  onSelectCohortTab,
  activeCohortTab,
}) => {
  const total = summary?.total_evaluated || 0;
  const affected = summary?.affected_count || 0;
  const atRisk = summary?.at_risk_count || 0;
  const unaffected = total - affected - atRisk;
  const complianceRate = total > 0 ? Math.round((unaffected / total) * 100) : 0;

  const cards = [
    {
      id: 'policies',
      label: 'Active Policy Rules',
      value: activePoliciesCount,
      sub: 'Click to edit policy criteria →',
      subColor: 'text-[#3B4F7A] font-semibold',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-blue-50 text-[#3B4F7A]',
      accent: 'border-l-4 border-l-[#3B4F7A]',
      onClick: onOpenReviewModal,
      isActive: false,
    },
    {
      id: 'students',
      label: 'Students Evaluated',
      value: total.toLocaleString(),
      sub: 'Show all enrolled students →',
      subColor: 'text-slate-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-slate-100 text-slate-600',
      accent: 'border-l-4 border-l-slate-400',
      onClick: () => onSelectCohortTab && onSelectCohortTab('ALL'),
      isActive: activeCohortTab === 'ALL',
    },
    {
      id: 'attention',
      label: 'Needs Attention',
      value: affected,
      sub: `${atRisk} additional borderline · Filter →`,
      subColor: 'text-red-700 font-semibold',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-red-50 text-red-600',
      accent: 'border-l-4 border-l-red-500',
      onClick: () => onSelectCohortTab && onSelectCohortTab('AFFECTED'),
      isActive: activeCohortTab === 'AFFECTED',
    },
    {
      id: 'passing',
      label: 'Passing Rate',
      value: `${complianceRate}%`,
      sub: `${unaffected} students in good standing · Filter →`,
      subColor: 'text-emerald-700 font-semibold',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-emerald-50 text-emerald-700',
      accent: 'border-l-4 border-l-emerald-500',
      onClick: () => onSelectCohortTab && onSelectCohortTab('UNAFFECTED'),
      isActive: activeCohortTab === 'UNAFFECTED',
    },
  ];

  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div 
          key={i} 
          onClick={card.onClick}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer select-none group hover:shadow-md hover:-translate-y-0.5 ${
            card.isActive 
              ? `${card.accent} ring-2 ring-[#3B4F7A]/20 bg-blue-50/20` 
              : `${card.accent} border-slate-100 hover:border-slate-300`
          } flex items-start justify-between gap-3`}
        >
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
              {card.label}
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 group-hover:text-[#3B4F7A] transition-colors">
              {card.value}
            </div>
            <span className={`text-xs mt-1 block ${card.subColor}`}>
              {card.sub}
            </span>
          </div>
          <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
            {card.icon}
          </div>
        </div>
      ))}
    </section>
  );
};

