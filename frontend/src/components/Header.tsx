import React, { useRef } from 'react';
import type { PolicySample, ExtractedRule } from '../types';

interface HeaderProps {
  samples: PolicySample[];
  selectedSampleKey: string;
  onSelectSample: (key: string) => void;
  isEvaluating: boolean;
  onUploadFile: (file: File) => void;
  onOpenReviewModal: () => void;
  onOpenAudit: () => void;
  onOpenNotifications: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  extractedRule: ExtractedRule | null;
  currentPolicyTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  samples,
  selectedSampleKey,
  onSelectSample,
  isEvaluating,
  onUploadFile,
  onOpenReviewModal,
  onOpenAudit,
  onOpenNotifications,
  searchQuery,
  onSearchChange,
  extractedRule,
  currentPolicyTitle,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Title + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900">Policy Impact Dashboard</h1>
            {isEvaluating && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-dot"></span>
                Evaluating...
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {currentPolicyTitle ? (
              <span><span className="text-slate-500 font-medium">{currentPolicyTitle}</span> · Active regulation</span>
            ) : (
              'Monitor policy changes, compliance thresholds, and institutional impact'
            )}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Scenario Selector */}
        <div className="relative">
          <select
            value={selectedSampleKey}
            onChange={(e) => onSelectSample(e.target.value)}
            disabled={isEvaluating}
            className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer appearance-none disabled:opacity-50"
          >
            {samples.map((s) => (
              <option key={s.sample_key} value={s.sample_key}>
                {s.title}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Upload Policy */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt,.docx" className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isEvaluating}
          className="px-3 py-1.5 bg-[#3B4F7A] hover:bg-[#2E3F63] text-white border border-[#3B4F7A] rounded-md text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          title="Upload institutional policy document"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Upload Policy
        </button>

        {/* Threshold indicator */}
        {extractedRule && (
          <button
            onClick={onOpenReviewModal}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Threshold: {extractedRule.threshold_value}%
          </button>
        )}

        {/* Search */}
        <div className="relative w-52">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            placeholder="Search students..."
          />
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition"
          title="Notifications"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white"></span>
        </button>

        {/* Audit / Settings */}
        <button
          onClick={onOpenAudit}
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition"
          title="Audit Trail"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </header>
  );
};
