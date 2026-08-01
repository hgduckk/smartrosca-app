// Dải sóng ribbon tím mềm ở đáy màn onboarding — tái dựng theo mẫu Figma bằng
// SVG (nét cong mờ, chồng lớp) để nét sắc ở mọi kích thước và tự hợp light/dark.
export function WaveBg({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`ob-wave ${className}`}
      viewBox="0 0 440 200"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ob-wave-fill" x1="0" y1="200" x2="0" y2="40">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="ob-wave-stroke" x1="0" y1="0" x2="440" y2="0">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#7c4dff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Khối nền tô mờ dưới cùng */}
      <path
        d="M0 120 C 90 80 150 150 230 120 C 310 92 370 150 440 118 L440 200 L0 200 Z"
        fill="url(#ob-wave-fill)"
      />
      {/* Các nét ribbon mảnh chồng nhau */}
      <path
        d="M-10 132 C 80 92 150 162 235 128 C 320 96 380 158 450 120"
        stroke="url(#ob-wave-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M-10 150 C 90 112 160 176 250 142 C 330 112 390 168 450 138"
        stroke="url(#ob-wave-stroke)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M-10 168 C 100 134 170 192 260 158 C 340 130 400 180 450 156"
        stroke="url(#ob-wave-stroke)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
