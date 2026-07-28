"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther } from "ethers";
import { useWallet } from "@/lib/wallet-context";
import { creditScoreLevel } from "@/lib/credit-score-level";

type RoundStatus = {
  roundId: string;
  roundNumber: number;
  bidClosed: boolean;
  settled: boolean;
  winnerAddress: string | null;
  isSelfWinner: boolean;
  status: "winner" | "dead" | "survivor";
  requiredWei: string | null;
  contributed: boolean;
  contributionOnTime: boolean | null;
};

type Membership = {
  groupId: string;
  groupName: string;
  hasWon: boolean;
  wonRound: number | null;
  rounds: RoundStatus[];
};

type CreditScoreEvent = {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
};

type HistoryItem = {
  type: string;
  groupName: string;
  txHash: string;
  createdAt: string;
};

type DashboardData = {
  creditScore: { score: number; updatedAt: string | null };
  creditScoreEvents: CreditScoreEvent[];
  memberships: Membership[];
  history: HistoryItem[];
};

function statusLabel(status: RoundStatus["status"]) {
  if (status === "winner") return "Đã hốt kỳ này";
  if (status === "dead") return "Hụi chết";
  return "Hụi sống";
}

export default function DashboardPage() {
  const { address, connect } = useWallet();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?walletAddress=${address}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Không tải được dashboard");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  if (!address) {
    return (
      <main className="page">
        <h1>Dashboard</h1>
        <p className="muted">Kết nối ví để xem dashboard của bạn.</p>
        <button className="btn btn-primary" onClick={connect}>
          Kết nối ví
        </button>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Đang tải dashboard...</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="page">
        <p className="error-text">{error}</p>
      </main>
    );
  }
  if (!data) return null;

  const level = creditScoreLevel(data.creditScore.score);
  const levelColor = `var(--color-${level.variant})`;

  return (
    <main className="page">
      <h1>Dashboard</h1>

      <div className="card" style={{ borderColor: levelColor }}>
        <h2 style={{ marginTop: 0 }}>Credit Score</h2>
        <p className="stat-number" style={{ color: levelColor }}>
          {data.creditScore.score}
        </p>
        <span className={`badge badge-${level.variant}`}>{level.label}</span>
        {data.creditScoreEvents.length > 0 && (
          <details style={{ marginTop: "0.75rem" }}>
            <summary className="muted" style={{ cursor: "pointer" }}>
              Lịch sử thay đổi điểm
            </summary>
            <ul className="list-plain" style={{ marginTop: "0.5rem" }}>
              {data.creditScoreEvents.map((e) => (
                <li key={e.id} className="muted">
                  {new Date(e.createdAt).toLocaleString("vi-VN")} —{" "}
                  <strong style={{ color: e.delta >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                    {e.delta > 0 ? "+" : ""}
                    {e.delta}
                  </strong>{" "}
                  ({e.reason})
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <h2>Các dây hụi của tôi</h2>
      {data.memberships.length === 0 && <p className="empty-state">Bạn chưa tham gia dây hụi nào.</p>}
      {data.memberships.map((m) => (
        <div key={m.groupId} className="card">
          <h3 style={{ marginTop: 0 }}>{m.groupName}</h3>
          {m.rounds.length === 0 && <p className="empty-state">Chưa có kỳ đấu giá nào.</p>}
          <ul className="list-plain">
            {m.rounds.map((r) => (
              <li key={r.roundId} className="row" style={{ justifyContent: "space-between" }}>
                <span>
                  Kỳ {r.roundNumber} —{" "}
                  <span className="badge badge-neutral">
                    {r.bidClosed ? statusLabel(r.status) : "Đang đấu giá"}
                  </span>
                  {r.settled && <span className="badge badge-success" style={{ marginLeft: "0.4rem" }}>Đã giải ngân</span>}
                </span>
                {r.bidClosed && !r.isSelfWinner && (
                  <span className={`badge ${r.contributed ? "badge-success" : "badge-warning"}`}>
                    {r.contributed
                      ? `Đã đóng${r.contributionOnTime === false ? " (trễ hạn)" : ""}`
                      : `Chưa đóng${r.requiredWei ? ` — ${formatEther(r.requiredWei)} ETH` : ""}`}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2>Lịch sử giao dịch</h2>
      <div className="card">
        {data.history.length === 0 && <p className="empty-state">Chưa có giao dịch nào.</p>}
        <ul className="list-plain">
          {data.history.map((h) => (
            <li key={`${h.txHash}-${h.type}`} className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">
                {new Date(h.createdAt).toLocaleString("vi-VN")} — {h.type} ({h.groupName})
              </span>
              <a href={`https://sepolia.etherscan.io/tx/${h.txHash}`} target="_blank" rel="noreferrer">
                Etherscan ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
