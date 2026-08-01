"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpInput } from "@/components/onboarding/OtpInput";
import { WaveBg } from "@/components/onboarding/WaveBg";
import { readPendingReg } from "@/lib/mock";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

// Che số điện thoại: giữ 3 số cuối, ẩn phần còn lại.
function maskPhone(p?: string) {
  const d = (p ?? "").replace(/\D/g, "");
  if (d.length < 4) return "xxxx xxx xxx";
  return `${"*".repeat(d.length - 3)}${d.slice(-3)}`;
}

function OtpScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const flow = params.get("flow"); // "reset" | null
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(60);
  const [phone, setPhone] = useState<string>("xxxx xxx xxx");

  useEffect(() => {
    if (flow !== "reset") setPhone(maskPhone(readPendingReg()?.phone));
  }, [flow]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  useEffect(() => {
    if (code.length === 6) {
      // TODO(chức năng thật): xác minh mã với server.
      const dest = flow === "reset" ? "/reset-password" : "/verify/success";
      const t = setTimeout(() => router.push(dest), 250);
      return () => clearTimeout(t);
    }
  }, [code, flow, router]);

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "12vh" }}>
          <h1 className="ob-title">Xác thực OTP</h1>
          <p className="ob-subtitle">
            Vui lòng nhập mã OTP vừa gửi đến
            <br />
            {phone}
          </p>
        </div>

        <div style={{ marginTop: "2.5rem" }}>
          <OtpInput value={code} onChange={setCode} />
        </div>

        <p className="ob-otp-timer" style={{ marginTop: "2rem" }}>
          Gửi lại mã sau: <b>{fmt(left)}</b>
        </p>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p className="ob-footnote" style={{ fontWeight: 600, color: "var(--color-text)" }}>
            Không nhận đc mã?
          </p>
          <button
            type="button"
            className="ob-btn--ghost"
            style={{ background: "none", border: "none", cursor: left > 0 ? "not-allowed" : "pointer", opacity: left > 0 ? 0.5 : 1 }}
            disabled={left > 0}
            onClick={() => setLeft(60)}
          >
            Gửi lại
          </button>
        </div>
      </div>
      <WaveBg />
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="ob-screen" />}>
      <OtpScreen />
    </Suspense>
  );
}
