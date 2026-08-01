"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@/lib/wallet-context";
import { useKycStatus } from "@/lib/use-kyc-status";
import { creditScoreLevel } from "@/lib/credit-score-level";
import { useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";

type CreditScoreEvent = {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
};

type ProfileData = {
  creditScore: { score: number; updatedAt: string | null };
  creditScoreEvents: CreditScoreEvent[];
};

function truncate(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function kycLabel(status: string | null) {
  if (status === "VERIFIED") return { label: "Đã xác thực", variant: "success" as const };
  if (status === "REJECTED") return { label: "Bị từ chối", variant: "danger" as const };
  return { label: "Chưa xác thực", variant: "warning" as const };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { address, connect, isConnecting } = useWallet();
  const { status: kycStatus, loading: kycLoading } = useKycStatus(address);
  const toast = useToast();

  function handleLogout() {
    logout();
    router.replace("/login");
  }
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?walletAddress=${address}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        toast("Không tải được hồ sơ", "error");
      }
    } catch {
      toast("Không tải được hồ sơ", "error");
    } finally {
      setLoading(false);
    }
  }, [address, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (!address) {
    return (
      <main className="page">
        <h1>Hồ sơ</h1>
        <div className="card stack">
          <p className="muted" style={{ margin: 0 }}>
            Kết nối ví để xem hồ sơ, trạng thái eKYC và điểm tín nhiệm của bạn.
          </p>
          <button
            className="btn btn-primary"
            onClick={connect}
            disabled={isConnecting}
            style={{ alignSelf: "flex-start" }}
          >
            {isConnecting ? "Đang kết nối..." : "Kết nối ví"}
          </button>
        </div>
      </main>
    );
  }

  const ekyc = kycLabel(kycStatus);
  const level = data ? creditScoreLevel(data.creditScore.score) : null;

  return (
    <main className="page">
      <h1>Hồ sơ</h1>

      <div className="card">
        <div className="profile-header">
          <span className="profile-avatar">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8.2" r="3.2" />
              <path d="M5 20c0-3.5 3.1-6.2 7-6.2s7 2.7 7 6.2" />
            </svg>
          </span>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>{user?.name ?? "Người dùng"}</p>
            <p className="profile-address muted" style={{ margin: "0.15rem 0 0" }}>
              {user?.account ? `Tài khoản: ${user.account}` : truncate(address)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="profile-row" style={{ paddingTop: 0 }}>
          <span>Trạng thái eKYC</span>
          {kycLoading ? (
            <span className="muted">Đang kiểm tra...</span>
          ) : (
            <span className={`badge badge-${ekyc.variant}`}>{ekyc.label}</span>
          )}
        </div>
        {!kycLoading && kycStatus !== "VERIFIED" && (
          <div className="profile-row" style={{ paddingBottom: 0 }}>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Xác thực eKYC để tạo &amp; tham gia dây hụi.
            </span>
            <Link href="/kyc" className="btn btn-primary btn-sm">
              Xác thực ngay
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Credit Score</h2>
        {loading && !data && (
          <div className="stack" style={{ gap: "0.6rem" }} aria-busy="true">
            <Skeleton width="35%" height="2.25rem" radius="10px" />
            <Skeleton width="90px" height="1.5rem" radius="999px" />
            <Skeleton width="60%" height="0.9rem" style={{ marginTop: "0.6rem" }} />
            <Skeleton width="80%" height="0.85rem" />
            <Skeleton width="70%" height="0.85rem" />
          </div>
        )}
        {data && level && (
          <>
            <p className="stat-number" style={{ color: `var(--color-${level.variant})` }}>
              {data.creditScore.score}
            </p>
            <span className={`badge badge-${level.variant}`}>{level.label}</span>

            <h3 style={{ marginTop: "1.25rem" }}>Lịch sử thay đổi điểm</h3>
            {data.creditScoreEvents.length === 0 && (
              <p className="empty-state">Chưa có thay đổi nào.</p>
            )}
            <ul className="list-plain">
              {data.creditScoreEvents.map((e) => (
                <li key={e.id} className="muted">
                  {new Date(e.createdAt).toLocaleString("vi-VN")} —{" "}
                  <strong
                    style={{ color: e.delta >= 0 ? "var(--color-success)" : "var(--color-danger)" }}
                  >
                    {e.delta > 0 ? "+" : ""}
                    {e.delta}
                  </strong>{" "}
                  ({e.reason})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card">
        <button
          className="btn btn-outline"
          onClick={handleLogout}
          style={{ width: "100%", color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 12H4M8 8l-4 4 4 4" />
            <path d="M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </main>
  );
}
