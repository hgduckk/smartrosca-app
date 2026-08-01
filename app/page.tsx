import Link from "next/link";

// Trang chủ (Màn hình chính) — dựng theo mẫu Figma. Dữ liệu hiện là mẫu tĩnh;
// sẽ nối API (dashboard, hụi, ví) ở giai đoạn "chức năng thật".
const QUICK_ACTIONS = [
  {
    href: "/create",
    label: "Tạo hụi",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    href: "/groups",
    label: "Dây hụi",
    icon: (
      <>
        <circle cx="9" cy="8.5" r="3" />
        <path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" />
        <path d="M17 8.5a2.6 2.6 0 0 1 0 5M18.5 6a5 5 0 0 1 0 10" />
      </>
    ),
  },
  {
    href: "/dashboard",
    label: "Ví",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M16.5 14.5h.01" />
      </>
    ),
  },
  {
    href: "/dashboard",
    label: "Nhận tiền",
    icon: (
      <>
        <path d="M12 3v10m0 0 3.5-3.5M12 13 8.5 9.5" />
        <path d="M4 15c0 3 3.6 5 8 5s8-2 8-5" />
      </>
    ),
  },
];

const MY_HUI = [
  { name: "Hụi XXX", due: "05/02", amount: "500.000 đ" },
  { name: "Hụi YYY", due: "12/02", amount: "1.000.000 đ" },
];

function ActionIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="home-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="home">
      {/* Header lời chào */}
      <header className="home-header">
        <div className="home-greet">
          <span className="home-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8.5" r="3.6" />
              <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
            </svg>
          </span>
          <div className="home-greet-text">
            <p className="home-greet-hi">
              Xin chào, <b>Nguyễn Văn A</b>
            </p>
            <p className="home-greet-sub">Chào mừng trở lại</p>
          </div>
        </div>
        <div className="home-header-actions">
          <button className="home-icon-btn" aria-label="Thông báo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </button>
          <button className="home-icon-btn" aria-label="Cài đặt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14v-.1a2 2 0 0 1 0-3.8h.2A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6h.1A1.6 1.6 0 0 0 11 2.6v-.2a2 2 0 0 1 4 0v.2A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21.4 10v.1a1.6 1.6 0 0 0 0 3.8Z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2 thẻ thống kê */}
      <div className="home-stats">
        <Link href="/groups" className="home-stat home-stat--soft">
          <span className="home-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8.5" r="3" />
              <path d="M2.5 19c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5" />
              <path d="M17 8.5a2.6 2.6 0 0 1 0 5" />
            </svg>
          </span>
          <span className="home-stat-label">Số dây hụi đang tham gia</span>
          <span className="home-stat-value">
            5 <Chevron />
          </span>
        </Link>

        <Link href="/dashboard" className="home-stat home-stat--brand">
          <span className="home-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2.5" />
              <path d="M3 10h18M16.5 14.5h.01" />
            </svg>
          </span>
          <span className="home-stat-label">Tổng tài sản</span>
          <span className="home-stat-value">
            12.500.000 <Chevron />
          </span>
          <span className="home-stat-delta">+500.000 đ tháng này</span>
        </Link>
      </div>

      {/* Hoạt động nhanh */}
      <h2 className="home-section-title">Hoạt động nhanh</h2>
      <div className="home-actions">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.label} href={a.href} className="home-action">
            <span className="home-action-tile">
              <ActionIcon>{a.icon}</ActionIcon>
            </span>
            <span className="home-action-label">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Cần đóng hôm nay */}
      <h2 className="home-section-title">Cần đóng hôm nay</h2>
      <div className="home-due">
        <div className="home-due-info">
          <p className="home-due-name">Đóng hụi XXX</p>
          <p className="home-due-amount">500.000 đ</p>
        </div>
        <div className="home-due-right">
          <span className="home-due-timer">00 : 00 : 00</span>
          <button className="home-due-btn">Đóng ngay</button>
        </div>
      </div>

      {/* Hụi của bạn */}
      <h2 className="home-section-title">Hụi của bạn</h2>
      <div className="home-hui-list">
        {MY_HUI.map((h) => (
          <div key={h.name} className="home-hui">
            <div className="home-hui-info">
              <p className="home-hui-name">{h.name}</p>
              <p className="home-hui-due">Kỳ hạn : {h.due}</p>
              <p className="home-hui-amount">{h.amount}</p>
            </div>
            <Link href="/groups" className="home-hui-btn">
              Chi tiết
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
