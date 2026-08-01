"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaceWireframe } from "@/components/onboarding/KycArt";
import { WaveBg } from "@/components/onboarding/WaveBg";

const GUIDE = [
  {
    text: "Giữ khuôn mặt ở giữa khung hình",
    icon: (
      <>
        <circle cx="12" cy="9" r="3.2" />
        <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      </>
    ),
  },
  {
    text: "Đảm bảo đủ ánh sáng",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
      </>
    ),
  },
  {
    text: "Không đeo kính, khẩu trang",
    icon: (
      <>
        <circle cx="7" cy="14" r="3" />
        <circle cx="17" cy="14" r="3" />
        <path d="M10 14c.7-1 3.3-1 4 0M2 11h3M19 11h3" />
      </>
    ),
  },
  {
    text: "Không sử dụng ảnh chụp",
    icon: (
      <>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M10 6h4" />
      </>
    ),
  },
];

export default function FacePage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;
    const t = setTimeout(() => router.push("/verify/success"), 2600);
    return () => clearTimeout(t);
  }, [scanning, router]);

  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "1.5rem" }}>
          <h1 className="ob-title">Xác thực khuôn mặt</h1>
          <p className="ob-subtitle">Vui lòng đưa mặt vào khung hình</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "1.75rem 0" }}>
          <div className="ob-face-ring-wrap">
            <div className={`ob-face-ring${scanning ? " ob-face-ring--scan" : ""}`}>
              <div className="ob-face-ring-inner">
                <FaceWireframe size={150} />
              </div>
            </div>
            <span className="ob-face-bracket tl" />
            <span className="ob-face-bracket tr" />
            <span className="ob-face-bracket bl" />
            <span className="ob-face-bracket br" />
          </div>
        </div>

        {scanning ? (
          <p className="ob-scan-label">Đang xác thực...</p>
        ) : (
          <>
            <div className="ob-guide">
              <p className="ob-guide-title">Hướng dẫn</p>
              <ul className="ob-guide-list">
                {GUIDE.map((g) => (
                  <li key={g.text}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {g.icon}
                    </svg>
                    {g.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ob-spacer" />

            <button type="button" className="ob-btn" onClick={() => setScanning(true)}>
              Bắt đầu xác thực
            </button>
          </>
        )}
      </div>
      <WaveBg />
    </div>
  );
}
