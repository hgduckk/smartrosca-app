import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

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
          <header className="app-header">
            <Link href="/" className="app-brand">
              SmartROSCA
            </Link>
            <nav className="app-nav">
              <Link href="/kyc">eKYC</Link>
              <Link href="/create">Tạo dây hụi</Link>
              <Link href="/groups">Danh sách dây hụi</Link>
              <Link href="/dashboard">Dashboard</Link>
              <ConnectWalletButton />
            </nav>
          </header>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
