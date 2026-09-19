import React, { useState } from 'react';
import type { NotificationPreview, ImpactResult } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: ImpactResult | null;
  notificationPreview: NotificationPreview | null;
  isDispatching: boolean;
  onDispatch: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  student,
  notificationPreview,
  isDispatching,
  onDispatch,
}) => {
  const [activeChannel, setActiveChannel] = useState<'email' | 'sms' | 'advisor'>('email');

  if (!isOpen || !student) return null;

  const email = notificationPreview?.channels.email;
  const sms = notificationPreview?.channels.sms;
  const advisor = notificationPreview?.channels.advisor_task;

  const channels = [
    { id: 'email' as const, label: 'Email', icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    )},
    { id: 'sms' as const, label: 'SMS', icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    )},
    { id: 'advisor' as const, label: 'Advisor Task', icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    )},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden fade-zoom-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#3B4F7A]/10 flex items-center justify-center text-[#3B4F7A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notification Dispatch</h2>
              <p className="text-[11px] text-slate-400">
                To: <span className="font-semibold text-slate-600">{student.display_name}</span> ({student.student_id})
              </p>
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

        {/* Channel Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-white px-5">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeChannel === ch.id
                  ? 'border-[#3B4F7A] text-[#3B4F7A]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {ch.icon}
              {ch.label}
            </button>
          ))}
        </div>

        {/* Channel Previews */}
        <div className="p-5 text-xs space-y-3">
          {activeChannel === 'email' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject Line</span>
                <span className="font-semibold text-slate-800">
                  {email?.subject || `URGENT: Academic Compliance Notice — Course ${student.course_id || 'CS-502'}`}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed">
                {email?.body ||
                  `Dear ${student.display_name},\n\nYour current standing in ${student.course_id || 'CS-502'} is recorded at ${student.actual_value}%, which does not satisfy the newly mandated requirement of ${student.required_value}%.\n\nPlease schedule an urgent consultation with your academic advisor to initiate an attendance recovery plan.\n\nSincerely,\nOffice of Academic Affairs`}
              </div>
            </div>
          )}

          {activeChannel === 'sms' && (
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">SMS Body</span>
                <span className="text-[10px] text-slate-400">160 char limit</span>
              </div>
              <p className="font-mono text-slate-700 leading-relaxed">
                {sms?.message ||
                  `[Compliance Alert] ${student.display_name}: Standing in ${student.course_id} (${student.actual_value}%) is below requirement (${student.required_value}%). Check your portal.`}
              </p>
            </div>
          )}

          {activeChannel === 'advisor' && (
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Priority</span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px] border border-red-200">
                  {advisor?.priority || 'HIGH'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {advisor?.title || `Mandatory Counseling Required — ${student.student_id}`}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {advisor?.description ||
                  `Student is currently deficient by ${Math.abs(Number(student.gap || 0)).toFixed(1)} percentage points. Required action: conduct 1-on-1 counseling and assign attendance recovery sessions.`}
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Simulated dispatch — not sent to real systems
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={onDispatch}
                disabled={isDispatching}
                className="px-4 py-1.5 rounded bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                {isDispatching ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                    </svg>
                    Dispatching...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Confirm & Dispatch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
