"use client";

// global-error THAY THẾ cả root layout khi có lỗi ở tầng root → phải tự render
// <html>/<body> và KHÔNG dùng được class từ globals.css (layout đã bị thay). Vì vậy
// toàn bộ style để inline, tự chịu light/dark qua prefers-color-scheme.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#f8f7fc",
          color: "#17151f",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(220,76,100,0.14)",
              color: "#dc4c64",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.4rem" }}>Ứng dụng gặp sự cố</h1>
          <p style={{ margin: "0 0 1.2rem", color: "#6b6478", lineHeight: 1.5 }}>
            Đã có lỗi nghiêm trọng. Vui lòng tải lại ứng dụng.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 8,
              padding: "0.7rem 1.4rem",
              background: "#6c4bf4",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Tải lại
          </button>
        </div>
      </body>
    </html>
  );
}
