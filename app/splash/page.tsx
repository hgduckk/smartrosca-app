"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/onboarding/BrandLogo";
import { WaveBg } from "@/components/onboarding/WaveBg";

// Màn khởi động: hiện logo ~2s rồi chuyển sang đăng nhập.
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/login"), 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="ob-screen">
      <div className="ob-body ob-center">
        <BrandLogo markSize={104} />
      </div>
      <WaveBg />
    </div>
  );
}
