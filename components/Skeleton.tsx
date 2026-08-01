import type { CSSProperties } from "react";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
};

// Khối skeleton shimmer đơn lẻ. Style shimmer nằm trong globals.css (.skeleton).
export function Skeleton({ width, height = "1rem", radius = "8px", className, style }: SkeletonProps) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

// Skeleton dạng thẻ — dùng cho danh sách dây hụi / lịch sử khi đang tải.
export function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Skeleton width="45%" height="1.1rem" />
        <Skeleton width="72px" height="1.4rem" radius="999px" />
      </div>
      <div className="stack" style={{ gap: "0.5rem", marginTop: "0.9rem" }}>
        <Skeleton width="100%" height="0.85rem" />
        <Skeleton width="80%" height="0.85rem" />
      </div>
    </div>
  );
}

// Nhiều thẻ skeleton liên tiếp.
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="stack" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
