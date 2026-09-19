import React from 'react';
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
  evaluation_run: 'bg-[#3B4F7A]/10 text-[#3B4F7A]',
  notification_sent: 'bg-slate-100 text-slate-600',
};

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ isOpen, onClose, entries }) => {
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
              <h2 className="text-sm font-bold text-slate-900">Compliance Audit Ledger</h2>
              <p className="text-[11px] text-slate-400">Immutable record of pipeline events</p>
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

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <p className="font-medium text-slate-500">No audit events logged</p>
              <p className="text-slate-400 mt-1">Pipeline events will appear here as they occur.</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-slate-400 font-medium">{entries.length} events recorded</p>
              {entries.map((entry) => {
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
          <p className="text-[10px] text-slate-400">All records are immutable and tamper-evident</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-200 text-xs font-semibold hover:bg-slate-100 text-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
