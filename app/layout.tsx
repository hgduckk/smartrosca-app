import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { BottomTabBar } from "@/components/BottomTabBar";

export const metadata: Metadata = {
  title: "SmartROSCA",
  description: "Nền tảng số hóa hụi đấu (auction-style ROSCA) của Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <WalletProvider>
          <div className="phone-outer">
            <div className="phone-frame">
              <div className="phone-notch" aria-hidden="true" />
              <div className="phone-screen">
                <header className="app-header">
                  <Link href="/" className="app-brand">
                    SmartROSCA
                  </Link>
                  <ConnectWalletButton />
                </header>
                <div className="phone-content">{children}</div>
              </div>
              <BottomTabBar />
            </div>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
