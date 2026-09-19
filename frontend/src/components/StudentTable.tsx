import React from 'react';
import type { ImpactResult } from '../types';

interface StudentTableProps {
  students: ImpactResult[];
  selectedStudent: ImpactResult | null;
  onSelectStudent: (student: ImpactResult) => void;
  onExportCSV?: () => void;
  selectedStudentIds?: string[];
  onToggleSelectStudent?: (id: string) => void;
  onSelectAllStudents?: () => void;
  onClearSelection?: () => void;
  onOpenSingleNotify?: (student: ImpactResult) => void;
  onOpenBatchNotify?: (students: ImpactResult[]) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'UNAFFECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Good Standing
      </span>
    );
  }
  if (status === 'AT_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md text-xs border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Borderline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-red-700 font-semibold bg-red-50 px-2.5 py-1 rounded-md text-xs border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Needs Attention
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
  selectedStudentIds = [],
  onToggleSelectStudent,
  onSelectAllStudents,
  onClearSelection,
  onOpenSingleNotify,
  onOpenBatchNotify,
}) => {
  const isAllSelected = students.length > 0 && selectedStudentIds.length === students.length;
  const isSomeSelected = selectedStudentIds.length > 0 && selectedStudentIds.length < students.length;

  const selectedStudentsList = students.filter((s) => selectedStudentIds.includes(s.student_id));

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden relative">
      {/* Table Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Evaluation Roster</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click any row to inspect details or use checkboxes for batch actions</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedStudentIds.length > 0 && onClearSelection && (
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-500 hover:text-slate-700 underline px-2 py-1"
            >
              Clear selection ({selectedStudentIds.length})
            </button>
          )}
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 text-xs font-medium bg-white shadow-2xs"
            title="Download list as spreadsheet"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Download CSV
          </button>
        </div>
      </div>

      {/* Floating Batch Action Bar */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-[#1A1F2E] text-white px-5 py-2.5 flex items-center justify-between text-xs z-20 slide-in-right">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[11px] flex items-center justify-center">
              {selectedStudentIds.length}
            </span>
            <span>student{selectedStudentIds.length === 1 ? '' : 's'} selected</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBatchNotify && (
              <button
                onClick={() => onOpenBatchNotify(selectedStudentsList)}
                className="px-3 py-1.5 rounded-md bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Send Notices ({selectedStudentIds.length})
              </button>
            )}

            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
              >
                Export Selected
              </button>
            )}

            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Deselect all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[460px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              {/* Checkbox */}
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={() => {
                    if (isAllSelected) {
                      onClearSelection && onClearSelection();
                    } else {
                      onSelectAllStudents && onSelectAllStudents();
                    }
                  }}
                  className="rounded border-slate-300 text-[#3B4F7A] focus:ring-[#3B4F7A] cursor-pointer"
                  title="Select all visible students"
                />
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Score</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Required</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Difference</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Standing</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span className="font-medium text-slate-600">No students match this filter</span>
                    <span className="text-xs text-slate-400">Try selecting "All" or clearing the search box</span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((s, index) => {
                const isSelected = selectedStudent?.student_id === s.student_id;
                const isChecked = selectedStudentIds.includes(s.student_id);
                const isGPA = s.field?.toLowerCase().includes('gpa');
                const unit = isGPA ? '' : '%';
                const decimals = isGPA ? 2 : 1;
                const diff = Number(s.actual_value || 0) - Number(s.required_value || 0);

                return (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-3 border-l-[#3B4F7A]'
                        : isChecked
                        ? 'bg-slate-50/90'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelectStudent && onToggleSelectStudent(s.student_id)}
                        className="rounded border-slate-300 text-[#3B4F7A] focus:ring-[#3B4F7A] cursor-pointer"
                      />
                    </td>

                    {/* Student */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                          {getInitials(s.display_name)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{s.display_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">ID: {s.student_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-3 py-3">
                      <span className="font-medium text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{s.course_id || 'CS-502'}</span>
                    </td>

                    {/* Metric value */}
                    <td className="px-3 py-3">
                      <span className={`font-bold text-xs ${s.status === 'AFFECTED' ? 'text-red-700' : s.status === 'AT_RISK' ? 'text-amber-700' : 'text-slate-800'}`}>
                        {s.actual_value}{unit}
                      </span>
                    </td>

                    {/* Required */}
                    <td className="px-3 py-3 text-slate-500 text-xs">{s.required_value}{unit}</td>

                    {/* Difference */}
                    <td className="px-3 py-3 font-semibold text-xs">
                      {diff > 0 ? (
                        <span className="text-emerald-700">+{diff.toFixed(decimals)}{unit}</span>
                      ) : diff < 0 ? (
                        <span className="text-red-600">{diff.toFixed(decimals)}{unit}</span>
                      ) : (
                        <span className="text-slate-400">0.0{unit}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Row Quick Action */}
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          onSelectStudent(s);
                          onOpenSingleNotify && onOpenSingleNotify(s);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-[#3B4F7A] hover:text-white text-slate-600 text-[11px] font-semibold transition opacity-80 group-hover:opacity-100"
                        title={`Send advisory notice to ${s.display_name}`}
                      >
                        Notify
                      </button>
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


