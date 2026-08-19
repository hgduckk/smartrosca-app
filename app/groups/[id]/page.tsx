"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HuiDetailHeader } from "@/components/hui/HuiDetailHeader";
import { useToast } from "@/components/ToastProvider";
import {
  mockAuctionHistory,
  mockHuiMembers,
  mockHuiOverview,
  mockHuiPayments,
} from "@/lib/hui-mock";

type TabKey = "overview" | "members" | "payments" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Tổng quan" },
  { key: "members", label: "Thành viên" },
  { key: "payments", label: "Thanh toán" },
  { key: "history", label: "Lịch sử" },
];

// ---- Icon nhỏ cho các ô thống kê ----
function StatIcon({ name }: { name: "wallet" | "calendar" | "coins" | "calendar-check" }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg {...common} aria-hidden="true">
      {name === "wallet" && (<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M16.5 14.5h.01" /></>)}
      {name === "calendar" && (<><rect x="4" y="5" width="16" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16" /></>)}
      {name === "coins" && (<><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7" /><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></>)}
      {name === "calendar-check" && (<><rect x="4" y="5" width="16" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16M9 15.5l2 2 4-4" /></>)}
    </svg>
  );
}

function OverviewTab({ id, router }: { id: string; router: ReturnType<typeof useRouter> }) {
  const o = useMemo(() => mockHuiOverview(id), [id]);
  const cells: { icon: "wallet" | "calendar" | "coins" | "calendar-check"; label: string; value: string }[] = [
    { icon: "wallet", label: "Kỳ góp", value: "500.000" },
    { icon: "calendar", label: "Kỳ hiện tại", value: `${String(o.currentRound).padStart(2, "0")} / ${o.totalRounds}` },
    { icon: "coins", label: "Tổng giá trị hụi", value: o.totalValueLabel },
    { icon: "coins", label: "Số tiền còn lại", value: o.remainingLabel },
    { icon: "coins", label: "Tổng hụi hiện tại", value: o.currentPotLabel },
    { icon: "calendar", label: "Ngày bắt đầu", value: o.startDate },
    { icon: "calendar-check", label: "Ngày góp tiếp theo", value: o.nextContribDate },
    { icon: "calendar-check", label: "Ngày kết thúc", value: o.endDate },
  ];

  return (
    <>
      <div className="hd-progress">
        <div className="hd-progress-head">
          <h2 className="hd-progress-title">Tiến độ Hụi</h2>
          <span className="hd-progress-round">Kỳ {String(o.progressRound).padStart(2, "0")} / {o.totalRounds}</span>
        </div>
        <div className="hd-progress-row">
          <div className="hd-progress-track">
            <div className="hd-progress-fill" style={{ width: `${o.progressPercent}%` }} />
          </div>
          <span className="hd-progress-pct">{o.progressPercent}%</span>
        </div>
        <p className="hd-progress-note">Đã đóng {o.paidLabel} / {o.targetLabel}</p>
      </div>

      <div className="hd-grid">
        {cells.map((c, i) => (
          <div key={i} className="hd-stat">
            <span className="hd-stat-icon"><StatIcon name={c.icon} /></span>
            <div className="hd-stat-text">
              <span className="hd-stat-label">{c.label}</span>
              <span className="hd-stat-value">{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hd-footer">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push(`/groups/${id}?tab=payments`)}>
          Đóng tiền
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.push(`/groups/${id}/bid`)}>
          Xem đấu giá
        </button>
      </div>

      <button
        type="button"
        className="hd-explorer-link"
        onClick={() =>
          router.push(`/explorer?address=${id === "grp-yyy" ? "0xAbc0000000000000000000000000000000000002" : "0xAbc0000000000000000000000000000000000001"}`)
        }
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        Xem sổ cái minh bạch on-chain
        <span aria-hidden="true">↗</span>
      </button>
    </>
  );
}

function MembersTab() {
  const members = useMemo(() => mockHuiMembers(), []);
  return (
    <div className="hd-list">
      {members.map((m) => (
        <div key={m.id} className="hd-member">
          <span className="hd-member-avatar" style={{ background: `hsl(${(m.name.charCodeAt(0) * 7) % 360} 55% 88%)`, color: `hsl(${(m.name.charCodeAt(0) * 7) % 360} 60% 35%)` }}>
            {m.name.trim().slice(-1)}
          </span>
          <div className="hd-member-body">
            <p className="hd-member-name">{m.name}</p>
            <p className="hd-member-sub">Điểm tín nhiệm: {m.trustScore}</p>
          </div>
          {m.role === "organizer" ? (
            <span className="badge badge-neutral">Chủ hụi</span>
          ) : m.hasWon ? (
            <span className="badge badge-success">Đã hốt · Kỳ {m.wonRound}</span>
          ) : (
            <span className="badge badge-warning">Chưa hốt</span>
          )}
        </div>
      ))}
    </div>
  );
}

function PaymentsTab() {
  const toast = useToast();
  const payments = useMemo(() => mockHuiPayments(), []);
  return (
    <div className="hd-list">
      {payments.map((p) => (
        <div key={p.round} className="hd-pay">
          <div className="hd-pay-body">
            <p className="hd-pay-title">Kỳ {p.round}</p>
            <p className="hd-pay-sub">Hạn đóng: {p.dueDate}</p>
          </div>
          <div className="hd-pay-right">
            <span className="hd-pay-amount">{p.amount}</span>
            {p.status === "paid" && <span className="badge badge-success">Đã đóng</span>}
            {p.status === "due" && (
              <button className="btn btn-primary btn-sm" onClick={() => toast(`Đã đóng hụi Kỳ ${p.round}`, "success")}>
                Đóng ngay
              </button>
            )}
            {p.status === "upcoming" && <span className="badge badge-neutral">Sắp tới</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab() {
  const rounds = useMemo(() => mockAuctionHistory(), []);
  return (
    <div className="hd-timeline">
      {rounds.map((r) => {
        const compact = r.status === "upcoming";
        return (
          <div key={r.round} className={`hd-tl-item${r.status === "ongoing" ? " is-ongoing" : ""}`}>
            <span className={`hd-tl-dot${r.status !== "upcoming" ? " is-active" : ""}`} />
            {compact ? (
              <div className="hd-tl-compact">
                <span>Kỳ {r.round} · {r.date}</span>
                <span className="badge hd-badge-upcoming">Sắp diễn ra</span>
              </div>
            ) : (
              <div className={`hd-tl-card${r.status === "ongoing" ? " is-ongoing" : ""}`}>
                <div className="hd-tl-head">
                  <span className="hd-tl-round">Kỳ {r.round} · {r.date}</span>
                  {r.status === "received" ? (
                    <span className="badge badge-success">Đã nhận</span>
                  ) : (
                    <span className="badge hd-badge-ongoing">Đang diễn ra</span>
                  )}
                </div>
                {r.status === "ongoing" ? (
                  <p className="hd-tl-question">Ai là người trúng?</p>
                ) : (
                  <div className="hd-tl-winner">
                    <span className="hd-tl-avatar" aria-hidden="true">{r.winner?.trim().slice(-1)}</span>
                    <div className="hd-tl-winner-text">
                      <p className="hd-tl-name">{r.winner}</p>
                      <p className="hd-tl-price">Giá trúng: <b>{r.wonPrice}</b></p>
                    </div>
                    <span className="hd-tl-saved">Tiết kiệm<br /><b>{r.saved}</b></span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");

  // Deep-link tab qua ?tab= (đọc phía client để tránh cần Suspense/hydration mismatch).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((x) => x.key === t)) setTab(t as TabKey);
  }, []);

  const overview = useMemo(() => mockHuiOverview(id), [id]);

  return (
    <div className="ob-screen hd-screen">
      <HuiDetailHeader name={overview.name} sharePerRound={overview.sharePerRound} memberCount={overview.memberCount} />

      <div className="hd-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`hd-tab${tab === t.key ? " is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="hd-body">
        {tab === "overview" && <OverviewTab id={id} router={router} />}
        {tab === "members" && <MembersTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}
