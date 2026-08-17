"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkNav, StepDots } from "@/components/accounts/LinkNav";
import { ProviderLogo } from "@/components/accounts/ProviderLogo";
import { OtpInput } from "@/components/onboarding/OtpInput";
import { SuccessCheck } from "@/components/onboarding/SuccessCheck";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { useToast } from "@/components/ToastProvider";
import { BANKS, addLinkedAccount, maskNumber, type Provider } from "@/lib/payment-providers";

type Step = "choose" | "info" | "verify" | "otp" | "done";

const RESEND_SECONDS = 30;

export default function LinkBankPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<Step>("choose");
  const [query, setQuery] = useState("");
  const [bank, setBank] = useState<Provider | null>(null);
  const [holder, setHolder] = useState("Nguyễn Văn A");
  const [number, setNumber] = useState("");
  const [branch, setBranch] = useState("Hồ Chí Minh");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  // Đồng hồ đếm ngược "gửi lại mã" ở bước OTP.
  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? BANKS.filter((b) => b.name.toLowerCase().includes(q)) : BANKS;
  }, [query]);

  const numberValid = number.replace(/\s+/g, "").length >= 6;
  const infoValid = holder.trim() && numberValid && branch.trim();

  function selectBank(b: Provider) {
    setBank(b);
    setStep("info");
  }

  function confirmLink() {
    if (!bank) return;
    addLinkedAccount({ providerId: bank.id, kind: "bank", holder: holder.trim(), number: number.replace(/\s+/g, ""), branch: branch.trim() });
    setStep("done");
  }

  // ---- Render từng bước ----

  if (step === "done" && bank) {
    return (
      <div className="ob-screen">
        <div className="ob-body ob-center">
          <SuccessCheck />
          <h1 className="ob-title">Xác thực thành công</h1>
          <p className="ob-subtitle">
            Tài khoản {bank.name}
            <br />
            đã được liên kết thành công
          </p>
          <div className="ln-done-card">
            <ProviderLogo provider={bank} size={44} />
            <div className="ln-done-body">
              <p className="ln-done-name">{bank.name}</p>
              <p className="ln-done-sub">
                {maskNumber("bank", number)}
                <br />
                {holder}
              </p>
            </div>
          </div>
          <button className="ob-btn" style={{ marginTop: "2rem" }} onClick={() => router.push("/accounts")}>
            Hoàn tất
          </button>
        </div>
        <WaveBg />
      </div>
    );
  }

  const title = step === "verify" ? "Xác thực thông tin" : "Liên kết ngân hàng";
  const stepNum = step === "choose" ? 1 : step === "info" ? 2 : 3;

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <LinkNav
          title={step === "otp" ? "Xác thực OTP" : title}
          back={step === "choose" ? "/accounts/link" : undefined}
        />

        {step !== "otp" && <StepDots step={stepNum} />}

        {step === "choose" && (
          <>
            <h2 className="ln-section">Chọn ngân hàng</h2>
            <div className="ln-search">
              <input
                placeholder="Tìm kiếm ngân hàng"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
            {filtered.length === 0 ? (
              <p className="ln-empty">Không tìm thấy ngân hàng phù hợp.</p>
            ) : (
              <ul className="ln-bank-list">
                {filtered.map((b) => (
                  <li key={b.id}>
                    <button type="button" className="ln-bank-row" onClick={() => selectBank(b)}>
                      <ProviderLogo provider={b} size={36} />
                      <span className="ln-bank-name">{b.name}</span>
                      <svg className="ln-acct-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {step === "info" && (
          <>
            <h2 className="ln-section">Nhập thông tin</h2>
            <form
              className="ob-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (infoValid) setStep("verify");
              }}
            >
              <div className="ob-field">
                <label className="ob-label">Tên chủ tài khoản</label>
                <input className="ob-input" value={holder} onChange={(e) => setHolder(e.target.value)} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Số tài khoản</label>
                <input
                  className="ob-input"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label">Chi nhánh</label>
                <input className="ob-input" value={branch} onChange={(e) => setBranch(e.target.value)} />
              </div>
              <button type="submit" className="ob-btn" style={{ marginTop: "1rem" }} disabled={!infoValid}>
                Tiếp tục
              </button>
            </form>
          </>
        )}

        {step === "verify" && bank && (
          <>
            <div className="ln-summary">
              <div className="ln-summary-head">
                <ProviderLogo provider={bank} size={32} />
                <b>{bank.name}</b>
              </div>
              <div className="ln-summary-row">
                <p className="ln-summary-label">Tên chủ tài khoản</p>
                <p className="ln-summary-value">{holder}</p>
              </div>
              <div className="ln-summary-row">
                <p className="ln-summary-label">Số tài khoản</p>
                <p className="ln-summary-value">{number}</p>
              </div>
              <div className="ln-summary-row">
                <p className="ln-summary-label">Chi nhánh</p>
                <p className="ln-summary-value">{branch}</p>
              </div>
            </div>
            <button
              className="ob-btn"
              style={{ marginTop: "2rem" }}
              onClick={() => {
                setSeconds(RESEND_SECONDS);
                setOtp("");
                setStep("otp");
              }}
            >
              Xác nhận
            </button>
          </>
        )}

        {step === "otp" && (
          <div style={{ marginTop: "1rem" }}>
            <p className="ob-subtitle">
              Vui lòng nhập mã OTP vừa gửi đến
              <br />
              số điện thoại của bạn
            </p>
            <div style={{ margin: "2rem 0 1.25rem" }}>
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            <p className="ob-otp-timer">
              {seconds > 0 ? (
                <>Gửi lại mã sau: <b>00:{String(seconds).padStart(2, "0")}</b></>
              ) : (
                <button
                  type="button"
                  className="ob-link"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setSeconds(RESEND_SECONDS);
                    toast("Đã gửi lại mã OTP", "info");
                  }}
                >
                  Gửi lại mã
                </button>
              )}
            </p>
            <button
              className="ob-btn"
              style={{ marginTop: "2rem" }}
              disabled={otp.length < 6}
              onClick={confirmLink}
            >
              Xác nhận
            </button>
          </div>
        )}
      </div>
      <WaveBg />
    </div>
  );
}
