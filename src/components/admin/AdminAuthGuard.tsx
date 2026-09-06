/**
 * Admin Authentication Guard & Sign-in Gateway.
 * 
 * Protects private /admin routes using real Supabase Auth.
 * Unauthenticated visitors cannot access admin CMS tools or data.
 */

import React, { useState } from 'react';
import { useAdminAuth, AUTHORIZED_ADMIN_EMAIL } from '../../cms/AuthContext';
import { Lock, Mail, KeyRound, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, user, loading, signInWithPassword, signInWithOtp } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // When backend is explicitly set to local development store, allow direct access
  const isLocalBackend = (import.meta as any).env?.VITE_CMS_BACKEND === 'local';

  if (isLocalBackend) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs font-mono">Verifying Supabase administrative session...</p>
        </div>
      </div>
    );
  }

  // Authenticated and verified admin
  if (isAuthenticated && isAdmin) {
    return <>{children}</>;
  }

  // Authenticated but wrong user email
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/50 rounded-2xl p-6 shadow-2xl text-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">403 Forbidden: Unauthorized Account</h2>
          <p className="text-xs text-slate-400">
            You are authenticated as <span className="font-mono text-amber-300">{user?.email}</span>. Only the designated administrator (<span className="font-mono text-slate-300">{AUTHORIZED_ADMIN_EMAIL}</span>) has access to this CMS.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Switch Account / Sign In Again
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated Login Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);

    if (useOtp) {
      const { error } = await signInWithOtp(email);
      setSubmitting(false);
      if (error) {
        setAuthError(error.message);
      } else {
        setOtpSent(true);
      }
    } else {
      const { error } = await signInWithPassword(email, password);
      setSubmitting(false);
      if (error) {
        setAuthError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Private Portfolio CMS</h2>
          <p className="text-xs text-slate-400">Authenticated Supabase Admin Access Required</p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {authError}
          </div>
        )}

        {otpSent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
            <p className="font-medium">Magic link sent!</p>
            <p className="text-[11px] text-slate-400">Check <span className="font-mono text-emerald-200">{email}</span> to sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-slate-400">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={AUTHORIZED_ADMIN_EMAIL}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            {!useOtp && (
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-slate-400">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{useOtp ? 'Send Magic Link / OTP' : 'Authenticate via Supabase'}</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setUseOtp(!useOtp);
                  setAuthError(null);
                }}
                className="text-[11px] text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors"
              >
                {useOtp ? 'Use Password Sign-in' : 'Sign in with Magic Link / OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
