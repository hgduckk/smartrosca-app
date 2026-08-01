"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WaveBg } from "@/components/onboarding/WaveBg";

// Thông tin sẽ được OCR từ ảnh CCCD điền sẵn. Hiện để trống cho người dùng nhập/sửa.
const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Họ và tên:" },
  { key: "cccd", label: "Số CCCD:" },
  { key: "dob", label: "Ngày sinh:" },
  { key: "gender", label: "Giới tính:" },
  { key: "nationality", label: "Quốc tịch:" },
  { key: "hometown", label: "Quê quán:" },
  { key: "residence", label: "Nơi thường trú:" },
];

export default function ReviewPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) return;
    router.push("/verify/face");
  }

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "1.5rem" }}>
          <h1 className="ob-title">Kiểm tra thông tin</h1>
          <p className="ob-subtitle">
            Thông tin được trích xuất từ CCCD
            <br />
            Vui lòng kiểm tra lại
          </p>
        </div>

        <form className="ob-form" style={{ marginTop: "1.5rem", gap: "0.85rem" }} onSubmit={handleSubmit}>
          {FIELDS.map((f) => (
            <input
              key={f.key}
              className="ob-input ob-input--outline"
              placeholder={f.label}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          ))}

          <label className="ob-check" style={{ marginTop: "0.4rem" }}>
            <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
            <span className="ob-check-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5 10 17 19 7" />
              </svg>
            </span>
            <span>Tôi xác nhận các thông tin trên là chính xác</span>
          </label>

          <Link href="/verify/cccd-front" className="ob-retake">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-2.6-6.3" />
              <path d="M21 4v5h-5" />
            </svg>
            Chụp lại CCCD
          </Link>

          <button type="submit" className="ob-btn" disabled={!confirm}>
            Xác nhận thông tin
          </button>
        </form>
      </div>
      <WaveBg />
    </div>
  );
}
