"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WaveBg } from "@/components/onboarding/WaveBg";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO(chức năng thật): gửi OTP tới số điện thoại. Hiện chuyển sang màn OTP.
    router.push("/verify-otp?flow=reset");
  }

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "18vh" }}>
          <h1 className="ob-title">Quên mật khẩu</h1>
          <p className="ob-subtitle">
            Vui lòng nhập số điện thoại đã đăng ký
            <br />
            để đặt lại mật khẩu
          </p>
        </div>

        <form className="ob-form" style={{ marginTop: "2.5rem" }} onSubmit={handleSubmit}>
          <div className="ob-phone">
            <div className="ob-phone-prefix">
              +84
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <input
              className="ob-input ob-phone-input"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <button type="submit" className="ob-btn" style={{ marginTop: "1.5rem" }}>
            Tiếp tục
          </button>
        </form>

        <div className="ob-spacer" />

        <p className="ob-footnote">
          Đã có tài khoản?{" "}
          <Link href="/login" className="ob-link">
            Đăng nhập
          </Link>
        </p>
      </div>
      <WaveBg />
    </div>
  );
}
