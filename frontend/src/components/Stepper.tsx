import React from 'react';

interface StepperProps {
  currentStage: number; // 1 to 5
}

const STAGES = [
  { step: 1, label: 'Upload', desc: 'Policy Ingestion' },
  { step: 2, label: 'AI Analysis', desc: 'Strands Parser' },
  { step: 3, label: 'Human Review', desc: 'Admin Gate' },
  { step: 4, label: 'Validate', desc: 'Deterministic Calc' },
  { step: 5, label: 'Impact', desc: 'Cohort Ledger' },
];

export const Stepper: React.FC<StepperProps> = ({ currentStage }) => {
  return (
    <div className="w-full bg-surface-container-low border-b border-outline-variant/50 px-6 py-2.5">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {STAGES.map((s, idx) => {
          const isCompleted = currentStage > s.step;
          const isCurrent = currentStage === s.step;

          return (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-white ring-2 ring-primary/30'
                      : 'bg-outline-variant/40 text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  ) : (
                    s.step
                  )}
                </div>
                <div className="hidden sm:block">
                  <div
                    className={`text-xs font-bold leading-none ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-800' : 'text-on-surface-variant'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-[10px] text-outline mt-0.5 leading-none">{s.desc}</div>
                </div>
              </div>

              {idx < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    currentStage > s.step ? 'bg-emerald-500' : 'bg-outline-variant/30'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
