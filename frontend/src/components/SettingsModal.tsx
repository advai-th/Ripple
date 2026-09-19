import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, session, logout, authMode } = useAuth();

  if (!isOpen || !user) return null;

  const handleSignOut = () => {
    logout();
    onClose();
  };

  const expiresDate = session?.expiresAt ? new Date(session.expiresAt).toLocaleTimeString() : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3B4F7A] text-white font-bold text-sm flex items-center justify-center ring-4 ring-[#3B4F7A]/10">
              {user.avatarInitials}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{user.name}</h2>
              <span className="text-xs text-slate-500">{user.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Institutional Account Details */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Institutional Identity
            </h3>
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Institution</span>
                <span className="font-semibold text-slate-900 text-xs">{user.institution}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-900 text-xs truncate block">{user.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Email Address</span>
                <span className="font-semibold text-slate-900 text-xs">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
            </div>
          </div>

          {/* Session & Security */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Security & Session
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Authentication Provider:</span>
                <span className="font-semibold text-slate-900">
                  {authMode === 'cognito' ? 'Amazon Cognito (AWS IDP)' : 'Institutional Demo Identity'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Access Token Validity:</span>
                <span className="font-mono text-slate-700 font-semibold">Active until {expiresDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Audit Provenance Signature:</span>
                <span className="font-semibold text-emerald-700">Enforced on all rule confirmations</span>
              </div>
            </div>
          </div>

          {/* Institutional Policy Configuration */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Policy Engine Parameters
            </h3>
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#3B4F7A] block">At-Risk Buffer Threshold</span>
                <span className="text-[11px] text-slate-500">Flag compliant students within margin of requirement</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-white border border-blue-200 font-bold text-slate-800 text-xs shadow-2xs">
                ± 5.0%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Sign Out
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#3B4F7A] hover:bg-[#2E3F63] text-white text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
