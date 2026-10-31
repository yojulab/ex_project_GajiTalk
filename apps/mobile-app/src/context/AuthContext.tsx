import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export type UserRole = 'member' | 'admin' | '조경사' | '관리 매니저';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRole[]; // array로 관리
  profileImage?: string;
  landscaperProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: { email: string; password?: string; name: string; roles: UserRole[]; phone?: string }) => Promise<boolean>;
  logout: () => void;
  switchUser: (targetUser: User) => void;
  hasRole: (role: UserRole) => boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoggedIn: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  switchUser: () => {},
  hasRole: () => false,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('soohyung_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // 초기 로딩 시 저장된 세션 복원 또는 기본 사용자 조회
    const savedUser = localStorage.getItem('soohyung_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('soohyung_user');
      }
    } else {
      // 기본 정원주 데모 로그인
      api.getDemoUsers().then(res => {
        if (res.success && res.users.length > 0) {
          const defaultMember = res.users.find((u: any) => u.roles?.includes('member') && !u.roles?.includes('admin')) || res.users[0];
          const formatted = {
            id: defaultMember._id,
            _id: defaultMember._id,
            name: defaultMember.name,
            email: defaultMember.email,
            phone: defaultMember.phone,
            roles: defaultMember.roles || ['member'],
            profileImage: defaultMember.profileImage,
            landscaperProfile: defaultMember.landscaperProfile
          };
          setUser(formatted);
          localStorage.setItem('soohyung_user', JSON.stringify(formatted));
        }
      }).catch(console.error);
    }
  }, []);

  const login = async (email: string, password = 'admin123'): Promise<boolean> => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.user) {
        const userData: User = {
          id: res.user.id || res.user._id,
          _id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          roles: res.user.roles || ['member'],
          profileImage: res.user.profileImage,
          landscaperProfile: res.user.landscaperProfile
        };
        setUser(userData);
        setToken(res.token);
        localStorage.setItem('soohyung_token', res.token);
        localStorage.setItem('soohyung_user', JSON.stringify(userData));
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const register = async (data: { email: string; password?: string; name: string; roles: UserRole[]; phone?: string }): Promise<boolean> => {
    try {
      const res = await api.register(data);
      if (res.success && res.user) {
        const userData: User = {
          id: res.user.id || res.user._id,
          _id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          roles: res.user.roles || ['member'],
          profileImage: res.user.profileImage,
          landscaperProfile: res.user.landscaperProfile
        };
        setUser(userData);
        setToken(res.token);
        localStorage.setItem('soohyung_token', res.token);
        localStorage.setItem('soohyung_user', JSON.stringify(userData));
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Register error:', e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('soohyung_token');
    localStorage.removeItem('soohyung_user');
  };

  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    localStorage.setItem('soohyung_user', JSON.stringify(targetUser));
    setIsAuthModalOpen(false);
  };

  const hasRole = (role: UserRole) => {
    return !!(user && user.roles && user.roles.includes(role));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      switchUser,
      hasRole,
      isAuthModalOpen,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

