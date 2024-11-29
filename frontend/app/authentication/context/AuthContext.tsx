// app/authentication/context/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../../utils/apiClient';
import { User } from '../../../types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/users/me');
        console.log("Данные пользователя получены:", response.data);
        if (isMounted) {
          setUser(response.data);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.warn("Неавторизованный пользователь. Попытка обновить токен.");
          try {
            await apiClient.post('/auth/refresh');
            const retryResponse = await apiClient.get('/users/me');
            console.log("Успешно обновлён токен. Данные пользователя:", retryResponse.data);
            if (isMounted) {
              setUser(retryResponse.data);
            }
          } catch (refreshError) {
            console.error("Ошибка при обновлении токена.");
            // Проверяем, не находимся ли мы уже на странице логина
            if (typeof window !== 'undefined' && window.location.pathname !== '/authentication/login') {
              console.log("Перенаправляем на страницу логина.");
              router.push('/authentication/login');
            } else {
              console.log("Уже на странице логина, не перенаправляем.");
            }
          }
        } else {
          console.error("Ошибка при получении данных пользователя:", error.response?.data || error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!user && loading) {
      fetchUser();
    }

    return () => {
      isMounted = false;
    };
  }, [user, loading, router]);

  // Объявляем функции login и logout
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user } = response.data;
      console.log("Успешный вход, данные пользователя получены:", user);
      setUser(user);
    } catch (error: any) {
      console.error("Ошибка при входе в систему:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
    } catch (error: any) {
      console.error("Ошибка при выходе из системы:", error.response?.data || error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};


