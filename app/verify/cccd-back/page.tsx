import { CameraCapture } from "@/components/onboarding/CameraCapture";

export default function CccdBackPage() {
  return (
    <CameraCapture
      title="Chụp mặt sau CCCD"
      subtitle="Đặt CCCD vào khung hình và chụp"
      nextHref="/verify/review"
      storageKey="rosca-kyc-cccd-back"
    />
  );
}
