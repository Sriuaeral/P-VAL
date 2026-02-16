import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, LoginResponse } from '@shared/interface';
import { ApiService } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (storedToken && storedUser && isAuthenticated === 'true') {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          const isValid = await verifyToken(storedToken);
          if (!isValid) {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token every 50 minutes (tokens expire in 1 hour)
  useEffect(() => {
    if (token) {
      const interval = setInterval(async () => {
        const success = await refreshToken();
        if (!success) {
          logout();
        }
      }, 50 * 60 * 1000); // 50 minutes

      return () => clearInterval(interval);
    }
  }, [token]);

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      // For static validation, we'll just check if token exists and is not expired
      if (!tokenToVerify) return false;
      
      // Simple token validation - decode base64 JSON token
      const tokenData = JSON.parse(atob(tokenToVerify));
      const now = Date.now() / 1000;
      
      // Check if token is expired
      if (tokenData.exp && tokenData.exp < now) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Static validation - check credentials
      if (credentials.username === 'admin' && credentials.password === 'admin!23$') {
        // Create a simple token (in production, use proper JWT)
        const tokenData = {
          userId: '1',
          email: 'admin@ral.com',
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
        };
        
        // Create a simple base64 token (not secure, just for demo)
        const token = btoa(JSON.stringify(tokenData));
        
        const user: User = {
          id: '1',
          name: 'Asset Manager',
          email: 'admin@ral.com',
          role: 'admin'
        };
        
        setToken(token);
        setUser(user);
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token) return false;
      
      // For static validation, create a new token
      const tokenData = {
        userId: '1',
        email: 'admin@ral.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
      };
      
      const newToken = btoa(JSON.stringify(tokenData));
      const user: User = {
        id: '1',
        name: 'Asset Manager',
        email: 'admin@ral.com',
        role: 'admin'
      };
      
      setToken(newToken);
      setUser(user);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
