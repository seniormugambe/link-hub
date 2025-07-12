import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country_code?: string;
  premium: boolean; // Premium flag
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, phone: string, countryCode: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, countryCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Add upsertProfile utility
async function upsertProfile({ id, name, email, phone, country_code }: { id: string, name: string, email: string, phone: string, country_code: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert([{ id, name, email, phone, country_code }], { onConflict: 'id' }); // Fix: 'id' as string
  if (error) throw error;
  return data;
}

// Utility to fetch premium status from profiles table
async function fetchPremiumStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('premium')
    .eq('id', userId)
    .single();
  if (error) return false;
  return data?.premium ?? false;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user from Supabase...');
      const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          // Don't treat "Auth session missing" as an error - it's normal when no user is logged in
          if (error.message === 'Auth session missing!') {
            console.log('No active user session found - this is normal for new visitors');
          } else {
            console.error('Error fetching user:', error);
            setAuthError(error.message);
          }
          setIsLoading(false);
          return;
        }
        
      if (data?.user) {
        const { id, email, phone, user_metadata } = data.user;
        const premium = await fetchPremiumStatus(id);
        setUser({
          id,
          name: user_metadata?.name || '',
          email: email || '',
          phone: phone || '',
          country_code: user_metadata?.country_code || '',
          premium,
        });
      }
      } catch (error) {
        console.error('Error in fetchUser:', error);
        setAuthError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
      setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string, phone: string, countryCode: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) throw error || new Error('No user');
      const { id, email: userEmail, phone: userPhone, user_metadata } = data.user;
      // Upsert profile in the profiles table on login as well
      await upsertProfile({
        id,
        name: user_metadata?.name || '',
        email: userEmail || '',
        phone: userPhone || phone || '',
        country_code: user_metadata?.country_code || countryCode || '',
      });
      const premium = await fetchPremiumStatus(id);
      setUser({
        id,
        name: user_metadata?.name || '',
        email: userEmail || '',
        phone: userPhone || phone || '',
        country_code: user_metadata?.country_code || countryCode || '',
        premium,
      });
      localStorage.setItem('user', JSON.stringify({
        id,
        name: user_metadata?.name || '',
        email: userEmail || '',
        phone: userPhone || phone || '',
        country_code: user_metadata?.country_code || countryCode || '',
        premium,
      }));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, countryCode: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            country_code: countryCode,
            premium: false,
          },
        },
      });
      if (error || !data.user) throw error || new Error('No user');
      const { id, email: userEmail, phone: userPhone, user_metadata } = data.user;
      // Upsert profile in the profiles table
      await upsertProfile({
        id,
        name: user_metadata?.name || name,
        email: userEmail || email,
        phone: userPhone || phone,
        country_code: user_metadata?.country_code || countryCode,
      });
      const premium = await fetchPremiumStatus(id);
      setUser({
        id,
        name: user_metadata?.name || name,
        email: userEmail || email,
        phone: userPhone || phone,
        country_code: user_metadata?.country_code || countryCode,
        premium,
      });
      localStorage.setItem('user', JSON.stringify({
        id,
        name: user_metadata?.name || name,
        email: userEmail || email,
        phone: userPhone || phone,
        country_code: user_metadata?.country_code || countryCode,
        premium,
      }));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 