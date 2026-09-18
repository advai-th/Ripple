import React from 'react';
import type { ImpactResult } from '../types';

interface StudentTableProps {
  students: ImpactResult[];
  selectedStudent: ImpactResult | null;
  onSelectStudent: (student: ImpactResult) => void;
  activeTab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED';
  onSelectTab: (tab: 'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: { all: number; affected: number; atRisk: number; unaffected: number };
  onExportCSV: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  counts,
  onExportCSV,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest border-t border-outline-variant/50 min-h-0">
      {/* Table Controls */}
      <div className="px-6 py-3 border-b border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-outline-variant/40 w-full sm:w-auto">
          <button
            onClick={() => onSelectTab('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'ALL' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Students ({counts.all})
          </button>
          <button
            onClick={() => onSelectTab('AFFECTED')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'AFFECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Affected ({counts.affected})
          </button>
          <button
            onClick={() => onSelectTab('AT_RISK')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'AT_RISK' ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            At Risk ({counts.atRisk})
          </button>
          <button
            onClick={() => onSelectTab('UNAFFECTED')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'UNAFFECTED' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Unaffected ({counts.unaffected})
          </button>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Search student ID, name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant/60 rounded-md text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 bg-surface hover:bg-surface-container border border-outline-variant/60 rounded-md text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface sticky top-0 z-10 border-b border-outline-variant/60">
            <tr className="h-9 text-outline uppercase font-semibold text-[11px] tracking-wider">
              <th className="pl-6 pr-3 w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 font-semibold">Student</th>
              <th className="px-3 font-semibold">Course</th>
              <th className="px-3 font-semibold">Recorded</th>
              <th className="px-3 font-semibold">Required</th>
              <th className="px-3 font-semibold">Margin</th>
              <th className="px-3 font-semibold">Status</th>
              <th className="px-3 font-semibold">Citations</th>
              <th className="pr-6 pl-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-outline">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-outline/50">person_search</span>
                    <span>No students match the selected filter or search query.</span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((s) => {
                const isSelected = selectedStudent?.student_id === s.student_id;
                const isAffected = s.status === 'AFFECTED';
                const isAtRisk = s.status === 'AT_RISK';
                const isGPA = s.field?.toLowerCase().includes('gpa');
                const unit = isGPA ? '' : '%';
                const decimals = isGPA ? 2 : 1;

                const recordedDisplay = Number(s.actual_value || 0).toFixed(decimals);
                const requiredDisplay = Number(s.required_value || 0).toFixed(decimals);
                const gapVal = Number(s.gap ?? s.margin ?? (Number(s.actual_value || 0) - Number(s.required_value || 0)));

                return (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s)}
                    className={`h-11 transition-colors cursor-pointer border-l-4 ${
                      isSelected
                        ? 'bg-primary-fixed/25 hover:bg-primary-fixed/35 border-l-primary'
                        : 'hover:bg-surface border-l-transparent'
                    }`}
                  >
                    <td className="pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectStudent(s)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-outline-variant text-primary focus:ring-0"
                      />
                    </td>
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{s.display_name}</span>
                        <span className="font-code text-[11px] text-on-surface-variant bg-surface px-1.5 py-0.5 rounded border border-outline-variant/40">
                          {s.student_id}
                        </span>
                        <span className="text-[11px] text-outline">CSE · S5</span>
                      </div>
                    </td>
                    <td className="px-3 font-code text-on-surface-variant font-medium">
                      {s.course_id || 'CS-502'}
                    </td>
                    <td
                      className={`px-3 font-bold font-code ${
                        isAffected ? 'text-rose-600' : isAtRisk ? 'text-amber-700' : 'text-on-surface'
                      }`}
                    >
                      {recordedDisplay}{unit}
                    </td>
                    <td className="px-3 font-code font-medium text-on-surface">
                      {requiredDisplay}{unit}
                    </td>
                    <td className="px-3 font-code">
                      {gapVal < 0 ? (
                        <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {gapVal.toFixed(decimals)}{unit}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          +{gapVal.toFixed(decimals)}{unit}
                        </span>
                      )}
                    </td>
                    <td className="px-3">
                      {isAffected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          AFFECTED
                        </span>
                      ) : isAtRisk ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          AT RISK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          UNAFFECTED
                        </span>
                      )}
                    </td>
                    <td className="px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                      >
                        <span className="material-symbols-outlined text-[13px]">link</span>
                        Citation
                      </button>
                    </td>
                    <td className="pr-6 pl-3 text-right">
                      <span className="text-[11px] text-primary font-bold hover:underline cursor-pointer">
                        {isAffected ? 'Inspect Notice' : isAtRisk ? 'Review Margin' : 'View Record'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
