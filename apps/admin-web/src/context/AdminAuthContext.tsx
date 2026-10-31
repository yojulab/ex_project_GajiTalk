import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

export type UserRole = 'member' | 'admin' | '조경사' | '관리 매니저';

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRole[]; // array로 관리
  profileImage?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: { email: string; password?: string; name: string; roles: UserRole[]; phone?: string }) => Promise<boolean>;
  logout: () => void;
  switchUser: (targetUser: AdminUser) => void;
  hasRole: (role: UserRole) => boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
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

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('soohyung_admin_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('soohyung_admin_user');
    if (saved) {
      try {
        setAdminUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('soohyung_admin_user');
      }
    } else {
      // 기본 총괄 관리자 계정 초기화
      adminApi.getDemoUsers().then(res => {
        if (res.success && res.users.length > 0) {
          const admin = res.users.find((u: any) => u.roles?.includes('admin')) || res.users[0];
          const formatted = {
            id: admin._id,
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            roles: admin.roles || ['admin', '관리 매니저'],
            profileImage: admin.profileImage
          };
          setAdminUser(formatted);
          localStorage.setItem('soohyung_admin_user', JSON.stringify(formatted));
        }
      }).catch(console.error);
    }
  }, []);

  const login = async (email: string, password = 'admin123'): Promise<boolean> => {
    try {
      const res = await adminApi.login({ email, password });
      if (res.success && res.user) {
        const userData: AdminUser = {
          id: res.user.id || res.user._id,
          _id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          roles: res.user.roles || ['admin'],
          profileImage: res.user.profileImage
        };
        setAdminUser(userData);
        setToken(res.token);
        localStorage.setItem('soohyung_admin_token', res.token);
        localStorage.setItem('soohyung_admin_user', JSON.stringify(userData));
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin login error:', e);
      return false;
    }
  };

  const register = async (data: { email: string; password?: string; name: string; roles: UserRole[]; phone?: string }): Promise<boolean> => {
    try {
      const res = await adminApi.register(data);
      if (res.success && res.user) {
        const userData: AdminUser = {
          id: res.user.id || res.user._id,
          _id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          roles: res.user.roles || ['admin'],
          profileImage: res.user.profileImage
        };
        setAdminUser(userData);
        setToken(res.token);
        localStorage.setItem('soohyung_admin_token', res.token);
        localStorage.setItem('soohyung_admin_user', JSON.stringify(userData));
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin register error:', e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (e) {}
    setAdminUser(null);
    setToken(null);
    localStorage.removeItem('soohyung_admin_token');
    localStorage.removeItem('soohyung_admin_user');
  };

  const switchUser = (targetUser: AdminUser) => {
    setAdminUser(targetUser);
    localStorage.setItem('soohyung_admin_user', JSON.stringify(targetUser));
    setIsAuthModalOpen(false);
  };

  const hasRole = (role: UserRole) => {
    return !!(adminUser && adminUser.roles && adminUser.roles.includes(role));
  };

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      token,
      isLoggedIn: !!adminUser,
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
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

