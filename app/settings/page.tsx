"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SubPage } from "@/components/SubPage";
import { useToast } from "@/components/ToastProvider";

type Theme = "light" | "dark";

// Công tắc bật/tắt tái dùng.
function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`sub-switch${on ? " is-on" : ""}`}
      onClick={onToggle}
    />
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

// Đọc/ghi cờ boolean trong localStorage cho các tuỳ chọn cài đặt (mock).
function useFlag(key: string, initial: boolean) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setVal(raw === "1");
    } catch {
      /* bỏ qua */
    }
  }, [key]);
  const toggle = () => {
    setVal((v) => {
      const next = !v;
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        /* bỏ qua */
      }
      return next;
    });
  };
  return [val, toggle] as const;
}

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();

  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    const stored = typeof localStorage !== "undefined" ? (localStorage.getItem("theme") as Theme | null) : null;
    if (stored === "light" || stored === "dark") setTheme(stored);
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);
  const isDark = theme === "dark";
  const toggleTheme = () => {
    const next: Theme = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* bỏ qua */
    }
  };

  const [pushNoti, togglePush] = useFlag("set-push", true);
  const [huiNoti, toggleHui] = useFlag("set-hui-noti", true);
  const [biometric, toggleBio] = useFlag("set-biometric", false);

  return (
    <SubPage title="Cài đặt" back="/profile">
      <div>
        <p className="sub-group-label">Giao diện</p>
        <div className="sub-group">
          <div className="sub-item">
            <span className="sub-item-icon">
              <Icon><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Chế độ tối</p>
              <p className="sub-item-sub">{isDark ? "Đang bật" : "Đang tắt"}</p>
            </div>
            <Switch on={isDark} onToggle={toggleTheme} label="Chế độ tối" />
          </div>
        </div>
      </div>

      <div>
        <p className="sub-group-label">Thông báo</p>
        <div className="sub-group">
          <div className="sub-item">
            <span className="sub-item-icon">
              <Icon><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Thông báo đẩy</p>
              <p className="sub-item-sub">Nhận nhắc nhở qua thiết bị</p>
            </div>
            <Switch on={pushNoti} onToggle={togglePush} label="Thông báo đẩy" />
          </div>
          <div className="sub-item">
            <span className="sub-item-icon">
              <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Nhắc hạn đóng hụi</p>
              <p className="sub-item-sub">Cảnh báo trước khi tới hạn góp</p>
            </div>
            <Switch on={huiNoti} onToggle={toggleHui} label="Nhắc hạn đóng hụi" />
          </div>
        </div>
      </div>

      <div>
        <p className="sub-group-label">Bảo mật</p>
        <div className="sub-group">
          <div className="sub-item">
            <span className="sub-item-icon">
              <Icon><path d="M12 2s7 3 7 9c0 5-3 8-7 11-4-3-7-6-7-11 0-6 7-9 7-9Z" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Đăng nhập sinh trắc học</p>
              <p className="sub-item-sub">Vân tay / khuôn mặt</p>
            </div>
            <Switch on={biometric} onToggle={toggleBio} label="Đăng nhập sinh trắc học" />
          </div>
          <button className="sub-item" onClick={() => router.push("/forgot-password")}>
            <span className="sub-item-icon">
              <Icon><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Đổi mật khẩu</p>
            </div>
            <Icon><path d="m9 6 6 6-6 6" /></Icon>
          </button>
          <button className="sub-item" onClick={() => router.push("/devices")}>
            <span className="sub-item-icon">
              <Icon><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Thiết bị đăng nhập</p>
            </div>
            <Icon><path d="m9 6 6 6-6 6" /></Icon>
          </button>
        </div>
      </div>

      <div>
        <p className="sub-group-label">Khác</p>
        <div className="sub-group">
          <div className="sub-item">
            <span className="sub-item-icon">
              <Icon><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /><circle cx="12" cy="12" r="10" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Ngôn ngữ</p>
            </div>
            <span className="sub-item-value">Tiếng Việt</span>
          </div>
          <button className="sub-item" onClick={() => toast("SmartROSCA v1.0 — bản demo Attacker 2026", "info")}>
            <span className="sub-item-icon">
              <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Giới thiệu</p>
            </div>
            <span className="sub-item-value">v1.0</span>
          </button>
        </div>
      </div>
    </SubPage>
  );
}
