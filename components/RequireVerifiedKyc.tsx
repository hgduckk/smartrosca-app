"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import { useKycStatus } from "@/lib/use-kyc-status";

// Bọc quanh các trang yêu cầu KYC đã VERIFIED (vd: tạo/tham gia dây hụi ở Giai đoạn 2).
// Đây là guard phía client, không phải Next.js middleware.ts — vì trạng thái ví
// MetaMask chỉ tồn tại trong trình duyệt, middleware chạy ở edge/server không thấy được.
export function RequireVerifiedKyc({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { address } = useWallet();
  const { status, loading } = useKycStatus(address);

  useEffect(() => {
    if (!address) return;
    if (!loading && status !== "VERIFIED") {
      router.replace("/kyc");
    }
  }, [address, status, loading, router]);

  if (!address) {
    return (
      <main className="page">
        <p className="muted">Vui lòng kết nối ví để tiếp tục.</p>
      </main>
    );
  }
  if (loading || status !== "VERIFIED") {
    return (
      <main className="page">
        <p className="muted">Đang kiểm tra trạng thái xác thực...</p>
      </main>
    );
  }

  return <>{children}</>;
}
