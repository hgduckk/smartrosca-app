"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/onboarding/PasswordField";
import { WaveBg } from "@/components/onboarding/WaveBg";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== pw;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch || pw.length < 8) return;
    // TODO(chức năng thật): gọi API đặt lại mật khẩu.
    router.push("/reset-success");
  }

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "26vh" }}>
          <h1 className="ob-title">Tạo mật khẩu mới</h1>
          <p className="ob-subtitle">Mật khẩu mới phải khác mật khẩu cũ</p>
        </div>

        <form className="ob-form" style={{ marginTop: "2rem" }} onSubmit={handleSubmit}>
          <div className="ob-field">
            <label className="ob-label">Mật khẩu mới:</label>
            <PasswordField value={pw} onChange={setPw} showStrength autoComplete="new-password" />
          </div>
          <div className="ob-field">
            <label className="ob-label">Xác nhận mật khẩu:</label>
            <PasswordField value={confirm} onChange={setConfirm} autoComplete="new-password" />
            {mismatch && <span className="error-text" style={{ fontSize: "0.85rem" }}>Mật khẩu xác nhận không khớp</span>}
          </div>

          <button type="submit" className="ob-btn" style={{ marginTop: "1rem" }} disabled={pw.length < 8 || mismatch}>
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
      <WaveBg />
    </div>
  );
}
