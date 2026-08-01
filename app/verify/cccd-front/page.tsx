import { CameraCapture } from "@/components/onboarding/CameraCapture";

export default function CccdFrontPage() {
  return (
    <CameraCapture
      title="Chụp mặt trước CCCD"
      subtitle="Đặt CCCD vào khung hình và chụp"
      nextHref="/verify/cccd-back"
      storageKey="rosca-kyc-cccd-front"
    />
  );
}
