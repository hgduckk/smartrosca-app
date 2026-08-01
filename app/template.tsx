"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// template.tsx được Next remount ở MỖI lần điều hướng → tạo hiệu ứng chuyển trang
// mượt. Tôn trọng prefers-reduced-motion (tắt animation nếu user yêu cầu).
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
