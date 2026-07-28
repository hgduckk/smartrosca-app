"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useKycStatus } from "@/lib/use-kyc-status";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function KycPage() {
  const { address, connect } = useWallet();
  const { status, loading, refetch } = useKycStatus(address);
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!address || !file) return;
    setVerifying(true);
    // Mock: chỉ giả lập độ trễ xác thực, KHÔNG upload ảnh thật lên bất kỳ đâu.
    await sleep(2500);
    await fetch("/api/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, mockDocType: file.type || "image" }),
    });
    setVerifying(false);
    await refetch();
  };

  if (!address) {
    return (
      <main className="page">
        <h1>Xác thực eKYC</h1>
        <p className="muted">Kết nối ví trước khi thực hiện xác thực.</p>
        <button className="btn btn-primary" onClick={connect}>
          Kết nối ví
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Xác thực eKYC (mock)</h1>

      {loading && <p className="muted">Đang tải trạng thái...</p>}

      <div className="card">
        {status === "VERIFIED" ? (
          <span className="badge badge-success">Đã xác thực ✓</span>
        ) : (
          <div className="stack">
            <p className="muted" style={{ margin: 0 }}>
              Bước xác thực giả lập cho mục đích demo — ảnh không được lưu trữ thật,
              chỉ dùng để mô phỏng luồng eKYC.
            </p>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={!file || verifying}
              style={{ alignSelf: "flex-start" }}
            >
              {verifying ? "Đang xác thực..." : "Xác thực"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
