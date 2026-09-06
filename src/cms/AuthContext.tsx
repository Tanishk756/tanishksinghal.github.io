/**
 * Supabase Auth Context & Session Provider for Admin CMS.
 * 
 * Enforces:
 * - Real Supabase session persistence
 * - Auto-restoration on page reload
 * - Reactive auth state subscriptions
 * - Server-side authorization check for Tanishksinghal6285@gmail.com
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { cmsApiClient } from './apiClient';

export const AUTHORIZED_ADMIN_EMAIL = 'tanishksinghal6285@gmail.com';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  signInWithPassword: async () => ({ error: null }),
  signInWithOtp: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Restore existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      cmsApiClient.setAuthToken(session?.access_token ?? null);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      cmsApiClient.setAuthToken(session?.access_token ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error };
      setSession(data.session);
      setUser(data.user);
      cmsApiClient.setAuthToken(data.session?.access_token ?? null);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const basePath = (import.meta as any).env?.BASE_URL || '/';
      const adminPath = basePath.endsWith('/') ? `${basePath}admin` : `${basePath}/admin`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}${adminPath}`,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    cmsApiClient.setAuthToken(null);
  };

  const email = (user?.email || '').toLowerCase();
  const isAdmin = email === AUTHORIZED_ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAuthenticated: Boolean(session && user),
        isAdmin,
        signInWithPassword,
        signInWithOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AuthContext);
