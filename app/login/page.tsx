"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/onboarding/BrandLogo";
import { PasswordField } from "@/components/onboarding/PasswordField";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { useAuth } from "@/lib/auth-context";
import { PENDING_REG_KEY, readPendingReg } from "@/lib/mock";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState<string>("");

  // Vừa đăng ký xong: điền sẵn SĐT/CCCD để đăng nhập lần đầu cho nhanh.
  useEffect(() => {
    const reg = readPendingReg();
    if (reg) {
      setAccount(reg.phone || reg.cccd || "");
      setRegName(reg.name || "");
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Bản test: đăng nhập giả lập (chấp nhận mọi thông tin). Giai đoạn thật sẽ
    // gọi API xác thực. Tạo phiên (kèm tên đã đăng ký nếu có) rồi về trang chủ.
    login(account.trim() || "0900000000", regName || undefined);
    try {
      sessionStorage.removeItem(PENDING_REG_KEY);
    } catch {
      /* bỏ qua */
    }
    router.push("/");
  }

  return (
    <div className="ob-screen">
      <div className="ob-body">
        {/* Thanh trên: cờ VN + icon */}
        <div className="ob-topbar">
          <span className="ob-flag">
            <span className="ob-flag-emoji">🇻🇳</span> VN
          </span>
          <div className="ob-topbar-icons">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.2" />
              <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
              <path d="M16 8.5a3 3 0 0 1 0 5M18 6a6 6 0 0 1 0 10" />
            </svg>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </div>
        </div>

        <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
          <BrandLogo markSize={92} />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <h1 className="ob-title" style={{ fontSize: "1.9rem" }}>
            Chào mừng trở lại !
          </h1>
          <p className="ob-subtitle">Đăng nhập để tiếp tục</p>
        </div>

        <form className="ob-form" style={{ marginTop: "1.75rem" }} onSubmit={handleSubmit}>
          <div className="ob-field">
            <label className="ob-label">Số điện thoại / CCCD:</label>
            <input
              className="ob-input"
              inputMode="numeric"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="ob-field">
            <label className="ob-label">Mật khẩu :</label>
            <PasswordField value={password} onChange={setPassword} />
            <Link href="/forgot-password" className="ob-field-hint">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="ob-btn" style={{ marginTop: "0.25rem" }}>
            Đăng nhập
          </button>
          <p className="ob-footnote" style={{ fontSize: "0.78rem", marginTop: "-0.3rem" }}>
            Bản test: nhập bất kỳ để đăng nhập
          </p>
        </form>

        <div className="ob-spacer" />

        <p className="ob-footnote">
          Bạn chưa có tài khoản?{" "}
          <Link href="/register" className="ob-link">
            Đăng ký
          </Link>
        </p>
      </div>
      <WaveBg />
    </div>
  );
}
