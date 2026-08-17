"use client";

import { useRouter } from "next/navigation";

// Header trang chi tiết dây hụi (khớp mẫu Figma): nút quay lại, avatar hoa, tên
// hụi + phần hụi/kỳ + số thành viên, và 2 nút chia sẻ / cài đặt bên phải.
export function HuiDetailHeader({
  name,
  sharePerRound,
  memberCount,
}: {
  name: string;
  sharePerRound: string;
  memberCount: number;
}) {
  const router = useRouter();
  return (
    <div className="hd-top">
      <button type="button" className="hd-back" aria-label="Quay lại" onClick={() => router.back()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>

      <span className="hd-avatar" aria-hidden="true">🌼</span>

      <div className="hd-title-block">
        <h1 className="hd-title">{name}</h1>
        <p className="hd-sub">{sharePerRound} / Kỳ</p>
        <p className="hd-sub">Thành viên: {memberCount} người</p>
      </div>

      <div className="hd-actions">
        <button type="button" className="hd-icon-btn" aria-label="Chia sẻ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13" />
            <path d="m8 7 4-4 4 4" />
            <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
          </svg>
        </button>
        <button type="button" className="hd-icon-btn" aria-label="Cài đặt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14v-.1a2 2 0 0 1 0-3.8h.2A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6h.1A1.6 1.6 0 0 0 11 2.6v-.2a2 2 0 0 1 4 0v.2A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21.4 10v.1a1.6 1.6 0 0 0 0 3.8Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
