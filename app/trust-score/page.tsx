"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import { useToast } from "@/components/ToastProvider";
import { creditScoreLevel, TRUST_SCORE_TIERS } from "@/lib/credit-score-level";
import { TRUST_SCORE_MAX } from "@/lib/credit-score";

type ScoreEvent = { id: string; delta: number; reason: string; createdAt: string };
type Data = {
  creditScore: { score: number; updatedAt: string | null };
  creditScoreEvents: ScoreEvent[];
};

const MAX = TRUST_SCORE_MAX;

// Phân hạng lấy từ nguồn chung credit-score-level.ts (gauge đỏ→xanh, 5 mức).
const tier = creditScoreLevel;

// Hình học cung gauge (cung ~220°, hở ở đáy).
const CX = 140;
const CY = 128;
const R = 108;
const START = 200; // độ, đầu đỏ (dưới-trái)
const SWEEP = 220; // tổng góc cung
const polar = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad) };
};

export default function TrustScorePage() {
  const router = useRouter();
  const { address } = useWallet();
  const toast = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showTiers, setShowTiers] = useState(false);

  const load = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?walletAddress=${address}`);
      if (res.ok) setData(await res.json());
      else toast("Không tải được Trust Score", "error");
    } catch {
      toast("Không tải được Trust Score", "error");
    } finally {
      setLoading(false);
    }
  }, [address, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const score = data?.creditScore.score ?? 0;
  const t = tier(score);

  const { arcPath, knob } = useMemo(() => {
    const s = polar(START);
    const e = polar(START - SWEEP);
    const path = `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${R} ${R} 0 1 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
    const frac = Math.max(0, Math.min(1, score / MAX));
    return { arcPath: path, knob: polar(START - frac * SWEEP) };
  }, [score]);

  return (
    <div className="tsx-screen">
      <div className="tsx-nav">
        <button type="button" className="tsx-back" aria-label="Quay lại" onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <h1 className="tsx-title">Trust Score</h1>
      </div>

      <div className="tsx-gauge">
        <svg viewBox="0 0 280 180" className="tsx-gauge-svg" aria-hidden="true">
          <defs>
            <linearGradient id="tsx-grad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff3b30" />
              <stop offset="0.25" stopColor="#ff9f0a" />
              <stop offset="0.46" stopColor="#ffd60a" />
              <stop offset="0.7" stopColor="#34c759" />
              <stop offset="1" stopColor="#1f8f43" />
            </linearGradient>
          </defs>
          <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="17" strokeLinecap="round" />
          <path d={arcPath} fill="none" stroke="url(#tsx-grad)" strokeWidth="15" strokeLinecap="round" />
          {!loading && (
            <circle cx={knob.x} cy={knob.y} r="10" fill="#fff" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          )}
        </svg>
        <div className="tsx-gauge-center">
          {loading ? (
            <p className="tsx-score" style={{ color: "#b9aee6" }}>…</p>
          ) : (
            <>
              <p className="tsx-score" style={{ color: t.color }}>{score}</p>
              <p className="tsx-max"><b>/</b>{MAX}</p>
              <span className="tsx-tier" style={{ background: t.color }}>{t.label}</span>
            </>
          )}
        </div>
      </div>

      {!loading && <p className="tsx-note">{t.note}</p>}

      <div className="tsx-cards">
        <button type="button" className="tsx-card" onClick={() => setShowTiers((v) => !v)} aria-expanded={showTiers}>
          <div className="tsx-card-body">
            <p className="tsx-card-title">Các mức điểm</p>
            <p className="tsx-card-desc">Xem các mức điểm và quyền lợi tương ứng</p>
          </div>
          <svg className="tsx-card-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showTiers ? "rotate(90deg)" : "none" }}><path d="m9 6 6 6-6 6" /></svg>
        </button>

        {showTiers && (
          <div className="tsx-history">
            {TRUST_SCORE_TIERS.map((tr) => {
              const active = t.label === tr.label;
              return (
                <div key={tr.label} className="tsx-history-row" style={active ? { outline: `1.5px solid ${tr.color}` } : undefined}>
                  <div className="tsx-history-info" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: tr.color, flex: "none" }} />
                    <div>
                      <p className="tsx-history-reason">
                        {tr.label}
                        {active && <span style={{ marginLeft: "0.4rem", fontSize: "0.72rem", color: tr.color }}>· mức của bạn</span>}
                      </p>
                      <p className="tsx-history-date">{tr.range} điểm</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button type="button" className="tsx-card" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
          <div className="tsx-card-body">
            <p className="tsx-card-title">Lịch sử cộng điểm</p>
            <p className="tsx-card-desc">Xem chi tiết các hoạt động ảnh hưởng đến điểm của bạn</p>
          </div>
          <svg className="tsx-card-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showHistory ? "rotate(90deg)" : "none" }}><path d="m9 6 6 6-6 6" /></svg>
        </button>

        {showHistory && (
          <div className="tsx-history">
            {(data?.creditScoreEvents ?? []).length === 0 && (
              <p className="tsx-history-empty">Chưa có thay đổi nào.</p>
            )}
            {(data?.creditScoreEvents ?? []).map((e) => (
              <div key={e.id} className="tsx-history-row">
                <div className="tsx-history-info">
                  <p className="tsx-history-reason">{e.reason}</p>
                  <p className="tsx-history-date">{new Date(e.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <span className="tsx-history-delta" style={{ color: e.delta >= 0 ? "#4ade80" : "#ff7a7a" }}>
                  {e.delta > 0 ? "+" : ""}{e.delta}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
