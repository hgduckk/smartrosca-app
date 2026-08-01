// Huy hiệu dấu tích tròn tím + các tia sparkle xung quanh (màn "thành công").
function Spark({ style, size = 22 }: { style: React.CSSProperties; size?: number }) {
  return (
    <svg
      className="ob-spark"
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c.6 5.4 3 8.4 12 12-9 3.6-11.4 6.6-12 12-.6-5.4-3-8.4-12-12 9-3.6 11.4-6.6 12-12Z" />
    </svg>
  );
}

export function SuccessCheck() {
  return (
    <div className="ob-success-badge">
      <Spark style={{ top: 6, left: 14 }} size={20} />
      <Spark style={{ top: 30, right: 4 }} size={26} />
      <Spark style={{ bottom: 8, right: 22 }} size={22} />
      <Spark style={{ bottom: 18, left: 6 }} size={18} />
      <Spark style={{ bottom: 40, left: 26 }} size={13} />
      <div className="ob-success-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4.5 12.5 10 18 20 6.5" />
        </svg>
      </div>
    </div>
  );
}
