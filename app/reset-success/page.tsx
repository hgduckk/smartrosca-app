"use client";

import Link from "next/link";
import { SuccessCheck } from "@/components/onboarding/SuccessCheck";
import { WaveBg } from "@/components/onboarding/WaveBg";

export default function ResetSuccessPage() {
  return (
    <div className="ob-screen">
      <div className="ob-body ob-center">
        <SuccessCheck />
        <h1 className="ob-title">Đặt lại thành công</h1>
        <p className="ob-subtitle">
          Mật khẩu của bạn đã được
          <br />
          cập nhật thành công
        </p>

        <div className="ob-stack-gap" style={{ width: "100%", marginTop: "2.5rem" }}>
          <Link href="/login" className="ob-btn">
            Đăng nhập ngay
          </Link>
          <Link href="/" className="ob-btn--ghost" style={{ textAlign: "center" }}>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
      <WaveBg />
    </div>
  );
}
