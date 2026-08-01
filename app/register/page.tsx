"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/onboarding/PasswordField";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", cccd: "", phone: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Bản test: tạo phiên giả lập rồi vào luồng eKYC. Giai đoạn thật sẽ tạo tài
    // khoản + gửi OTP trước.
    register({ name: form.name, account: form.phone || form.cccd });
    router.push("/verify");
  }

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "1rem" }}>
          <h1 className="ob-title">Tạo tài khoản</h1>
          <p className="ob-subtitle">Vui lòng nhập thông tin</p>
        </div>

        <form className="ob-form" style={{ marginTop: "1.75rem" }} onSubmit={handleSubmit}>
          <div className="ob-field">
            <label className="ob-label">Họ và tên:</label>
            <input className="ob-input" value={form.name} onChange={set("name")} autoComplete="name" />
          </div>
          <div className="ob-field">
            <label className="ob-label">CCCD:</label>
            <input className="ob-input" inputMode="numeric" value={form.cccd} onChange={set("cccd")} />
          </div>
          <div className="ob-field">
            <label className="ob-label">Số điện thoại:</label>
            <input className="ob-input" inputMode="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
          <div className="ob-field">
            <label className="ob-label">Email:</label>
            <input className="ob-input" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          </div>
          <div className="ob-field">
            <label className="ob-label">Mật khẩu:</label>
            <PasswordField
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
              showStrength
              autoComplete="new-password"
            />
          </div>

          <label className="ob-check">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="ob-check-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5 10 17 19 7" />
              </svg>
            </span>
            <span>
              Tôi đồng ý với <span className="ob-link">Điều khoản &amp; Chính sách</span>
            </span>
          </label>

          <button type="submit" className="ob-btn" disabled={!agree}>
            Tạo tài khoản
          </button>
        </form>

        <p className="ob-footnote" style={{ marginTop: "1.25rem" }}>
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
