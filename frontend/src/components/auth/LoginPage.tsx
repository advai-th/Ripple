import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import heroLogo from '../../assets/hero.png';

interface LoginPageProps {
  onOpenForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenForgotPassword }) => {
  const { login, loginAsDemo, isSessionExpired, clearSessionExpired } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your institutional email and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. The email or password is incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsDemoSubmitting(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 sm:p-10 lg:p-16 xl:p-24 overflow-hidden bg-gradient-to-br from-[#F0F6FC] via-[#E4EFFB] to-[#D6E6F7] text-slate-800 antialiased font-sans select-none relative">
      
      {/* Soft Ambient Radial Accents (Seamless Bluish Background Glow) */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-blue-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Unified Content Container (No hard cut down the center) */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1360px] flex flex-col lg:flex-row items-center justify-between gap-12 xl:gap-20 my-auto">
        
        {/* ===================================================================== */}
        {/* LEFT: Minimalist Brand & Landing Information (Clean & Uncluttered)    */}
        {/* ===================================================================== */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left lg:-translate-x-4 xl:-translate-x-8">

  {/* Logo & Ripple Name */}
  <div className="flex items-center gap-4 sm:gap-5 mb-5 justify-center lg:justify-start">
    <div className="w-16 h-16 sm:w-20 sm:h-20 xl:w-22 xl:h-22 rounded-2xl flex items-center justify-center shrink-0 transform hover:scale-105 transition-transform">
      <img
        src={heroLogo}
        alt="Ripple Logo"
        className="w-full h-full object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo.png';
        }}
      />
    </div>

    <h1 className="text-6xl sm:text-7xl xl:text-8xl font-black text-slate-900 tracking-[-0.04em] leading-none">
      Ripple
    </h1>
  </div>

  {/* Subtitle */}
  <p className="text-xl sm:text-2xl xl:text-[26px] font-bold text-slate-800 tracking-tight leading-snug max-w-xl mb-4">
    Academic policy impact intelligence portal
  </p>

  {/* Value Proposition */}
  <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-xl mb-8">
    Simulate regulatory updates, model student cohort progression, and
    forecast institutional impact prior to policy adoption.
  </p>

  {/* Key Capabilities */}
  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 border-t border-slate-200/70 text-sm text-slate-600 font-medium w-full max-w-xl">

    <div className="flex items-center gap-2.5">
      <div className="w-2 h-2 rounded-full bg-[#0155eb]" />
      <span>Real-Time Policy Simulations</span>
    </div>

    <div className="flex items-center gap-2.5">
      <div className="w-2 h-2 rounded-full bg-[#0155eb]" />
      <span>Cohort Risk Modeling</span>
    </div>

    <div className="flex items-center gap-2.5">
      <div className="w-2 h-2 rounded-full bg-[#0155eb]" />
      <span>Automated Dispatches</span>
    </div>

  </div>
</div>

        {/* ===================================================================== */}
        {/* RIGHT: Floating Modern Sign In Card (Frosted Light Aesthetic)         */}
        {/* ===================================================================== */}
        <div className="w-full max-w-md bg-white/85 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-900/10 border border-white/90 p-7 sm:p-9">
          
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your institutional credentials to continue
            </p>
          </div>

          {/* Session Expired Alert */}
          {isSessionExpired && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Session expired. Please sign in again.</span>
              </div>
              <button onClick={clearSessionExpired} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <div>
                <strong className="font-semibold block">Unable to sign in</strong>
                <span className="text-[11px] text-red-600/90">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="a.thorne@abc.edu"
                disabled={isSubmitting || isDemoSubmitting}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-[11px] text-[#3B4F7A] hover:text-[#28385A] font-medium transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting || isDemoSubmitting}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B4F7A]/20 focus:border-[#3B4F7A] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isDemoSubmitting}
              className="w-full mt-1 py-2.5 px-4 rounded-xl bg-[#0155eb] hover:bg-[#00399e] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span className="text-sm">Sign In</span>
              )}
            </button>
          </form>

          {/* Dedicated Demo Access Section */}
          <div className="mt-6 pt-5 border-t border-slate-200/80">
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Demo Evaluation Access
                </span>
                <span className="text-[10px] bg-blue-50 text-[#3B4F7A] font-semibold px-2 py-0.5 rounded-full border border-blue-200/60">
                  1-Click Access
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting || isDemoSubmitting}
                className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isDemoSubmitting ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin text-[#3B4F7A]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as Demo Administrator</span>
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
