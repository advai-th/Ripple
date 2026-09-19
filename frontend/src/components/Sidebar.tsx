import React from 'react';
import heroLogo from '../assets/hero.png';

// ============================================================================
// 🎨 LOGO SIZE CONFIGURATION - CHANGE LOGO WIDTH & HEIGHT HERE
// You can use numbers (e.g. 36 for 36px) or CSS strings (e.g. '40px', '2.5rem')
// ============================================================================
const DEFAULT_LOGO_WIDTH: number | string = 40;  // <-- EDIT WIDTH HERE
const DEFAULT_LOGO_HEIGHT: number | string = 40; // <-- EDIT HEIGHT HERE

interface SidebarProps {
  currentTab?: string;
  onOpenAudit: () => void;
  onOpenNotifications: () => void;
  onOpenReviewModal: () => void;
  onSelectDashboard?: () => void;
  onOpenAdvisoryNotices?: () => void;
  activePoliciesCount?: number;
  affectedCount?: number;
  logoWidth?: number | string;
  logoHeight?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAudit,
  onOpenNotifications,
  onOpenReviewModal,
  onSelectDashboard,
  onOpenAdvisoryNotices,
  activePoliciesCount = 4,
  affectedCount = 34,
  logoWidth = DEFAULT_LOGO_WIDTH,
  logoHeight = DEFAULT_LOGO_HEIGHT,
}) => {
  const widthVal = typeof logoWidth === 'number' ? `${logoWidth}px` : logoWidth;
  const heightVal = typeof logoHeight === 'number' ? `${logoHeight}px` : logoHeight;

  return (
    <aside className="w-56 bg-[#1A1F2E] text-slate-400 flex flex-col justify-between shrink-0 select-none h-full overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div 
              style={{ width: widthVal, height: heightVal }}
              className="rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            >
              <img 
                src={heroLogo} 
                alt="Ripple Logo" 
                style={{ width: '100%', height: '100%' }}
                className="object-contain" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
              />
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight text-white block leading-tight">Ripple</span>
              
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-1.5">Overview</div>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={onSelectDashboard}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white bg-white/10 hover:bg-white/15 transition-colors text-xs font-semibold text-left"
                >
                  <svg className="w-4 h-4 text-[#8FA5D8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="3" y="3" />
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="14" y="3" />
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="14" y="14" />
                    <rect height="7" rx="1" strokeWidth="2" width="7" x="3" y="14" />
                  </svg>
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenReviewModal}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Policy Rules
                  </span>
                  <span className="text-[10px] bg-[#3B4F7A] text-white px-1.5 py-0.5 rounded-full font-bold">{activePoliciesCount}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Student Actions */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-1.5">Actions</div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={onOpenAdvisoryNotices || onOpenNotifications}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Advisory Notices
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600/80 text-white">{affectedCount}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAudit}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium text-left"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Activity History
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Bottom Profile */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="relative w-8 h-8 rounded-full bg-[#3B4F7A] flex items-center justify-center font-bold text-white text-xs shrink-0">
            AT
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#1A1F2E]"></span>
          </div>
          <div className="truncate flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Dr. Aris Thorne</h4>
            <p className="text-[10px] text-slate-400 truncate">Academic Dean / Registrar</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

