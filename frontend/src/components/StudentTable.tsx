import React from 'react';
import type { ImpactResult } from '../types';

interface StudentTableProps {
  students: ImpactResult[];
  selectedStudent: ImpactResult | null;
  onSelectStudent: (student: ImpactResult) => void;
  onExportCSV?: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'UNAFFECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
        <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Compliant
      </span>
    );
  }
  if (status === 'AT_RISK') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
        <span className="w-1 h-1 rounded-full bg-amber-500"></span> At Risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200">
      <span className="w-1 h-1 rounded-full bg-red-500"></span> Non-Compliant
    </span>
  );
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-teal-600', 'bg-orange-600', 'bg-slate-600', 'bg-indigo-600',
];

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onExportCSV,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Evaluation Ledger</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Deterministic compliance results · Click any row for evidence</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportCSV}
            className="px-2.5 py-1.5 rounded border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 text-xs font-medium"
            title="Export as CSV"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[440px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Course</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Metric</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Required</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gap</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span className="font-medium text-slate-500">No records match the selected filter</span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((s, index) => {
                const isSelected = selectedStudent?.student_id === s.student_id;
                const margin = s.gap ?? s.margin ?? 0;
                const isGPA = s.field?.toLowerCase().includes('gpa');
                const unit = isGPA ? '' : '%';

                return (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-2 border-l-[#3B4F7A]'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Row number */}
                    <td className="px-5 py-3 text-slate-300 font-medium text-[10px]">{index + 1}</td>

                    {/* Student */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                          {getInitials(s.display_name)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">{s.display_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{s.student_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{s.course_id || 'CS-502'}</span>
                    </td>

                    {/* Metric value */}
                    <td className="px-3 py-3">
                      <span className={`font-bold font-mono ${s.status === 'AFFECTED' ? 'text-red-700' : s.status === 'AT_RISK' ? 'text-amber-700' : 'text-slate-800'}`}>
                        {s.actual_value}{unit}
                      </span>
                    </td>

                    {/* Required */}
                    <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">{s.required_value}{unit}</td>

                    {/* Gap */}
                    <td className="px-3 py-3 font-mono font-semibold text-[11px]">
                      {margin > 0 ? (
                        <span className="text-emerald-600">+{margin}</span>
                      ) : margin < 0 ? (
                        <span className="text-red-600">{margin}</span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 text-right">
                      <StatusBadge status={s.status} />
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
