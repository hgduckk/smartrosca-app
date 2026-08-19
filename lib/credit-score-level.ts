export type CreditScoreVariant = "success" | "warning" | "danger";

export type CreditScoreLevel = {
  label: string;
  // Ánh xạ sang badge token (--color-success / --color-warning / --color-danger).
  variant: CreditScoreVariant;
  // Màu gauge Trust Score theo mức (dùng ở trang trust-score).
  color: string;
  note: string;
};

// Phân hạng Trust Score trên thang /1000 — MỘT NGUỒN SỰ THẬT dùng chung cho trang
// Trust Score, dashboard và badge. 5 mức: Xuất sắc / Tốt / Khá / Trung bình / Yếu
// (khớp gauge đỏ→xanh của trang trust-score).
export function creditScoreLevel(score: number): CreditScoreLevel {
  if (score >= 800)
    return { label: "Xuất sắc", variant: "success", color: "#25c766", note: "Bạn đang thuộc nhóm uy tín cao" };
  if (score >= 650)
    return { label: "Tốt", variant: "success", color: "#5ad06a", note: "Bạn đang thuộc nhóm uy tín cao" };
  if (score >= 500)
    return { label: "Khá", variant: "warning", color: "#ffd60a", note: "Uy tín ở mức khá" };
  if (score >= 350)
    return { label: "Trung bình", variant: "warning", color: "#ff9f0a", note: "Nên cải thiện điểm uy tín" };
  return { label: "Yếu", variant: "danger", color: "#ff5a5a", note: "Cần cải thiện điểm uy tín" };
}

// Bảng mức điểm (hiển thị ở card "Các mức điểm" của trang Trust Score).
export const TRUST_SCORE_TIERS: { label: string; range: string; color: string }[] = [
  { label: "Xuất sắc", range: "800 – 1000", color: "#25c766" },
  { label: "Tốt", range: "650 – 799", color: "#5ad06a" },
  { label: "Khá", range: "500 – 649", color: "#ffd60a" },
  { label: "Trung bình", range: "350 – 499", color: "#ff9f0a" },
  { label: "Yếu", range: "0 – 349", color: "#ff5a5a" },
];
