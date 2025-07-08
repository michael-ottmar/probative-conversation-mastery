'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { createContext, useContext } from "react";

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  return (
    <AuthContext.Provider value={{
      user: session?.user || null,
      loading: status === "loading",
      signIn: () => signIn('google'),
      signOut: () => signOut({ callbackUrl: '/' }),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};