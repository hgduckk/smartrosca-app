"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatEther } from "ethers";
import {
  getOnChainHistory,
  getGroupSummaryOnChain,
  type OnChainHistoryEvent,
  type OnChainEventType,
  type GroupSummaryOnChain,
} from "@/lib/contract";
import { MOCK_EXPLORER_GROUPS } from "@/lib/mock";

const ADDR_RE = /^0x[0-9a-fA-F]{40}$/;

const STATUS_LABELS: Record<number, { label: string; variant: string }> = {
  0: { label: "Đang mở", variant: "warning" },
  1: { label: "Đang chạy", variant: "success" },
  2: { label: "Hoàn thành", variant: "neutral" },
  3: { label: "Đã huỷ", variant: "danger" },
};

type EventMeta = { label: string; tone: "primary" | "success" | "warning" | "danger" };

const EVENT_META: Record<OnChainEventType, EventMeta> = {
  MemberJoined: { label: "Tham gia dây hụi", tone: "primary" },
  RoundStarted: { label: "Mở vòng đấu", tone: "primary" },
  BidPlaced: { label: "Kêu lãi", tone: "warning" },
  RoundClosed: { label: "Chốt vòng đấu", tone: "primary" },
  ContributionMade: { label: "Đóng góp", tone: "success" },
  Payout: { label: "Giải ngân", tone: "success" },
  MemberDefaulted: { label: "Vi phạm — mất ký quỹ", tone: "danger" },
  GroupCompleted: { label: "Hoàn thành dây hụi", tone: "success" },
};

function EventIcon({ type }: { type: OnChainEventType }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (type) {
    case "MemberJoined":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>;
    case "RoundStarted":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "BidPlaced":
      return <svg {...common}><path d="m14 9-8.5 8.5a2.12 2.12 0 0 1-3-3L11 6" /><path d="m9 4 8 8M13 8l3-3 4 4-3 3M14 21H4" /></svg>;
    case "RoundClosed":
      return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
    case "ContributionMade":
      return <svg {...common}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M12 12v4M10 14h4" /></svg>;
    case "Payout":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5A2.5 2.5 0 0 1 12 8c1.4 0 2.5.8 2.5 2M14.5 14.5A2.5 2.5 0 0 1 12 16c-1.4 0-2.5-.8-2.5-2" /></svg>;
    case "MemberDefaulted":
      return <svg {...common}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>;
    case "GroupCompleted":
      return <svg {...common}><path d="M8 21h8M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M17 5h2a2 2 0 0 1 0 4h-2M7 5H5a2 2 0 0 0 0 4h2" /></svg>;
  }
}

function maskAddr(a: string | null) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function fmtEth(wei: string | null) {
  if (!wei) return null;
  const v = Number(formatEther(wei));
  return `${v.toLocaleString("vi-VN", { maximumFractionDigits: 4 })} ETH`;
}

function fmtTime(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExplorerPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<GroupSummaryOnChain | null>(null);
  const [events, setEvents] = useState<OnChainHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OnChainEventType | "ALL">("ALL");
  const [copied, setCopied] = useState<string | null>(null);

  const lookup = useCallback(async (raw: string) => {
    const addr = raw.trim();
    if (!ADDR_RE.test(addr)) {
      setError("Địa chỉ contract không hợp lệ (cần dạng 0x + 40 ký tự hex).");
      return;
    }
    setLoading(true);
    setError(null);
    setSummary(null);
    setEvents([]);
    setFilter("ALL");
    try {
      const [sum, evs] = await Promise.all([
        getGroupSummaryOnChain(addr),
        getOnChainHistory(addr),
      ]);
      setSummary(sum);
      setEvents(evs);
      // Cập nhật URL để chia sẻ được (không reload trang).
      window.history.replaceState(null, "", `/explorer?address=${addr}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tra cứu được dây hụi này.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Deep-link: đọc ?address= phía client (tránh cần Suspense của useSearchParams).
  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get("address");
    if (a && ADDR_RE.test(a)) {
      setQuery(a);
      lookup(a);
    }
  }, [lookup]);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }, []);

  const presentTypes = useMemo(() => {
    const set = new Set<OnChainEventType>();
    for (const e of events) set.add(e.type);
    return HISTORY_ORDER.filter((t) => set.has(t));
  }, [events]);

  const shown = useMemo(
    () => (filter === "ALL" ? events : events.filter((e) => e.type === filter)),
    [events, filter]
  );

  return (
    <div className="ex">
      <header className="ex-bar">
        <button type="button" className="ex-back" aria-label="Quay lại" onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <div className="ex-bar-title">
          <h1>Sổ cái minh bạch</h1>
          <span>Tra cứu on-chain · Sepolia</span>
        </div>
      </header>

      <div className="ex-body">
        <div className="ex-intro">
          <div className="ex-intro-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p>
            Mọi lượt tham gia, kêu lãi, đóng góp, giải ngân và vi phạm của một dây hụi đều được
            ghi <strong>bất biến</strong> lên blockchain. Ai cũng tra cứu được — không ai sửa được.
          </p>
        </div>

        <form
          className="ex-search"
          onSubmit={(e) => {
            e.preventDefault();
            lookup(query);
          }}
        >
          <input
            className="ex-input"
            placeholder="Dán địa chỉ contract dây hụi (0x…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary ex-search-btn" disabled={loading}>
            {loading ? "Đang tra…" : "Tra cứu"}
          </button>
        </form>

        {MOCK_EXPLORER_GROUPS.length > 0 && (
          <div className="ex-samples">
            <span className="ex-samples-label">Thử nhanh:</span>
            {MOCK_EXPLORER_GROUPS.map((g) => (
              <button
                key={g.contractAddress}
                type="button"
                className="ex-chip"
                onClick={() => {
                  setQuery(g.contractAddress);
                  lookup(g.contractAddress);
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {error && <p className="ex-error">{error}</p>}

        {loading && <div className="ex-loading">Đang đọc dữ liệu từ blockchain…</div>}

        {summary && !loading && (
          <>
            <section className="ex-summary">
              <div className="ex-summary-top">
                <div>
                  <p className="ex-summary-label">Địa chỉ contract</p>
                  <button type="button" className="ex-addr" onClick={() => copy(summary.contractAddress, "contract")}>
                    <span className="ex-mono">{maskAddr(summary.contractAddress)}</span>
                    <span className="ex-copy">{copied === "contract" ? "Đã chép ✓" : "Sao chép"}</span>
                  </button>
                </div>
                {STATUS_LABELS[summary.status] && (
                  <span className={`badge badge-${STATUS_LABELS[summary.status].variant}`}>
                    {STATUS_LABELS[summary.status].label}
                  </span>
                )}
              </div>

              <div className="ex-stats">
                <div className="ex-stat">
                  <span>Phần hụi / kỳ</span>
                  <strong>{fmtEth(summary.shareAmountWei)}</strong>
                </div>
                <div className="ex-stat">
                  <span>Thành viên</span>
                  <strong>{summary.memberCount}/{summary.totalMembers}</strong>
                </div>
                <div className="ex-stat">
                  <span>Ký quỹ</span>
                  <strong>{fmtEth(summary.collateralWei)}</strong>
                </div>
                <div className="ex-stat">
                  <span>Kỳ hiện tại</span>
                  <strong>{summary.currentRound}</strong>
                </div>
                <div className="ex-stat">
                  <span>Trần lãi kỳ này</span>
                  <strong>{fmtEth(summary.currentMaxBidCapWei) ?? "—"}</strong>
                </div>
                <div className="ex-stat">
                  <span>Chủ họ</span>
                  <strong className="ex-mono">{maskAddr(summary.organizer)}</strong>
                </div>
              </div>

              <div className="ex-summary-foot">
                <a
                  href={`https://sepolia.etherscan.io/address/${summary.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ex-etherscan"
                >
                  Xem trên Etherscan ↗
                </a>
                <button
                  type="button"
                  className="ex-share"
                  onClick={() => copy(`${window.location.origin}/explorer?address=${summary.contractAddress}`, "link")}
                >
                  {copied === "link" ? "Đã chép link ✓" : "Chia sẻ link tra cứu"}
                </button>
              </div>
            </section>

            <div className="ex-timeline-head">
              <h2>Dòng thời gian on-chain</h2>
              <span className="ex-count">{events.length} sự kiện</span>
            </div>

            {presentTypes.length > 1 && (
              <div className="ex-filters">
                <button
                  type="button"
                  className={`ex-fchip${filter === "ALL" ? " is-active" : ""}`}
                  onClick={() => setFilter("ALL")}
                >
                  Tất cả
                </button>
                {presentTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`ex-fchip ex-tone-${EVENT_META[t].tone}${filter === t ? " is-active" : ""}`}
                    onClick={() => setFilter(t)}
                  >
                    {EVENT_META[t].label}
                  </button>
                ))}
              </div>
            )}

            <ol className="ex-timeline">
              {shown.map((e, i) => {
                const meta = EVENT_META[e.type];
                const amount = fmtEth(e.amountWei);
                return (
                  <li key={`${e.txHash}-${e.logIndex}-${i}`} className={`ex-event ex-tone-${meta.tone}`}>
                    <div className="ex-event-rail">
                      <span className="ex-event-dot">
                        <EventIcon type={e.type} />
                      </span>
                    </div>
                    <div className="ex-event-body">
                      <div className="ex-event-top">
                        <span className="ex-event-title">{meta.label}</span>
                        {e.roundNumber != null && <span className="ex-event-round">Kỳ {e.roundNumber}</span>}
                      </div>
                      <div className="ex-event-meta">
                        {e.address && <span className="ex-mono">{maskAddr(e.address)}</span>}
                        {amount && <span className="ex-event-amount">{amount}</span>}
                      </div>
                      <div className="ex-event-foot">
                        <span>{fmtTime(e.timestamp)}</span>
                        <span className="ex-dotsep">·</span>
                        <span>khối #{e.blockNumber.toLocaleString("vi-VN")}</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${e.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ex-tx"
                        >
                          tx ↗
                        </a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {shown.length === 0 && <p className="ex-empty">Không có sự kiện thuộc loại này.</p>}
          </>
        )}
      </div>
    </div>
  );
}

// Thứ tự hiển thị nhóm loại sự kiện trong bộ lọc (ổn định, không phụ thuộc thứ tự xuất hiện).
const HISTORY_ORDER: OnChainEventType[] = [
  "BidPlaced",
  "RoundClosed",
  "ContributionMade",
  "Payout",
  "MemberDefaulted",
  "MemberJoined",
  "RoundStarted",
  "GroupCompleted",
];
