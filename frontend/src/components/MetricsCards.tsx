import React from 'react';
import type { CohortSummary } from '../types';

interface MetricsCardsProps {
  summary: CohortSummary | null;
  onOpenReviewModal?: () => void;
  activePoliciesCount?: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  summary,
  onOpenReviewModal,
  activePoliciesCount = 4,
}) => {
  const total = summary?.total_evaluated || 0;
  const affected = summary?.affected_count || 0;
  const atRisk = summary?.at_risk_count || 0;
  const unaffected = total - affected - atRisk;
  const complianceRate = total > 0 ? Math.round((unaffected / total) * 100) : 0;

  const cards = [
    {
      label: 'Active Policies',
      value: activePoliciesCount,
      sub: 'Loaded & evaluated',
      subColor: 'text-slate-400',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-blue-50 text-[#3B4F7A]',
      accent: 'border-l-4 border-l-[#3B4F7A]',
    },
    {
      label: 'Students Evaluated',
      value: total.toLocaleString(),
      sub: 'Current active cohort',
      subColor: 'text-slate-400',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-slate-100 text-slate-600',
      accent: 'border-l-4 border-l-slate-400',
    },
    {
      label: 'Non-Compliant',
      value: affected,
      sub: `${atRisk} approaching threshold`,
      subColor: 'text-amber-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-red-50 text-red-600',
      accent: 'border-l-4 border-l-red-500',
    },
    {
      label: 'Compliance Rate',
      value: `${complianceRate}%`,
      sub: 'Require attention → ',
      subAction: onOpenReviewModal,
      subColor: 'text-[#3B4F7A] font-semibold cursor-pointer hover:underline',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      iconBg: 'bg-emerald-50 text-emerald-700',
      accent: 'border-l-4 border-l-emerald-500',
    },
  ];

  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div key={i} className={`bg-white rounded-lg p-4 shadow-sm border border-slate-100 ${card.accent} flex items-start justify-between gap-3`}>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</div>
            {card.subAction ? (
              <button onClick={card.subAction} className={`text-[11px] mt-1 ${card.subColor}`}>
                {card.sub}
              </button>
            ) : (
              <span className={`text-[11px] mt-1 block ${card.subColor}`}>{card.sub}</span>
            )}
          </div>
          <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
            {card.icon}
          </div>
        </div>
      ))}
    </section>
  );
};
