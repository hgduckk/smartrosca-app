export type CreditScoreVariant = "success" | "warning" | "danger";

export type CreditScoreLevel = {
  label: string;
  variant: CreditScoreVariant;
};

// Ngưỡng hiển thị badge/màu cho điểm credit score (điểm khởi đầu mặc định là 500).
export function creditScoreLevel(score: number): CreditScoreLevel {
  if (score >= 650) return { label: "Tốt", variant: "success" };
  if (score >= 400) return { label: "Trung bình", variant: "warning" };
  return { label: "Rủi ro cao", variant: "danger" };
}
