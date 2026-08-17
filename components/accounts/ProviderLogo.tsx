import type { Provider } from "@/lib/payment-providers";

// Ô logo nguồn thanh toán — ảnh logo thật (public/bank-wallet-logo) phủ kín ô bo
// góc, nền trắng làm nền phụ cho các logo có nền trong suốt. Kích thước tuỳ `size`.
export function ProviderLogo({ provider, size = 48 }: { provider: Provider; size?: number }) {
  return (
    <span className="ln-logo" style={{ width: size, height: size, borderRadius: size * 0.24 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={provider.logo} alt={provider.name} width={size} height={size} />
    </span>
  );
}
