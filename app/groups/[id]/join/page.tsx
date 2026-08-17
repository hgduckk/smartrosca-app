"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { LinkNav } from "@/components/accounts/LinkNav";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { useToast } from "@/components/ToastProvider";
import { mockJoinInfo } from "@/lib/hui-mock";

export default function JoinHuiPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();
  const info = useMemo(() => mockJoinInfo(), []);

  const rows: { label: string; value: string }[] = [
    { label: "Số tiền / kỳ", value: info.sharePerRound },
    { label: "Số kỳ", value: String(info.totalRounds) },
    { label: "Ngày bắt đầu", value: info.startDate },
    { label: "Ngày đóng hằng tháng", value: info.monthlyDueLabel },
    { label: "Hình thức", value: info.method },
  ];

  function handleJoin() {
    toast(`Đã gửi yêu cầu tham gia ${info.huiName}`, "success");
    router.push(`/groups/${id}`);
  }

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <LinkNav title="Tham gia hụi" back="/groups" />

        <div className="jn-card">
          <div className="jn-card-head">
            <span className="jn-card-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="9" r="3" />
                <path d="M2.5 19c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5" />
                <path d="M16 7.5a2.6 2.6 0 0 1 0 5M18 5a5 5 0 0 1 0 10" />
              </svg>
            </span>
            <h2 className="jn-card-name">{info.huiName}</h2>
          </div>

          <div className="jn-card-org">
            <div className="jn-org-left">
              <span className="jn-org-label">Chủ hụi</span>
              <div className="jn-org-person">
                <span className="jn-org-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8.5" r="3.4" />
                    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
                  </svg>
                </span>
                <span className="jn-org-name">{info.organizer}</span>
              </div>
            </div>
            <div className="jn-trust">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <div>
                <p className="jn-trust-score">{info.trustScore}</p>
                <p className="jn-trust-label">Trust Score</p>
              </div>
            </div>
          </div>

          <div className="jn-card-stats">
            <div className="jn-stat">
              <p className="jn-stat-value">{info.createdCount}</p>
              <p className="jn-stat-label">Dây hụi đã tạo</p>
            </div>
            <div className="jn-stat">
              <p className="jn-stat-value">{info.completionRate}%</p>
              <p className="jn-stat-label">Hoàn thành</p>
            </div>
          </div>
        </div>

        <h2 className="jn-section">Chi tiết dây hụi</h2>
        <div className="jn-detail">
          {rows.map((r) => (
            <div key={r.label} className="jn-detail-row">
              <span className="jn-detail-label">{r.label}</span>
              <span className="jn-detail-value">{r.value}</span>
            </div>
          ))}
        </div>

        <button className="ob-btn" style={{ marginTop: "2rem", maxWidth: 300, alignSelf: "center" }} onClick={handleJoin}>
          Tham gia
        </button>
      </div>
      <WaveBg />
    </div>
  );
}
