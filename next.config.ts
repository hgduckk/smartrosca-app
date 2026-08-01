import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Bọc PWA bằng @ducanh2912/next-pwa (bản kế nhiệm được bảo trì của next-pwa, hỗ trợ
// Next 15 + App Router). TẮT hoàn toàn ở development để không cản trở hot-reload;
// chỉ sinh service worker + precache khi build production.
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // Cache khi điều hướng phía client → mở lại nhanh, hỗ trợ offline shell.
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Khi mất mạng và trang chưa cache → trả trang offline đã precache.
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Nén gzip/br cho asset (mặc định true, khai báo tường minh cho rõ ý đồ).
  compress: true,
  reactStrictMode: true,
};

export default withPWA(nextConfig);
