import React, { useState, useRef, useEffect } from 'react';
import heroLogo from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';

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
  onOpenSettings?: () => void;
  activePoliciesCount?: number;
  affectedCount?: number;
  currentView?: 'dashboard' | 'rule-review';
  logoWidth?: number | string;
  logoHeight?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAudit,
  onOpenNotifications,
  onOpenReviewModal,
  onSelectDashboard,
  onOpenAdvisoryNotices,
  onOpenSettings,
  activePoliciesCount = 4,
  affectedCount = 34,
  currentView = 'dashboard',
  logoWidth = DEFAULT_LOGO_WIDTH,
  logoHeight = DEFAULT_LOGO_HEIGHT,
}) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const widthVal = typeof logoWidth === 'number' ? `${logoWidth}px` : logoWidth;
  const heightVal = typeof logoHeight === 'number' ? `${logoHeight}px` : logoHeight;

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const displayName = user?.name || 'Dr. Aris Thorne';
  const displayRole = user?.role || 'Registrar';
  const displayInstitution = user?.institution || 'ABC University';
  const initials = user?.avatarInitials || 'AT';

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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-xs text-left cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'text-white bg-white/10 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <svg className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-[#8FA5D8]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs text-left cursor-pointer ${
                    currentView === 'rule-review'
                      ? 'text-white bg-white/10 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <svg className={`w-4 h-4 ${currentView === 'rule-review' ? 'text-[#8FA5D8]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Rule Review
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

      {/* Dynamic Bottom Profile with Popover Menu */}
      <div className="p-3 border-t border-white/5 relative" ref={profileMenuRef}>
        
        {/* Profile Popover Menu */}
        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#141A29] border border-white/10 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <span className="text-[10px] text-slate-400 font-medium block">Authenticated As</span>
              <span className="text-xs font-bold text-white truncate block">{displayName}</span>
              <span className="text-[10px] text-[#8FA5D8] truncate block">{displayInstitution}</span>
            </div>

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onOpenSettings && onOpenSettings();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-xs font-medium transition text-left"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Profile & Details
            </button>

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onOpenSettings && onOpenSettings();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-xs font-medium transition text-left"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Account Settings
            </button>

            <div className="my-1 border-t border-white/5" />

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold transition text-left"
            >
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Sign Out
            </button>
          </div>
        )}

        {/* Profile Card Trigger */}
        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
          title="Click to view profile & account settings"
        >
          <div className="relative w-8 h-8 rounded-full bg-[#3B4F7A] flex items-center justify-center font-bold text-white text-xs shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition">
            {initials}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#1A1F2E]"></span>
          </div>
          <div className="truncate flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{displayName}</h4>
            <p className="text-[10px] text-slate-400 truncate">{displayRole} · {displayInstitution}</p>
          </div>
          <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </aside>
  );
};


