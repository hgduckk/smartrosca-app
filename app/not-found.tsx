import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="state-screen">
        <div className="state-icon state-icon-neutral" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.2 9.2a3 3 0 0 1 5.6 1.3c0 2-3 2.5-3 2.5" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h1 style={{ marginBottom: "0.35rem" }}>Không tìm thấy trang</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Trang bạn tìm không tồn tại hoặc đã được di chuyển.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
