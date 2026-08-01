"use client";

import { useRef } from "react";

// 6 ô nhập OTP: tự nhảy ô kế khi gõ, xoá lùi khi Backspace, dán dãy số vào đầy.
export function OtpInput({
  length = 6,
  value,
  onChange,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setAt(i: number, d: string) {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(""));
  }

  function handleChange(i: number, raw: string) {
    const d = raw.replace(/\D/g, "");
    if (!d) {
      setAt(i, "");
      return;
    }
    // Dán nhiều số: đổ dần từ ô hiện tại.
    if (d.length > 1) {
      const chars = d.slice(0, length - i).split("");
      const next = digits.slice();
      chars.forEach((c, k) => (next[i + k] = c));
      onChange(next.join(""));
      const last = Math.min(i + chars.length, length - 1);
      refs.current[last]?.focus();
      return;
    }
    setAt(i, d);
    if (i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="ob-otp">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="ob-otp-box"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          aria-label={`Số OTP thứ ${i + 1}`}
        />
      ))}
    </div>
  );
}
