import React from 'react';

interface HeaderProps {
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAudit }) => {
  return (
    <header className="w-full px-6 flex items-center justify-between border-b border-outline-variant dark:border-outline h-14 bg-surface-container-lowest shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-8">
        {/* Brand Logo + Context Switcher */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Ripple Logo" 
            className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-primary/20" 
          />
          <div className="flex items-center gap-2">
            <span className="text-xl font-headline font-bold text-on-surface tracking-tight">Ripple</span>
            <span className="text-outline-variant font-light">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-md border border-outline-variant/40 hover:border-outline cursor-pointer transition-colors">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs text-on-surface font-semibold tracking-wide">Apex University · Office of Academic Affairs</span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">unfold_more</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <a className="text-primary font-bold border-b-2 border-primary py-4 text-xs uppercase tracking-wider transition-colors flex items-center gap-1" href="#dashboard">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            Impact Analyses
          </a>
          <button 
            onClick={onOpenAudit}
            className="text-on-surface-variant hover:text-on-surface py-4 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            Audit Ledger
          </button>
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-md border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SIS Ledger: <strong className="text-on-surface font-semibold">500 Live Records</strong></span>
        </div>
        
        <div className="h-4 w-px bg-outline-variant"></div>

        <button 
          onClick={onOpenAudit}
          className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1" 
          title="View Compliance Audit Log"
        >
          <span className="material-symbols-outlined text-[20px]">shield_person</span>
          <span className="text-xs font-semibold hidden sm:inline">Audit Log</span>
        </button>
      </div>
    </header>
  );
};
