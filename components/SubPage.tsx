"use client";

import { useRouter } from "next/navigation";

// Khung trang con dùng chung cho các mục trong Hồ sơ (Thông tin cá nhân, Cài đặt,
// Thông báo, Thiết bị đăng nhập, Trợ giúp). Full-screen (bare), có thanh trên cùng
// gồm nút quay lại + tiêu đề căn giữa, theme-aware bằng design token chung. `back`
// cho phép chỉ định đích quay lại; mặc định lùi 1 bước trong lịch sử.
export function SubPage({
  title,
  back,
  action,
  children,
}: {
  title: string;
  back?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="sub">
      <header className="sub-bar">
        <button
          type="button"
          className="sub-back"
          aria-label="Quay lại"
          onClick={() => (back ? router.push(back) : router.back())}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <h1 className="sub-title">{title}</h1>
        <div className="sub-bar-action">{action}</div>
      </header>
      <div className="sub-body">{children}</div>
    </div>
  );
}
