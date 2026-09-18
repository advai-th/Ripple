import React, { useRef } from 'react';
import type { ExtractedRule, PolicySample } from '../types';

interface PolicyBannerProps {
  currentPolicyTitle: string;
  currentFilename: string;
  extractedRule: ExtractedRule | null;
  samples: PolicySample[];
  selectedSampleKey: string;
  isEvaluating: boolean;
  onSelectSample: (key: string) => void;
  onUploadFile: (file: File) => void;
  onOpenReviewModal: () => void;
  onRunAnalysis: () => void;
}

export const PolicyBanner: React.FC<PolicyBannerProps> = ({
  currentPolicyTitle,
  currentFilename,
  extractedRule,
  samples,
  selectedSampleKey,
  isEvaluating,
  onSelectSample,
  onUploadFile,
  onOpenReviewModal,
  onRunAnalysis,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const isGPA = extractedRule?.field?.toLowerCase().includes('gpa');
  const unit = isGPA ? '' : '%';
  const thresholdDisplay = extractedRule
    ? `${extractedRule.threshold_value}${unit}`
    : '75%';

  return (
    <div className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Active Policy Details */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5 shadow-inner">
            <span className="material-symbols-outlined text-[24px]">description</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-headline font-bold text-on-surface tracking-tight">
                {currentPolicyTitle || 'Academic Regulation Directive'}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-code font-bold px-2 py-0.5 rounded bg-primary-fixed/50 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[12px]">gavel</span>
                Threshold: {thresholdDisplay}
              </span>
              {extractedRule?.human_confirmed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Admin Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="material-symbols-outlined text-[12px]">pending_actions</span>
                  Draft Rule
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Source: <span className="font-code font-medium text-on-surface">{currentFilename}</span> · Section: {extractedRule?.source_section || 'Section 4.1'} (Page {extractedRule?.source_page || 1})
            </p>
          </div>
        </div>

        {/* Center: Sample Policies Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-outline tracking-wider uppercase">Scenarios:</span>
          {samples.map((s) => {
            const isSelected = selectedSampleKey === s.sample_key;
            return (
              <button
                key={s.sample_key}
                onClick={() => onSelectSample(s.sample_key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface hover:bg-surface-container text-on-surface border-outline-variant/60'
                }`}
              >
                {s.title.includes('85%') ? '85% Strict Mandate' : s.title.includes('GPA') ? '3.50 Honors GPA' : '75% Attendance (Std)'}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.pdf,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-md border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Upload Policy
          </button>

          <button
            onClick={onOpenReviewModal}
            className="px-3 py-2 rounded-md border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Edit Rule
          </button>

          <button
            onClick={onRunAnalysis}
            disabled={isEvaluating}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Evaluating 500 Students...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                Run Impact Analysis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
