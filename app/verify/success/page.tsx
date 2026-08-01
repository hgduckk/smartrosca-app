"use client";

import Link from "next/link";
import { SuccessCheck } from "@/components/onboarding/SuccessCheck";
import { WaveBg } from "@/components/onboarding/WaveBg";

export default function VerifySuccessPage() {
  return (
    <div className="ob-screen">
      <div className="ob-body ob-center">
        <SuccessCheck />
        <h1 className="ob-title">Xác thực thành công</h1>
        <p className="ob-subtitle">Tài khoản của bạn đã được xác thực</p>

        <Link href="/" className="ob-btn" style={{ marginTop: "2.5rem" }}>
          Hoàn tất
        </Link>
      </div>
      <WaveBg />
    </div>
  );
}
