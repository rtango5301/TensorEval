'use client';

import { createContext, useContext, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

interface UserContextValue {
  user: AuthUser;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  user: AuthUser;
  children: ReactNode;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useUser(): AuthUser {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context.user;
}
