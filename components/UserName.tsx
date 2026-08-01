"use client";

import { useAuth } from "@/lib/auth-context";

// Hiện tên người dùng đang đăng nhập (phiên giả lập) trên trang chủ.
export function UserName({ fallback = "bạn" }: { fallback?: string }) {
  const { user } = useAuth();
  return <b>{user?.name ?? fallback}</b>;
}
