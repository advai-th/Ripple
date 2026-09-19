import React, { useState } from 'react';
import type { NotificationPreview, ImpactResult } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: ImpactResult | null;
  batchStudents?: ImpactResult[];
  notificationPreview: NotificationPreview | null;
  isDispatching: boolean;
  onDispatch: (targetStudents?: ImpactResult[]) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  student,
  batchStudents = [],
  notificationPreview,
  isDispatching,
  onDispatch,
}) => {
  const [activeChannel, setActiveChannel] = useState<'email' | 'sms' | 'advisor'>('email');

  const isBatch = batchStudents.length > 0;
  const activeStudent = student || batchStudents[0] || null;

  if (!isOpen || (!activeStudent && !isBatch)) return null;

  const email = notificationPreview?.channels.email;
  const sms = notificationPreview?.channels.sms;
  const advisor = notificationPreview?.channels.advisor_task;

  const channels = [
    { id: 'email' as const, label: 'Email Notice', icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    )},
    { id: 'sms' as const, label: 'SMS Alert', icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    )},
    { id: 'advisor' as const, label: 'Counselor Task', icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    )},
  ];

  const handleConfirm = () => {
    if (isBatch) {
      onDispatch(batchStudents);
    } else {
      onDispatch(activeStudent ? [activeStudent] : []);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden fade-zoom-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3B4F7A]/10 flex items-center justify-center text-[#3B4F7A]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isBatch ? `Batch Notice Dispatch (${batchStudents.length} Students)` : 'Advisory Notice Dispatch'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBatch ? (
                  <span>Dispatching personalized notices to <strong className="text-slate-700">{batchStudents.length} recipients</strong></span>
                ) : (
                  <span>Recipient: <strong className="text-slate-700">{activeStudent?.display_name}</strong> (ID: {activeStudent?.student_id})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Batch Pill Preview */}
        {isBatch && (
          <div className="px-5 py-2.5 bg-blue-50/50 border-b border-blue-100/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium shrink-0">Recipients:</span>
            <div className="flex gap-1.5 overflow-x-auto py-0.5">
              {batchStudents.slice(0, 4).map((s) => (
                <span key={s.student_id} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shrink-0">
                  {s.display_name}
                </span>
              ))}
              {batchStudents.length > 4 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#3B4F7A] font-bold text-[11px] shrink-0">
                  +{batchStudents.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Channel Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-white px-5">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
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
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject Line</span>
                <span className="font-semibold text-slate-800">
                  {email?.subject || `URGENT: Academic Compliance Notice — Course ${activeStudent?.course_id || 'CS-502'}`}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                {email?.body ? (
                  isBatch ? email.body.replace(activeStudent?.display_name || '', '{student_name}') : email.body
                ) : (
                  `Dear ${isBatch ? '{student_name}' : activeStudent?.display_name},\n\nYour current standing in ${activeStudent?.course_id || 'CS-502'} is recorded at ${isBatch ? '{actual_score}%' : `${activeStudent?.actual_value}%`}, which does not satisfy the newly mandated requirement of ${activeStudent?.required_value}%.\n\nPlease schedule an urgent consultation with your academic advisor to initiate an attendance recovery plan.\n\nSincerely,\nOffice of Academic Affairs`
                )}
              </div>
            </div>
          )}

          {activeChannel === 'sms' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">SMS Body Template</span>
                <span className="text-[10px] text-slate-400">Personalized per student</span>
              </div>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200 font-sans">
                {sms?.message ||
                  `[Compliance Alert] ${isBatch ? '{student_name}' : activeStudent?.display_name}: Your standing in ${activeStudent?.course_id || 'CS-502'} is currently below the required threshold. Please check your student portal.`}
              </p>
            </div>
          )}

          {activeChannel === 'advisor' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Counseling Task Queue</span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px] border border-red-200">
                  {advisor?.priority || 'HIGH PRIORITY'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isBatch ? `Assign Counseling Sessions — ${batchStudents.length} Students` : (advisor?.title || `Mandatory Counseling Required — ${activeStudent?.student_id}`)}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {advisor?.description ||
                  `Automated calendar holds and mandatory 1-on-1 counseling invitations will be queued for assigned academic advisors.`}
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Multi-channel delivery enabled
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDispatching}
                className="px-4 py-2 rounded-lg bg-[#3B4F7A] hover:bg-[#2E3F63] text-white font-bold text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
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
                    {isBatch ? `Dispatch to All ${batchStudents.length}` : 'Confirm & Dispatch'}
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

