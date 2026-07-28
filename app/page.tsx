import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <h1>SmartROSCA</h1>
      <p className="muted">
        Nền tảng số hóa mô hình hụi đấu (auction-style ROSCA) của Việt Nam — mọi bid,
        đóng góp và giải ngân đều được ghi lại minh bạch trên blockchain Sepolia.
        SmartROSCA là công cụ hỗ trợ, không phải chủ họ.
      </p>

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Bắt đầu</h2>
        <div className="row">
          <Link href="/kyc" className="btn btn-primary">
            1. Xác thực eKYC
          </Link>
          <Link href="/create" className="btn btn-outline">
            2. Tạo dây hụi
          </Link>
          <Link href="/groups" className="btn btn-outline">
            3. Tham gia &amp; đấu giá
          </Link>
          <Link href="/dashboard" className="btn btn-outline">
            Xem dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
