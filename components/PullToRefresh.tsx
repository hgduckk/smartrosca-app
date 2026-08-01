"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Kéo-để-làm-mới (pull-to-refresh) gắn vào scroll container chung của app
// (.phone-screen trong layout). Best-effort: hoạt động tốt trên Chrome/Android và
// trình duyệt; trên iOS standalone bị hạn chế do Safari kiểm soát overscroll — vẫn
// an toàn (không phá vỡ cuộn thường), chỉ có thể không nhạy bằng.
const THRESHOLD = 70; // px cần kéo để kích hoạt
const MAX_PULL = 110;

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const active = useRef(false);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".phone-screen");
    if (!scroller) return;

    const onStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (scroller.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        active.current = true;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (!active.current || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && scroller.scrollTop <= 0) {
        // Kéo giảm dần (đàn hồi) và giới hạn.
        const eased = Math.min(MAX_PULL, delta * 0.5);
        setPull(eased);
      } else {
        active.current = false;
        setPull(0);
      }
    };
    const onEnd = async () => {
      if (!active.current) return;
      active.current = false;
      const shouldRefresh = pull >= THRESHOLD;
      startY.current = null;
      if (shouldRefresh) {
        setRefreshing(true);
        setPull(THRESHOLD);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
    };

    scroller.addEventListener("touchstart", onStart, { passive: true });
    scroller.addEventListener("touchmove", onMove, { passive: true });
    scroller.addEventListener("touchend", onEnd);
    return () => {
      scroller.removeEventListener("touchstart", onStart);
      scroller.removeEventListener("touchmove", onMove);
      scroller.removeEventListener("touchend", onEnd);
    };
  }, [onRefresh, pull, refreshing]);

  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <>
      <div
        className="ptr-indicator"
        style={{ height: pull, opacity: pull > 0 ? 1 : 0 }}
        aria-hidden={pull === 0}
      >
        <span
          className={`ptr-spinner${refreshing ? " ptr-spinner-active" : ""}`}
          style={{ transform: `rotate(${progress * 270}deg)` }}
        />
      </div>
      {children}
    </>
  );
}
