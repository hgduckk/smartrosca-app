"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { BottomTabBar } from "@/components/BottomTabBar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";

// Các màn onboarding / xác thực chiếm trọn khung điện thoại: không header trên,
// không thanh tab dưới. Route khớp 1 trong các prefix này sẽ render "trần" (bare).
const BARE_PREFIXES = [
  "/splash",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/reset-success",
  "/verify", // luồng eKYC mới: /verify, /verify/cccd-front, ...
];

function isBareRoute(pathname: string) {
  return BARE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// Route công khai — xem được khi CHƯA đăng nhập. Mọi route khác cần phiên đăng
// nhập (giả lập). Luồng onboarding chạy TRƯỚC khi đăng nhập:
// Đăng ký → eKYC (/verify/*) → OTP (/verify-otp) → Đăng nhập (/login) → app.
const PUBLIC_PREFIXES = [
  "/splash",
  "/login",
  "/register",
  "/forgot-password",
  "/verify", // luồng eKYC chạy trước đăng nhập: /verify, /verify/cccd-front, ...
  "/verify-otp",
  "/reset-password",
  "/reset-success",
];

// Đã đăng nhập mà vào các trang này thì đưa về trang chủ.
const REDIRECT_IF_AUTHED = new Set(["/login", "/register", "/splash"]);

function isPublicRoute(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Sở hữu toàn bộ khung điện thoại để bật/tắt header + tabbar tuỳ route. Thanh
// tabbar phải là em kề của .phone-screen (footer cố định), nên không thể lồng
// trong nội dung cuộn — vì vậy cả khung nằm ở client component này.
// Trang chủ mới có header riêng (lời chào + chuông + cài đặt) nên ẩn app-header
// chung nhưng vẫn giữ thanh tab dưới.
const NO_HEADER_ROUTES = new Set(["/"]);

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();

  const bare = isBareRoute(pathname);
  const showHeader = !bare && !NO_HEADER_ROUTES.has(pathname);
  const publicRoute = isPublicRoute(pathname);

  // Bảo vệ route bằng phiên đăng nhập giả lập.
  useEffect(() => {
    if (!ready) return;
    if (!user && !publicRoute) {
      router.replace("/login");
    } else if (user && REDIRECT_IF_AUTHED.has(pathname)) {
      router.replace("/");
    }
  }, [ready, user, publicRoute, pathname, router]);

  // Chặn nháy nội dung khi chưa sẵn sàng hoặc đang chờ redirect.
  const blocked =
    !ready ||
    (!user && !publicRoute) ||
    (!!user && REDIRECT_IF_AUTHED.has(pathname));

  if (blocked) {
    return (
      <div className="phone-outer">
        <div className="phone-frame">
          <div className="phone-notch" aria-hidden="true" />
          <div className="phone-screen">
            <div className="phone-content phone-content-bare">
              <div className="ob-screen" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-outer">
      <div className="phone-frame">
        <div className="phone-notch" aria-hidden="true" />
        <div className="phone-screen">
          {showHeader && (
            <header className="app-header">
              <Link href="/" className="app-brand">
                SmartROSCA
              </Link>
              <div className="row" style={{ gap: "0.5rem", flexWrap: "nowrap" }}>
                <ThemeToggle />
                <ConnectWalletButton />
              </div>
            </header>
          )}
          <div className={bare ? "phone-content phone-content-bare" : "phone-content"}>
            {children}
          </div>
          {!bare && <PWAInstallPrompt />}
        </div>
        {!bare && <BottomTabBar />}
      </div>
    </div>
  );
}
