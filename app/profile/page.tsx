"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@/lib/wallet-context";

function truncate(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function Chevron() {
  return (
    <svg className="pf-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { address } = useWallet();

  const accountLabel = user?.account ? user.account : address ? truncate(address) : "—";

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // Mỗi mục: icon + nhãn + hành động điều hướng tới trang tương ứng.
  const items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] = [
    {
      label: "Thông tin cá nhân",
      icon: (<Icon><circle cx="12" cy="8.2" r="3.2" /><path d="M5 20c0-3.5 3.1-6.2 7-6.2s7 2.7 7 6.2" /></Icon>),
      onClick: () => router.push("/profile/info"),
    },
    {
      label: "Trust Score",
      icon: (<Icon><path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>),
      onClick: () => router.push("/trust-score"),
    },
    {
      label: "Tài khoản liên kết",
      icon: (<Icon><path d="M3 10.5 12 4l9 6.5" /><path d="M5 10.5V19M9.5 10.5V19M14.5 10.5V19M19 10.5V19M3.5 19h17" /></Icon>),
      onClick: () => router.push("/accounts"),
    },
    {
      label: "Nguồn thanh toán",
      icon: (<Icon><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" /></Icon>),
      onClick: () => router.push("/accounts/link"),
    },
    {
      label: "Đổi mật khẩu",
      icon: (<Icon><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>),
      onClick: () => router.push("/forgot-password"),
    },
    {
      label: "Thiết bị đăng nhập",
      icon: (<Icon><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Icon>),
      onClick: () => router.push("/devices"),
    },
    {
      label: "Cài đặt",
      icon: (<Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14v-.1a2 2 0 0 1 0-3.8h.2A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6h.1A1.6 1.6 0 0 0 11 2.6v-.2a2 2 0 0 1 4 0v.2A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21.4 10v.1a1.6 1.6 0 0 0 0 3.8Z" /></Icon>),
      onClick: () => router.push("/settings"),
    },
    {
      label: "Trung tâm trợ giúp",
      icon: (<Icon><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.6-2 1.9-2 3.5M12 17.5h.01" /></Icon>),
      onClick: () => router.push("/help"),
    },
  ];

  return (
    <main className="pf">
      <header className="pf-header">
        <h1 className="pf-title">Hồ sơ</h1>
        <div className="pf-header-actions">
          <button className="pf-icon-btn" aria-label="Thông báo" onClick={() => router.push("/notifications")}>
            <Icon><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>
          </button>
          <button className="pf-icon-btn" aria-label="Cài đặt" onClick={() => router.push("/settings")}>
            <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14v-.1a2 2 0 0 1 0-3.8h.2A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6h.1A1.6 1.6 0 0 0 11 2.6v-.2a2 2 0 0 1 4 0v.2A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21.4 10v.1a1.6 1.6 0 0 0 0 3.8Z" /></Icon>
          </button>
        </div>
      </header>

      {/* Thẻ hồ sơ → Trust Score */}
      <button type="button" className="pf-card" onClick={() => router.push("/trust-score")}>
        <span className="pf-avatar">
          <Icon><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></Icon>
        </span>
        <div className="pf-card-body">
          <p className="pf-card-name">{user?.name ?? "Người dùng"}</p>
          <span className="pf-badge">Thành viên</span>
          <p className="pf-card-sub">{accountLabel}</p>
        </div>
        <Chevron />
      </button>

      <div className="pf-menu">
        {items.map((it) => (
          <button key={it.label} type="button" className="pf-row" onClick={it.onClick}>
            <span className="pf-row-icon">{it.icon}</span>
            <span className="pf-row-label">{it.label}</span>
            <Chevron />
          </button>
        ))}

        <button type="button" className="pf-row pf-row--danger" onClick={handleLogout}>
          <span className="pf-row-icon">
            <Icon><path d="M15 12H4M8 8l-4 4 4 4" /><path d="M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9" /></Icon>
          </span>
          <span className="pf-row-label">Đăng xuất</span>
        </button>
      </div>
    </main>
  );
}
