"use client";

import { useWallet } from "@/lib/wallet-context";
import { MOCK_MODE } from "@/lib/mock";

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isCorrectNetwork, isConnecting, error, connect, switchToSepolia } =
    useWallet();

  // Bản test (mock): không hiển thị trạng thái ví để tránh hiểu nhầm.
  if (MOCK_MODE) return null;

  if (!address) {
    return (
      <div className="row" style={{ gap: "0.4rem" }}>
        <button className="btn btn-primary btn-sm" onClick={connect} disabled={isConnecting}>
          {isConnecting ? "Đang kết nối..." : "Kết nối ví"}
        </button>
        {error && <span className="error-text" style={{ fontSize: "0.8rem" }}>{error}</span>}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="row" style={{ gap: "0.4rem" }}>
        <span className="badge badge-danger">Sai mạng</span>
        <button className="btn btn-outline btn-sm" onClick={switchToSepolia}>
          Chuyển sang Sepolia
        </button>
      </div>
    );
  }

  return (
    <span className="badge badge-success" title={address}>
      {truncate(address)}
    </span>
  );
}
