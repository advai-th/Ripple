import React from 'react';
import type { AuditEntry } from '../types';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AuditEntry[];
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ isOpen, onClose, entries }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-outline-variant">
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </span>
            <div>
              <h2 className="text-sm font-headline font-bold text-on-surface">Compliance Audit Ledger</h2>
              <p className="text-[11px] text-outline">Immutable record of policy extractions & runs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Audit Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-outline">
              <span className="material-symbols-outlined text-[32px] text-outline/40 mb-2">history_toggle_off</span>
              <p>No audit events logged yet.</p>
            </div>
          ) : (
            entries.map((entry) => {
              const date = new Date(entry.timestamp);
              const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div key={entry.audit_id} className="p-3 rounded-lg bg-surface border border-outline-variant/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface font-code text-[11px]">
                      {entry.event_type}
                    </span>
                    <span className="text-[10px] text-outline font-code">{timeFormatted}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant">Actor: <strong className="text-on-surface">{entry.actor}</strong></span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {entry.status}
                    </span>
                  </div>

                  {entry.details && (
                    <div className="text-[11px] font-code bg-surface-container-low p-2 rounded text-outline mt-1 max-h-20 overflow-y-auto">
                      {Object.entries(entry.details).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <strong className="text-on-surface">{k}:</strong> {String(v)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-outline-variant text-xs font-semibold hover:bg-surface text-on-surface transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
