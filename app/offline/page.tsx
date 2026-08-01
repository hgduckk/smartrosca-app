"use client";

// Trang offline shell — được next-pwa precache và trả về khi mất mạng mà trang đích
// chưa nằm trong cache (fallbacks.document trong next.config.ts).
export default function OfflinePage() {
  return (
    <main className="page">
      <div className="state-screen">
        <div className="state-icon state-icon-warning" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l22 22" />
            <path d="M16.7 11.1a6 6 0 0 1 4 1.7M5 12.6a10 10 0 0 1 4.5-2.4M2 8.8a14 14 0 0 1 5-3M20.9 8.8a14 14 0 0 0-3.4-2.3" />
            <path d="M8.5 16.1a5 5 0 0 1 6 0" />
            <path d="M12 20h.01" />
          </svg>
        </div>
        <h1 style={{ marginBottom: "0.35rem" }}>Bạn đang offline</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Không có kết nối mạng. Một số dữ liệu vẫn xem được từ bộ nhớ đệm — thử lại khi mạng
          ổn định.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: "0.5rem" }}
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
