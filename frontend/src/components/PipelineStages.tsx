import React, { useState } from 'react';

interface PipelineStagesProps {
  currentStage?: number; // 1-7 or 0 = idle
  isRunning?: boolean;
  policyTitle?: string;
  ruleId?: string;
  confidence?: number;
  onOpenReviewModal?: () => void;
}

const STAGES = [
  { id: 1, label: 'Document Upload', description: 'Policy document received and read' },
  { id: 2, label: 'Section Analysis', description: 'Located the specific rule clause' },
  { id: 3, label: 'Rule Extraction', description: 'Identified minimum passing criteria' },
  { id: 4, label: 'Staff Confirmation', description: 'Requirement reviewed and verified' },
  { id: 5, label: 'Roster Match', description: 'Scanned enrolled student records' },
  { id: 6, label: 'Standing Check', description: 'Calculated each student’s current status' },
  { id: 7, label: 'Action Generation', description: 'Personalized advisories ready to send' },
];

export const PipelineStages: React.FC<PipelineStagesProps> = ({
  currentStage = 0,
  isRunning = false,
  policyTitle,
  confidence,
  onOpenReviewModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const completed = currentStage > 0 ? Math.min(currentStage, 7) : 0;
  const isAllComplete = completed === 7 && !isRunning;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Clickable Header / Summary */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isAllComplete
              ? 'bg-emerald-100 text-emerald-700'
              : isRunning
              ? 'bg-blue-100 text-[#3B4F7A]'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {isAllComplete ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            ) : isRunning ? (
              <svg className="w-4 h-4 animate-spin text-[#3B4F7A]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span>✓</span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Policy Verification
              <span className="font-normal text-slate-400">
                ({completed}/7 checks complete)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isRunning
                ? `Checking stage ${currentStage} of 7...`
                : isAllComplete
                ? 'All policy checks successfully completed'
                : 'Ready to evaluate'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {confidence !== undefined && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {(confidence * 100).toFixed(0)}% Match
            </span>
          )}
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Stages List */}
      {(isExpanded || isRunning) && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 fade-zoom-in">
          <div className="relative pt-2">
            {/* Connecting line */}
            <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-slate-100"></div>

            <div className="space-y-2.5">
              {STAGES.map((stage) => {
                let stageState: 'done' | 'active' | 'pending';
                if (isRunning && stage.id === currentStage) stageState = 'active';
                else if (stage.id <= completed) stageState = 'done';
                else stageState = 'pending';

                return (
                  <div key={stage.id} className="flex items-start gap-3 relative">
                    {/* Dot */}
                    <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all text-xs ${
                      stageState === 'done'
                        ? 'bg-[#3B4F7A] border-[#3B4F7A] text-white'
                        : stageState === 'active'
                        ? 'bg-white border-[#3B4F7A] text-[#3B4F7A]'
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      {stageState === 'done' ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                        </svg>
                      ) : stageState === 'active' ? (
                        <span className="w-2 h-2 rounded-full bg-[#3B4F7A] pulse-dot"></span>
                      ) : (
                        <span className="text-[10px] font-bold">{stage.id}</span>
                      )}
                    </div>

                    {/* Label & Description */}
                    <div className={`flex-1 min-w-0 pt-0.5 ${stageState === 'pending' ? 'opacity-40' : ''}`}>
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {stage.label}
                        {stage.id === 4 && onOpenReviewModal && stageState === 'done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReviewModal();
                            }}
                            className="ml-2 text-[11px] text-[#3B4F7A] underline font-normal hover:text-[#2E3F63]"
                          >
                            Edit rule →
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{stage.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {policyTitle && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">Policy: <strong className="text-slate-700">{policyTitle}</strong></span>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-600 ml-2 whitespace-nowrap"
              >
                Hide steps
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

