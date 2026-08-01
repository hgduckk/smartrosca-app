// Minh hoạ SVG cho luồng eKYC — dựng lại theo mẫu Figma.

// Khiên 3D tím với icon người bên trong (màn "Xác minh danh tính").
export function ShieldArt({ size = 200 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 220" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="kyc-shield-o" x1="30" y1="10" x2="170" y2="210">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="kyc-shield-i" x1="60" y1="60" x2="140" y2="180">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="kyc-shield-shadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#6d28d9" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Khiên ngoài */}
      <path
        filter="url(#kyc-shield-shadow)"
        d="M100 14 L172 44 V108 C172 158 141 194 100 208 C59 194 28 158 28 108 V44 Z"
        fill="url(#kyc-shield-o)"
      />
      {/* Viền sáng trong */}
      <path
        d="M100 30 L158 54 V108 C158 149 133 180 100 192 C67 180 42 149 42 108 V54 Z"
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="3"
        opacity="0.55"
      />
      {/* Khiên trong */}
      <path
        d="M100 52 L138 68 V108 C138 137 121 160 100 170 C79 160 62 137 62 108 V68 Z"
        fill="url(#kyc-shield-i)"
      />
      {/* Icon người */}
      <circle cx="100" cy="102" r="15" fill="none" stroke="#fff" strokeWidth="4.5" />
      <path
        d="M76 150 c0-16 11-27 24-27 s24 11 24 27"
        fill="none"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Đầu người dạng lưới wireframe (màn "Xác thực khuôn mặt").
export function FaceWireframe({ size = 150 }: { size?: number }) {
  const stroke = "#8b5cf6";
  return (
    <svg width={size} height={size} viewBox="0 0 150 170" fill="none" aria-hidden="true" opacity="0.85">
      <g stroke={stroke} strokeWidth="0.9" fill="none" opacity="0.55">
        {/* Lưới dọc theo khuôn mặt */}
        <path d="M75 8 C55 8 40 28 40 62 C40 104 55 150 75 160" />
        <path d="M75 8 C95 8 110 28 110 62 C110 104 95 150 75 160" />
        <path d="M75 8 C66 8 60 28 60 62 C60 108 68 152 75 160" />
        <path d="M75 8 C84 8 90 28 90 62 C90 108 82 152 75 160" />
        <path d="M75 8 V160" />
        {/* Lưới ngang */}
        <path d="M40 45 C55 38 95 38 110 45" />
        <path d="M42 66 C58 60 92 60 108 66" />
        <path d="M45 90 C60 86 90 86 105 90" />
        <path d="M50 114 C62 112 88 112 100 114" />
        <path d="M56 138 C65 137 85 137 94 138" />
      </g>
      {/* Đường viền mặt đậm hơn */}
      <path
        d="M75 8 C50 8 38 30 38 64 C38 108 54 158 75 162 C96 158 112 108 112 64 C112 30 100 8 75 8 Z"
        stroke={stroke}
        strokeWidth="1.4"
        fill="none"
      />
      {/* Mắt */}
      <path d="M56 74 h12 M82 74 h12" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      {/* Mũi + miệng */}
      <path d="M75 82 v14 M66 116 c6 5 12 5 18 0" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
