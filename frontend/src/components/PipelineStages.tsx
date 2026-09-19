import React from 'react';

interface PipelineStagesProps {
  currentStage?: number; // 1-7 or 0 = idle
  isRunning?: boolean;
  policyTitle?: string;
  ruleId?: string;
  confidence?: number;
  onOpenReviewModal?: () => void;
}

const STAGES = [
  { id: 1, label: 'Upload Policy', description: 'PDF/text extracted & stored' },
  { id: 2, label: 'Detect Change', description: 'Identify salient rule change' },
  { id: 3, label: 'Extract Rule', description: 'AI extracts structured predicate' },
  { id: 4, label: 'Human Review', description: 'Admin confirms rule before evaluation' },
  { id: 5, label: 'Query Cohort', description: 'Deterministic dataset query' },
  { id: 6, label: 'Evaluate Impact', description: 'Per-record deterministic check' },
  { id: 7, label: 'Generate Actions', description: 'LLM-personalized next steps' },
];

export const PipelineStages: React.FC<PipelineStagesProps> = ({
  currentStage = 0,
  isRunning = false,
  policyTitle,
  ruleId,
  confidence,
  onOpenReviewModal,
}) => {
  const completed = currentStage > 0 ? Math.min(currentStage, 7) : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Analysis Pipeline</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isRunning
              ? `Stage ${currentStage} of 7 — Processing...`
              : completed === 7
              ? 'Pipeline complete · All stages passed'
              : 'Idle — upload a policy or select a scenario to begin'}
          </p>
        </div>
        {confidence !== undefined && (
          <div className="text-right">
            <div className="text-xs text-slate-400">AI Confidence</div>
            <div className={`text-sm font-bold font-mono ${confidence >= 0.9 ? 'text-emerald-700' : confidence >= 0.7 ? 'text-amber-700' : 'text-red-700'}`}>
              {(confidence * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Stages */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100"></div>
        {completed > 0 && (
          <div
            className="absolute left-4 top-4 w-0.5 bg-[#3B4F7A]/60 transition-all duration-700"
            style={{ height: `${Math.min(100, ((completed - 0.5) / 6) * 100)}%` }}
          />
        )}

        <div className="space-y-3">
          {STAGES.map((stage) => {
            const isDone = stage.id < completed + 1 && !isRunning ? true : stage.id <= completed - 1;
            const isCurrent = stage.id === completed && isRunning;
            const isPending = stage.id > completed || (stage.id === completed && isRunning && false);
            const isComplete = stage.id < completed || (stage.id <= completed && !isRunning && completed === 7);

            // Simpler logic
            let stageState: 'done' | 'active' | 'pending';
            if (isRunning && stage.id === currentStage) stageState = 'active';
            else if (stage.id < currentStage || (!isRunning && stage.id <= completed)) stageState = 'done';
            else stageState = 'pending';

            return (
              <div key={stage.id} className="flex items-start gap-3 pl-0 relative">
                {/* Stage dot */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
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

                {/* Label */}
                <div className={`flex-1 min-w-0 pt-1.5 ${stageState === 'pending' ? 'opacity-50' : ''}`}>
                  <div className={`text-xs font-semibold leading-tight ${stageState === 'active' ? 'text-[#3B4F7A]' : stageState === 'done' ? 'text-slate-800' : 'text-slate-400'}`}>
                    {stage.label}
                    {stage.id === 4 && onOpenReviewModal && stageState === 'done' && (
                      <button
                        onClick={onOpenReviewModal}
                        className="ml-2 text-[10px] text-[#3B4F7A] underline font-normal"
                      >
                        Edit rule →
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stage.description}</div>
                </div>

                {/* Active spinner */}
                {stageState === 'active' && (
                  <div className="shrink-0 pt-1">
                    <svg className="w-3.5 h-3.5 text-[#3B4F7A] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active run info */}
      {policyTitle && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Active Analysis</div>
          <p className="text-xs font-semibold text-slate-700 truncate">{policyTitle}</p>
          {ruleId && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ruleId}</p>}
        </div>
      )}
    </div>
  );
};
