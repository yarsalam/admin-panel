"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  setToken: () => {},
  logout: () => {},
  isLoading: true,
});

// تابع پیدا کردن اولین مسیر مجاز (دقیقاً کپی از login)
function getFirstAllowedPath(permissions: string[]): string {
  const { panels } = require("@/data/panels"); // یا import کنید
  for (const panel of panels) {
    if (permissions.includes(panel.permission)) {
      for (const item of panel.items) {
        if (
          Array.isArray(item.permission)
            ? item.permission.some(p => permissions.includes(p))
            : permissions.includes(item.permission)
        ) {
          return item.href;
        }
      }
    }
  }
  return "/unauthorized";
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const prevToken = useRef(token);

  // ۱. بارگذاری اولیه از localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin-token");
    if (stored) {
      try {
        const decoded: any = jwtDecode(stored);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || [],
        });
        setTokenState(stored);
      } catch {
        localStorage.removeItem("admin-token");
      }
    }
    setIsLoading(false);
  }, []);

  // ۲. ریدایرکت پس از لاگین موفق
  useEffect(() => {
    // وقتی توکن از null به یک رشته تغییر کرد و ما در صفحهٔ لاگین هستیم
    if (token && !prevToken.current && pathname === "/login") {
      const decoded: any = jwtDecode(token);
      const redirectTo = getFirstAllowedPath(decoded.permissions || []);
      router.replace(redirectTo);
    }
    prevToken.current = token;
  }, [token, pathname, router]);

  const setToken = (newToken: string) => {
    localStorage.setItem("admin-token", newToken);
    setTokenState(newToken);
    const decoded: any = jwtDecode(newToken);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    });
  };

  const logout = () => {
    localStorage.removeItem("admin-token");
    setTokenState(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);