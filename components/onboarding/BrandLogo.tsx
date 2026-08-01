// Logo SmartROSCA dựng lại từ mẫu Figma: mark chữ "S" trong vòng tròn khuyết
// (gradient tím) + wordmark "Smart ROSCA" + tagline. `variant="light"` cho nền
// tối (splash tối) đổi toàn bộ sang trắng.

export function BrandMark({
  size = 96,
  variant = "brand",
}: {
  size?: number;
  variant?: "brand" | "light";
}) {
  const light = variant === "light";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brand-ring" x1="12" y1="12" x2="88" y2="88">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id="brand-s" x1="34" y1="30" x2="66" y2="70">
          <stop offset="0" stopColor="#7c4dff" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>

      {/* Vòng tròn khuyết 2 đầu (dùng dasharray tạo 2 khe hở đối xứng). */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={light ? "#ffffff" : "url(#brand-ring)"}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="98 28 98 28"
        transform="rotate(-58 50 50)"
      />

      {/* Chữ S hình học (nét gấp khúc, hơi nghiêng). */}
      <path
        d="M62 34 L46 34 L46 47 L58 47 L58 60 L40 60"
        fill="none"
        stroke={light ? "#ffffff" : "url(#brand-s)"}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="skewX(-8) translate(6.5 0)"
      />
    </svg>
  );
}

export function BrandLogo({
  variant = "brand",
  markSize = 96,
}: {
  variant?: "brand" | "light";
  markSize?: number;
}) {
  const light = variant === "light";
  return (
    <div className="ob-brand">
      <BrandMark size={markSize} variant={variant} />
      <div
        className="ob-brand-word"
        style={light ? { color: "#ffffff" } : undefined}
      >
        Smart<b style={light ? { color: "#ffffff" } : undefined}>ROSCA</b>
      </div>
      <div
        className={`ob-brand-tagline${light ? " ob-brand-tagline--light" : ""}`}
        style={light ? { color: "rgba(255,255,255,0.85)" } : undefined}
      >
        Quản lý hụi thông minh
      </div>
    </div>
  );
}
