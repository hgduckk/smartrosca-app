"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkNav } from "@/components/accounts/LinkNav";
import { ProviderLogo } from "@/components/accounts/ProviderLogo";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { useToast } from "@/components/ToastProvider";
import {
  findProvider,
  maskNumber,
  readLinkedAccounts,
  setDefaultAccount,
  type LinkedAccount,
} from "@/lib/payment-providers";

function Chevron() {
  return (
    <svg className="ln-acct-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function AccountRow({ account, onSetDefault }: { account: LinkedAccount; onSetDefault: (a: LinkedAccount) => void }) {
  const provider = findProvider(account.providerId);
  if (!provider) return null;
  return (
    <button type="button" className="ln-acct" onClick={() => onSetDefault(account)}>
      <ProviderLogo provider={provider} size={54} />
      <div className="ln-acct-body">
        <p className="ln-acct-name">{provider.name}</p>
        <p className="ln-acct-sub">{maskNumber(account.kind, account.number)}</p>
      </div>
      {account.isDefault && <span className="ln-acct-default">Mặc định</span>}
      <Chevron />
    </button>
  );
}

export default function AccountsPage() {
  const router = useRouter();
  const toast = useToast();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);

  const refresh = useCallback(() => setAccounts(readLinkedAccounts()), []);
  useEffect(() => refresh(), [refresh]);

  const handleSetDefault = (a: LinkedAccount) => {
    if (a.isDefault) return;
    setDefaultAccount(a.id);
    refresh();
    const name = findProvider(a.providerId)?.name ?? "Tài khoản";
    toast(`Đã đặt ${name} làm nguồn mặc định`, "success");
  };

  const banks = accounts.filter((a) => a.kind === "bank");
  const wallets = accounts.filter((a) => a.kind === "wallet");
  const empty = accounts.length === 0;

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <LinkNav title="Tài khoản liên kết" back="/profile" />

        {empty && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p className="ob-subtitle">Bạn chưa liên kết nguồn thanh toán nào.</p>
            <button
              className="ob-btn"
              style={{ marginTop: "1.5rem" }}
              onClick={() => router.push("/accounts/link")}
            >
              Liên kết ngay
            </button>
          </div>
        )}

        {(!empty || banks.length > 0) && (
          <>
            <h2 className="ln-section">Ngân hàng</h2>
            {banks.map((a) => (
              <AccountRow key={a.id} account={a} onSetDefault={handleSetDefault} />
            ))}
            <button className="ln-add" onClick={() => router.push("/accounts/link/bank")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Thêm ngân hàng
            </button>
          </>
        )}

        {(!empty || wallets.length > 0) && (
          <>
            <h2 className="ln-section">Ví điện tử</h2>
            {wallets.map((a) => (
              <AccountRow key={a.id} account={a} onSetDefault={handleSetDefault} />
            ))}
            <button className="ln-add" onClick={() => router.push("/accounts/link/wallet")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Thêm ví điện tử
            </button>
          </>
        )}
      </div>
      <WaveBg />
    </div>
  );
}
