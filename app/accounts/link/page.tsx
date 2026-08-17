"use client";

import { useRouter } from "next/navigation";
import { LinkNav } from "@/components/accounts/LinkNav";
import { WaveBg } from "@/components/onboarding/WaveBg";

function Chevron() {
  return (
    <svg className="ln-acct-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function LinkSourcePage() {
  const router = useRouter();
  return (
    <div className="ob-screen">
      <div className="ob-body">
        <LinkNav title="Nguồn thanh toán" back="/accounts" />
        <h2 className="ln-section">Chọn loại nguồn thanh toán</h2>

        <button className="ln-choice" onClick={() => router.push("/accounts/link/bank")}>
          <span className="ln-choice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 4l9 6.5" />
              <path d="M5 10.5V19M9.5 10.5V19M14.5 10.5V19M19 10.5V19" />
              <path d="M3.5 19h17" />
            </svg>
          </span>
          <div className="ln-choice-body">
            <h3 className="ln-choice-title">Ngân hàng</h3>
            <p className="ln-choice-desc">Liên kết tài khoản ngân hàng để đóng hụi và nhận tiền hụi</p>
          </div>
          <Chevron />
        </button>

        <button className="ln-choice" onClick={() => router.push("/accounts/link/wallet")}>
          <span className="ln-choice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="3" />
              <path d="M3 10h18" />
              <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div className="ln-choice-body">
            <h3 className="ln-choice-title">Ví điện tử</h3>
            <p className="ln-choice-desc">Liên kết ví điện tử để đóng hụi và nhận tiền hụi</p>
          </div>
          <Chevron />
        </button>
      </div>
      <WaveBg />
    </div>
  );
}
