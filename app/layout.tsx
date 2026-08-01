import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ToastProvider";
import { AppChrome } from "@/components/AppChrome";

const APP_NAME = "Quản lý Hụi";
const APP_DESCRIPTION = "Ứng dụng quản lý hụi thông minh";

export const metadata: Metadata = {
  // Dùng để phân giải URL tuyệt đối cho ảnh OpenGraph/Twitter. Đặt biến
  // NEXT_PUBLIC_SITE_URL khi deploy (vd https://hui.vercel.app).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: "Hụi",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/icons/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1170-2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1179-2556.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1290-2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: APP_NAME }],
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
};

// Next 15: themeColor + viewportFit thuộc export `viewport` riêng (KHÔNG còn nằm
// trong `metadata` — API cũ đã deprecated). KHÔNG khoá user-scalable để giữ điểm
// Accessibility; việc chống zoom khi focus input xử lý bằng font-size:16px trong CSS.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6c4bf4" },
    { media: "(prefers-color-scheme: dark)", color: "#121017" },
  ],
};

// Đặt data-theme trước khi React hydrate để tránh nháy màu (FOUC) khi user đã chọn
// sáng/tối thủ công. Nếu chưa chọn → để trống, CSS tự theo prefers-color-scheme.
const noFlashThemeScript = `
(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
        <WalletProvider>
          <AuthProvider>
            <ToastProvider>
              <AppChrome>{children}</AppChrome>
            </ToastProvider>
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
