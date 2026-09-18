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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">forward_to_inbox</span>
            </span>
            <div>
              <h2 className="text-sm font-headline font-bold text-on-surface">
                Intervention Simulation & Dispatch
              </h2>
              <p className="text-[11px] text-outline">
                Recipient: {student.display_name} ({student.student_id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center border-b border-outline-variant/60 px-6 bg-surface">
          <button
            onClick={() => setActiveChannel('email')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeChannel === 'email'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            Student Email
          </button>
          <button
            onClick={() => setActiveChannel('sms')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeChannel === 'sms'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sms</span>
            SMS Alert
          </button>
          <button
            onClick={() => setActiveChannel('advisor')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeChannel === 'advisor'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment_late</span>
            Advisor Action Item
          </button>
        </div>

        {/* Channel Previews */}
        <div className="p-6 text-xs space-y-4">
          {activeChannel === 'email' && (
            <div className="space-y-3">
              <div className="p-3 bg-surface rounded-lg border border-outline-variant/50">
                <span className="text-[10px] uppercase font-bold text-outline block mb-1">Subject</span>
                <span className="font-bold text-on-surface">
                  {email?.subject || `URGENT: Academic Compliance Notice — Course ${student.course_id || 'CS-502'}`}
                </span>
              </div>
              <div className="p-4 bg-surface rounded-lg border border-outline-variant/50 whitespace-pre-line text-on-surface-variant leading-relaxed">
                {email?.body ||
                  `Dear ${student.display_name},\n\nYour current standing in ${student.course_id || 'CS-502'} is recorded at ${student.actual_value}%, which does not satisfy the newly mandated requirement of ${student.required_value}%.\n\nPlease schedule an urgent consultation with your academic advisor to initiate an attendance recovery plan.\n\nOffice of Academic Affairs\nApex University`}
              </div>
            </div>
          )}

          {activeChannel === 'sms' && (
            <div className="p-4 bg-surface rounded-lg border border-outline-variant/50 space-y-2">
              <span className="text-[10px] uppercase font-bold text-outline block">SMS Body (160 char limit)</span>
              <p className="font-code text-on-surface font-medium leading-relaxed">
                {sms?.message ||
                  `[Apex Alert] ${student.display_name}: Standing in ${student.course_id} (${student.actual_value}%) is below requirement (${student.required_value}%). Check portal for remediation.`}
              </p>
            </div>
          )}

          {activeChannel === 'advisor' && (
            <div className="p-4 bg-surface rounded-lg border border-outline-variant/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-outline">Priority</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                  {advisor?.priority || 'HIGH'}
                </span>
              </div>
              <h3 className="font-bold text-on-surface text-sm">
                {advisor?.title || `Mandatory Academic Counseling Task — ${student.student_id}`}
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                {advisor?.description ||
                  `Student is currently deficient by ${Math.abs(student.gap).toFixed(1)} percentage points under the active policy. Required action: conduct 1-on-1 counseling and assign recovery sessions.`}
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-outline-variant text-on-surface hover:bg-surface font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onDispatch}
              disabled={isDispatching}
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Dispatching...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Confirm & Dispatch Simulation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
