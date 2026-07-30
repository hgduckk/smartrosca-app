"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/lib/wallet-context";
import { useKycStatus } from "@/lib/use-kyc-status";
import { creditScoreLevel } from "@/lib/credit-score-level";

type Membership = {
  groupId: string;
  groupName: string;
  hasWon: boolean;
  wonRound: number | null;
  rounds: { roundNumber: number }[];
};

type DashboardSummary = {
  creditScore: { score: number };
  memberships: Membership[];
};

const SERVICES = [
  {
    href: "/create",
    label: "Tạo dây hụi",
    icon: (
      <>
        <path d="M8 3.5h6l4 4V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
        <path d="M13.5 3.5V8h4" />
        <path d="M12 12.2v5M9.5 14.7h5" />
      </>
    ),
  },
  {
    href: "/groups",
    label: "Tham gia",
    icon: (
      <>
        <circle cx="9" cy="8.5" r="3" />
        <path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" />
        <path d="M17.5 8.5v5.5M14.7 11.25h5.6" />
      </>
    ),
  },
  {
    href: "/groups",
    label: "Đấu giá",
    icon: (
      <>
        <path d="M3 17.5 9.5 11l4 4L21 7.5" />
        <path d="M15 6.5h6v6" />
      </>
    ),
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <path d="M4 19V10m6 9V5m6 14v-7M3 19h18" />,
  },
  {
    href: "/kyc",
    label: "Xác thực eKYC",
    icon: (
      <>
        <path d="M12 3 4.5 6v5.3c0 4.5 3.1 8.2 7.5 9.7 4.4-1.5 7.5-5.2 7.5-9.7V6L12 3Z" />
        <path d="M9 11.6 11.2 14 15.5 9.2" />
      </>
    ),
  },
  {
    href: "/dashboard#history",
    label: "Lịch sử",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3.2 2" />
      </>
    ),
  },
];

function ServiceIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="service-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function membershipSummary(m: Membership) {
  if (m.hasWon) return `Đã hốt kỳ ${m.wonRound}`;
  if (m.rounds.length === 0) return "Chưa có kỳ đấu giá";
  return `Đang ở kỳ ${m.rounds[m.rounds.length - 1].roundNumber} · ${m.rounds.length} kỳ đã mở`;
}

export default function Home() {
  const { address, connect, isConnecting } = useWallet();
  const { status: kycStatus, loading: kycLoading } = useKycStatus(address);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!address) {
      setSummary(null);
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/dashboard?walletAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        setSummary(null);
      }
    } finally {
      setLoadingSummary(false);
    }
  }, [address]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const level = summary ? creditScoreLevel(summary.creditScore.score) : null;

  const ekycBadge = (() => {
    if (!address) return null;
    if (kycLoading) return { label: "Đang kiểm tra...", color: "rgba(255,255,255,0.7)" };
    if (kycStatus === "VERIFIED") return { label: "eKYC đã xác thực", color: "var(--color-success)" };
    if (kycStatus === "REJECTED") return { label: "eKYC bị từ chối", color: "var(--color-danger)" };
    return { label: "eKYC chưa xác thực", color: "var(--color-warning)" };
  })();

  return (
    <main className="page">
      {address ? (
        <div className="hero">
          <p className="hero-label">Credit Score</p>
          <p className="hero-score">{summary ? summary.creditScore.score : loadingSummary ? "…" : "—"}</p>
          <div className="hero-row">
            {level && (
              <span className="hero-badge">
                <span className="hero-badge-dot" style={{ background: `var(--color-${level.variant})` }} />
                {level.label}
              </span>
            )}
            {ekycBadge && (
              <span className="hero-badge">
                <span className="hero-badge-dot" style={{ background: ekycBadge.color }} />
                {ekycBadge.label}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="hero">
          <div className="hero-connect">
            <div>
              <p className="hero-label">SmartROSCA</p>
              <p style={{ margin: "0.3rem 0 0", fontSize: "1.05rem", fontWeight: 600 }}>
                Kết nối ví để xem điểm tín nhiệm &amp; dây hụi của bạn
              </p>
            </div>
            <button
              className="btn"
              style={{ background: "#ffffff", color: "var(--color-primary)", alignSelf: "flex-start" }}
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? "Đang kết nối..." : "Kết nối ví"}
            </button>
          </div>
        </div>
      )}

      <p className="section-title" style={{ marginTop: "1.5rem" }}>
        Dịch vụ
      </p>
      <div className="service-grid">
        {SERVICES.map((s) => (
          <Link key={s.label} href={s.href} className="service-item">
            <span className="service-icon-circle">
              <ServiceIcon>{s.icon}</ServiceIcon>
            </span>
            <span className="service-label">{s.label}</span>
          </Link>
        ))}
      </div>

      {address && (
        <>
          <p className="section-title">Dây hụi của tôi</p>
          {loadingSummary && !summary && <p className="muted">Đang tải...</p>}
          {summary && summary.memberships.length === 0 && (
            <p className="empty-state">Bạn chưa tham gia dây hụi nào.</p>
          )}
          {summary?.memberships.map((m) => (
            <Link key={m.groupId} href={`/groups/${m.groupId}/bid`} className="group-card">
              <span className="group-card-avatar">{m.groupName.charAt(0).toUpperCase()}</span>
              <span className="group-card-body">
                <p className="group-card-title">{m.groupName}</p>
                <p className="group-card-meta">{membershipSummary(m)}</p>
              </span>
              <svg
                className="group-card-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          ))}
        </>
      )}
    </main>
  );
}
