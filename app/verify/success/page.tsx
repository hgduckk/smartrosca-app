"use client";

import Link from "next/link";
import { SuccessCheck } from "@/components/onboarding/SuccessCheck";
import { WaveBg } from "@/components/onboarding/WaveBg";

export default function VerifySuccessPage() {
  return (
    <div className="ob-screen">
      <div className="ob-body ob-center">
        <SuccessCheck />
        <h1 className="ob-title">Tạo tài khoản thành công</h1>
        <p className="ob-subtitle">
          Tài khoản của bạn đã được tạo và xác thực.
          <br />
          Vui lòng đăng nhập để tiếp tục.
        </p>

        <Link href="/login" className="ob-btn" style={{ marginTop: "2.5rem" }}>
          Đăng nhập
        </Link>
      </div>
      <WaveBg />
    </div>
  );
}
