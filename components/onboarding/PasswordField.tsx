"use client";

import { useState } from "react";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1M6.2 6.2A17.3 17.3 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4-.85" />
        </>
      )}
    </svg>
  );
}

function CheckDot() {
  return (
    <svg className="ob-req-dot" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export type Strength = { len: boolean; letter: boolean; number: boolean; score: number };

export function passwordStrength(pw: string): Strength {
  const len = pw.length >= 8;
  const letter = /[a-zA-Z]/.test(pw);
  const number = /[0-9]/.test(pw);
  const score = [len, letter, number].filter(Boolean).length;
  return { len, letter, number, score };
}

export function PasswordField({
  value,
  onChange,
  placeholder,
  showStrength = false,
  autoComplete = "current-password",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const s = passwordStrength(value);
  const label = s.score <= 1 ? "Mật khẩu yếu" : s.score === 2 ? "Mật khẩu trung bình" : "Mật khẩu mạnh";
  const labelColor =
    s.score <= 1 ? "var(--color-danger)" : s.score === 2 ? "var(--color-warning)" : "var(--color-success)";

  return (
    <>
      <div className="ob-input-wrap">
        <input
          className="ob-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="ob-eye"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <EyeIcon open={show} />
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="ob-strength">
          <span className="ob-strength-label" style={{ color: labelColor }}>
            {label}
          </span>
          <div className="ob-strength-bars">
            <span className={`ob-strength-seg ob-strength-seg--red`} />
            <span className={`ob-strength-seg${s.score >= 2 ? " ob-strength-seg--orange" : ""}`} />
            <span className={`ob-strength-seg${s.score >= 3 ? " ob-strength-seg--green" : ""}`} />
          </div>
          <ul className="ob-req">
            <li className={s.len ? "ok" : ""}>
              <CheckDot /> Ít nhất có 8 kí tự
            </li>
            <li className={s.letter ? "ok" : ""}>
              <CheckDot /> Có chữ cái
            </li>
            <li className={s.number ? "ok" : ""}>
              <CheckDot /> Có ít nhất 1 số
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
