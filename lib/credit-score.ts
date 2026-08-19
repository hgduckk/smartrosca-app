import { prisma } from "./prisma";

// ============================================================================
// Thang điểm tín nhiệm (Trust Score) — THỐNG NHẤT trên thang /1000.
//
// Điểm khởi đầu 500 (mức "Khá"). Mọi thay đổi điểm ghi lại 1 CreditScoreEvent và
// luôn bị kẹp trong [0, 1000]. Đây là nguồn sự thật cho các mức cộng/trừ; phần
// phân hạng (nhãn/màu theo điểm) nằm ở credit-score-level.ts.
// ============================================================================

export const TRUST_SCORE_START = 500;
export const TRUST_SCORE_MIN = 0;
export const TRUST_SCORE_MAX = 1000;

// Các mức cộng/trừ điểm theo sự kiện nghiệp vụ (thang /1000).
export const EKYC_VERIFIED_DELTA = 30; // hoàn tất xác thực eKYC
export const CONTRIBUTION_ON_TIME_DELTA = 20; // đóng góp đúng hạn
export const CONTRIBUTION_LATE_DELTA = -30; // đóng góp trễ hạn
export const MEMBER_DEFAULT_DELTA = -100; // bỏ đóng góp (vi phạm) — mất ký quỹ
export const GROUP_COMPLETED_DELTA = 50; // hoàn thành trọn một dây hụi

function clamp(score: number) {
  return Math.max(TRUST_SCORE_MIN, Math.min(TRUST_SCORE_MAX, score));
}

// Cộng/trừ điểm và ghi lại lịch sử thay đổi (CreditScoreEvent). Vì Prisma
// `increment` không tự kẹp biên, đọc điểm hiện tại rồi ghi giá trị đã kẹp trong
// [0, 1000]. Nếu user chưa có bản ghi, khởi tạo từ TRUST_SCORE_START rồi áp delta.
// `delta` gốc (chưa kẹp) vẫn được lưu vào event để phản ánh đúng luật đã áp dụng.
export async function applyCreditScoreDelta(userId: string, delta: number, reason: string) {
  const current = await prisma.creditScore.findUnique({ where: { userId } });
  const base = current?.score ?? TRUST_SCORE_START;
  const next = clamp(base + delta);
  await prisma.creditScore.upsert({
    where: { userId },
    update: { score: next },
    create: { userId, score: next },
  });
  await prisma.creditScoreEvent.create({
    data: { userId, delta, reason },
  });
}
