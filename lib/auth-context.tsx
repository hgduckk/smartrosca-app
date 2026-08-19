"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Phiên đăng nhập GIẢ LẬP cho bản test giao diện — lưu trong localStorage, không
// gọi backend. Giai đoạn thật sẽ thay bằng Supabase Auth / auth thật (chỉ cần đổi
// phần thân các hàm login/register/logout, giữ nguyên API của context).

export type MockUser = {
  name: string;
  account: string; // SĐT / CCCD đã nhập
  email?: string;
  phone?: string;
};

type AuthContextValue = {
  user: MockUser | null;
  ready: boolean; // đã đọc xong localStorage (tránh nháy/redirect sai lúc mcount)
  login: (account: string, name?: string) => void;
  register: (data: { name: string; account: string }) => void;
  updateUser: (patch: Partial<MockUser>) => void;
  logout: () => void;
};

const STORAGE_KEY = "rosca-mock-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // localStorage không khả dụng — coi như chưa đăng nhập.
    }
    setReady(true);
  }, []);

  const persist = useCallback((u: MockUser | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const login = useCallback(
    (account: string, name?: string) => {
      persist({ account, name: name?.trim() || "Nguyễn Văn A" });
    },
    [persist],
  );

  const register = useCallback(
    (data: { name: string; account: string }) => {
      persist({ account: data.account, name: data.name.trim() || "Người dùng mới" });
    },
    [persist],
  );

  // Cập nhật hồ sơ (mock): gộp patch vào user hiện tại và lưu lại localStorage.
  // Giai đoạn thật thay thân hàm bằng lời gọi API cập nhật hồ sơ, giữ nguyên chữ ký.
  const updateUser = useCallback(
    (patch: Partial<MockUser>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* bỏ qua */
        }
        return next;
      });
    },
    [],
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
