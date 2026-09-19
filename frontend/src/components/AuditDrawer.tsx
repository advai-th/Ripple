import React, { useState, useMemo } from 'react';
import type { AuditEntry } from '../types';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AuditEntry[];
}

const eventColors: Record<string, string> = {
  uploaded: 'bg-blue-100 text-blue-700',
  rule_extracted: 'bg-violet-100 text-violet-700',
  rule_confirmed: 'bg-emerald-100 text-emerald-700',
  rule_edited: 'bg-amber-100 text-amber-700',
  rule_rejected: 'bg-rose-100 text-rose-700',
  evaluation_run: 'bg-[#3B4F7A]/10 text-[#3B4F7A]',
  notification_sent: 'bg-slate-100 text-slate-600',
};

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ isOpen, onClose, entries }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEntries = useMemo(() => {
    if (filterType === 'RULES') {
      return entries.filter((e) => e.event_type.includes('rule') || e.event_type.includes('upload'));
    }
    if (filterType === 'EVALUATION') {
      return entries.filter((e) => e.event_type.includes('eval'));
    }
    if (filterType === 'NOTICES') {
      return entries.filter((e) => e.event_type.includes('notif'));
    }
    return entries;
  }, [entries, filterType]);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ripple_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 modal-backdrop">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col slide-in-right border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#3B4F7A]/10 flex items-center justify-center text-[#3B4F7A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Compliance Activity Ledger</h2>
              
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          {[
            { id: 'ALL', label: `All (${entries.length})` },
            { id: 'RULES', label: 'Policy Rules' },
            { id: 'EVALUATION', label: 'Evaluations' },
            { id: 'NOTICES', label: 'Notices' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                filterType === f.id
                  ? 'bg-[#1A1F2E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <p className="font-medium text-slate-500">No events found</p>
              <p className="text-slate-400 mt-1">Try switching back to the "All" filter.</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-slate-400 font-medium">{filteredEntries.length} events found</p>
              {filteredEntries.map((entry) => {
                const date = new Date(entry.timestamp);
                const timeFormatted = date.toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                });
                const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const colorClass = eventColors[entry.event_type] || 'bg-slate-100 text-slate-600';

                return (
                  <div key={entry.audit_id} className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
                        {entry.event_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{dateFormatted} · {timeFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Actor: <strong className="text-slate-700 font-semibold">{entry.actor}</strong>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        entry.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    {entry.details?.summary && (
                      <div className="text-[11px] font-medium text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                        {String(entry.details.summary)}
                      </div>
                    )}
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <div className="text-[10px] font-mono bg-slate-50 p-2 rounded border border-slate-200 text-slate-600 max-h-20 overflow-y-auto space-y-0.5">
                        {Object.entries(entry.details).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-slate-800 font-semibold">{k}:</span>{' '}
                            <span className="text-slate-500">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Export Ledger
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
