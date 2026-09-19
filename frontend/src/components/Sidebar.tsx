import React from 'react';

interface SidebarProps {
  currentTab?: string;
  onOpenAudit: () => void;
  onOpenNotifications: () => void;
  onOpenReviewModal: () => void;
  activePoliciesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAudit,
  onOpenNotifications,
  onOpenReviewModal,
  activePoliciesCount = 4,
}) => {
  return (
    <aside className="w-60 bg-[#1A1F2E] text-slate-400 flex flex-col justify-between shrink-0 select-none h-full overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B4F7A] flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 3a6 6 0 0 1 6 6c0 3.31-2.69 6-6 6s-6-2.69-6-6a6 6 0 0 1 6-6zm0 3a3 3 0 0 0-3 3c0 1.66 1.34 3 3 3s3-1.34 3-3a3 3 0 0 0-3-3z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-tight">Ripple</span>
              <span className="text-[10px] text-slate-500 tracking-wider">Policy Impact Engine</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {/* Main */}
          <div>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1.5">Main</div>
            <ul className="space-y-0.5">
              <li>
                <a href="#overview" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-white bg-white/7 text-xs font-semibold">
                  <svg className="w-4 h-4 text-[#6B84C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="3" y="3" />
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="14" y="3" />
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="14" y="14" />
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="3" y="14" />
                  </svg>
                  Overview
                </a>
              </li>
              <li>
                <a href="#metrics" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Policy Management */}
          <div>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1.5">Policies</div>
            <ul className="space-y-0.5">
              <li>
                <div
                  onClick={onOpenReviewModal}
                  className="flex items-center justify-between px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Active Policies
                  </span>
                  <span className="text-[10px] bg-[#3B4F7A]/60 text-blue-300 px-1.5 py-0.5 rounded font-semibold">{activePoliciesCount}</span>
                </div>
              </li>
              <li>
                <button
                  onClick={onOpenReviewModal}
                  className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Rule Verification
                </button>
              </li>
              <li>
                <a href="#analyses" className="flex items-center justify-between px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                  <span className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Impact Reports
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </a>
              </li>
              <li>
                <a href="#cohorts" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Student Cohorts
                </a>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1.5">Administration</div>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={onOpenAudit}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Audit Logs
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenNotifications}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Notifications
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#3B4F7A] text-blue-200">26</span>
                </button>
              </li>
              <li>
                <a href="#settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Bottom Profile */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
          <div className="relative w-7 h-7 rounded-full bg-[#3B4F7A] flex items-center justify-center font-bold text-white text-[10px] border border-white/10 shrink-0">
            AT
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#1A1F2E]"></span>
          </div>
          <div className="truncate flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Dr. Aris Thorne</h4>
            <p className="text-[10px] text-slate-500 truncate">Registrar · Admin</p>
          </div>
          <button
            onClick={onOpenAudit}
            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center shrink-0 transition"
            title="Settings"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
