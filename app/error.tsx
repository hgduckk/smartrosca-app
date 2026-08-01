"use client";

import { useEffect } from "react";

// Error boundary cho các route segment (giữ nguyên layout/header). global-error.tsx
// mới là lớp bắt lỗi ở tầng root layout.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log để debug; không lộ chi tiết kỹ thuật ra UI.
    console.error(error);
  }, [error]);

  return (
    <main className="page">
      <div className="state-screen">
        <div className="state-icon state-icon-danger" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <h1 style={{ marginBottom: "0.35rem" }}>Đã có lỗi xảy ra</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Rất tiếc, thao tác không hoàn tất. Bạn có thể thử lại.
        </p>
        <button type="button" className="btn btn-primary" onClick={reset} style={{ marginTop: "0.5rem" }}>
          Thử lại
        </button>
      </div>
    </main>
  );
}
