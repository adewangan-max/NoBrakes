'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      // Check for hardcoded admin session first
      if (typeof window !== 'undefined' && localStorage.getItem('admin_login')) {
        setUser({ id: 'admin-id', email: 'admin', user_metadata: { username: 'admin' } });
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window !== 'undefined' && localStorage.getItem('admin_login')) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    if (email === 'admin' && password === 'admin') {
      if (typeof window !== 'undefined') localStorage.setItem('admin_login', 'true');
      setUser({ id: 'admin-id', email: 'admin', user_metadata: { username: 'admin' } });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    }
    setLoading(false);
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (email === 'admin' && password === 'admin') {
      if (typeof window !== 'undefined') localStorage.setItem('admin_login', 'true');
      setUser({ id: 'admin-id', email: 'admin', user_metadata: { username: 'admin' } });
      setLoading(false);
      return true;
    }

    try {
      // Check if email exists
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      if (existing) {
        setError('Email already exists');
        setLoading(false);
        return false;
      }
      if (checkError && checkError.code !== 'PGRST116') { // not 'No rows'
        setError(checkError.message);
        setLoading(false);
        return false;
      }
      // Register with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return false;
      }
      // Insert into users table
      const userId = signUpData.user?.id;
      if (userId) {
        const { error: insertError } = await supabase.from('users').insert({ id: userId, email, username, password });
        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return false;
        }
      }
      setLoading(false);
      return true;
    } catch (err) {
      setError('An unexpected error occurred during registration');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    if (typeof window !== 'undefined') localStorage.removeItem('admin_login');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
      setUser(null);
    } catch (err) {
      setError('An unexpected error occurred during logout');
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 