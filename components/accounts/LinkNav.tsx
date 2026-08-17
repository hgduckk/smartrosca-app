"use client";

import { useRouter } from "next/navigation";

// Thanh điều hướng trên cùng cho luồng liên kết nguồn thanh toán: nút quay lại
// bên trái + tiêu đề navy đậm căn giữa (khớp mẫu Figma). `back` cho phép chỉ
// định đích quay lại; mặc định lùi 1 bước trong lịch sử.
export function LinkNav({ title, back }: { title: string; back?: string }) {
  const router = useRouter();
  return (
    <div className="ln-nav">
      <button
        type="button"
        className="ln-nav-back"
        aria-label="Quay lại"
        onClick={() => (back ? router.push(back) : router.back())}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>
      <h1 className="ln-nav-title">{title}</h1>
    </div>
  );
}

// Chỉ báo tiến trình 3 bước (1—2—3) cho wizard liên kết ngân hàng/ví.
export function StepDots({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="ln-steps" aria-label={`Bước ${step}/${total}`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="ln-step-cell">
          <span
            className={`ln-step-num${n === step ? " is-active" : ""}${n < step ? " is-done" : ""}`}
          >
            {n}
          </span>
          {n < total && <span className={`ln-step-line${n < step ? " is-done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}
