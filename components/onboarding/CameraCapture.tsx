"use client";

import { useRouter } from "next/navigation";
import { WaveBg } from "@/components/onboarding/WaveBg";

// Màn chụp CCCD (mặt trước / mặt sau). Chưa gắn camera thật — bấm nút chụp sẽ
// điều hướng sang bước kế (nextHref). Sẽ thay bằng getUserMedia ở giai đoạn sau.
export function CameraCapture({
  title,
  subtitle,
  nextHref,
}: {
  title: string;
  subtitle: string;
  nextHref: string;
}) {
  const router = useRouter();

  return (
    <div className="ob-camera">
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <h1 className="ob-title">{title}</h1>
        <p className="ob-subtitle">{subtitle}</p>
      </div>

      <div className="ob-frame">
        <div className="ob-frame-fill" />
        <span className="ob-frame-corner tl" />
        <span className="ob-frame-corner tr" />
        <span className="ob-frame-corner bl" />
        <span className="ob-frame-corner br" />
      </div>

      <div className="ob-camera-controls">
        <button type="button" className="ob-camera-icon-btn" aria-label="Đèn flash">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </button>

        <button
          type="button"
          className="ob-shutter"
          aria-label="Chụp ảnh"
          onClick={() => router.push(nextHref)}
        />

        <button type="button" className="ob-camera-icon-btn" aria-label="Đổi camera">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 21v-5h5M21 3v5h-5" />
          </svg>
        </button>
      </div>

      <WaveBg />
    </div>
  );
}
