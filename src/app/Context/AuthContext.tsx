'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  userid: number;
  name: string;
  email: string;
  role: string;
  createdat: string;
  linkedin_profile: string;
  instagram_profile: string;
  phone_number: string;
  country: string;
  company_email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user data in localStorage on component mount
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            // Validate that the user object has the required properties
            if (parsedUser && parsedUser.userid && parsedUser.name && parsedUser.email) {
              setUser(parsedUser);
            } else {
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        checkAuth();
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const login = (userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a safer hook that doesn't throw error when used outside provider
export function useAuth() {
  const context = useContext(AuthContext);
  
  // Instead of throwing error, return a default context
  if (context === undefined) {
    return {
      user: null,
      isLoading: false,
      login: () => console.warn('AuthProvider not found'),
      logout: () => console.warn('AuthProvider not found')
    };
  }
  
  return context;
}