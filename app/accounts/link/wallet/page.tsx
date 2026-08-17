"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkNav, StepDots } from "@/components/accounts/LinkNav";
import { ProviderLogo } from "@/components/accounts/ProviderLogo";
import { SuccessCheck } from "@/components/onboarding/SuccessCheck";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { WALLETS, addLinkedAccount, maskNumber, type Provider } from "@/lib/payment-providers";

type Step = "choose" | "redirect" | "done";

// Số điện thoại ví giả lập (mock) — giai đoạn thật lấy từ luồng xác thực ví.
const MOCK_PHONE = "0901234567";

export default function LinkWalletPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [wallet, setWallet] = useState<Provider | null>(null);

  function selectWallet(w: Provider) {
    setWallet(w);
    setStep("redirect");
  }

  function confirmLink() {
    if (!wallet) return;
    addLinkedAccount({ providerId: wallet.id, kind: "wallet", holder: "Nguyễn Văn A", number: MOCK_PHONE });
    setStep("done");
  }

  if (step === "done" && wallet) {
    return (
      <div className="ob-screen">
        <div className="ob-body ob-center">
          <SuccessCheck />
          <h1 className="ob-title">Xác thực thành công</h1>
          <p className="ob-subtitle">
            Tài khoản {wallet.name}
            <br />
            đã được liên kết thành công
          </p>
          <div className="ln-done-card">
            <ProviderLogo provider={wallet} size={44} />
            <div className="ln-done-body">
              <p className="ln-done-name">{wallet.name}</p>
              <p className="ln-done-sub">
                {maskNumber("wallet", MOCK_PHONE)}
                <br />
                Nguyễn Văn A
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

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <LinkNav
          title={step === "redirect" && wallet ? wallet.name : "Liên kết ví điện tử"}
          back={step === "choose" ? "/accounts/link" : undefined}
        />
        <StepDots step={step === "choose" ? 1 : 2} />

        {step === "choose" && (
          <>
            <h2 className="ln-section">Chọn ví điện tử</h2>
            {WALLETS.map((w) => (
              <button key={w.id} type="button" className="ln-wallet" onClick={() => selectWallet(w)}>
                <ProviderLogo provider={w} size={56} />
                <span className="ln-wallet-name">{w.name}</span>
                <svg className="ln-acct-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            ))}
          </>
        )}

        {step === "redirect" && wallet && (
          <div className="ob-center" style={{ flex: "1 0 auto", justifyContent: "flex-start", paddingTop: "2rem" }}>
            <ProviderLogo provider={wallet} size={124} />
            <p className="ln-redirect-note">
              Bạn sẽ được chuyển đến ứng dụng
              <br />
              {wallet.name} để xác thực liên kết
            </p>
            <button className="ob-btn" style={{ marginTop: "2.5rem" }} onClick={confirmLink}>
              Tiếp tục
            </button>
          </div>
        )}
      </div>
      <WaveBg />
    </div>
  );
}
