import { prisma } from "./prisma";

// Điểm cộng khi đóng góp đúng hạn, điểm trừ khi đóng trễ hoặc bỏ đóng (default).
export const CONTRIBUTION_ON_TIME_DELTA = 10;
export const CONTRIBUTION_LATE_DELTA = -20;
export const MEMBER_DEFAULT_DELTA = -50;

// Cộng/trừ điểm credit score và ghi lại lịch sử thay đổi (CreditScoreEvent).
// CreditScore.score mặc định 500 — nếu user chưa có bản ghi, tạo mới với điểm
// khởi đầu 500 cộng luôn delta của sự kiện đầu tiên này.
export async function applyCreditScoreDelta(userId: string, delta: number, reason: string) {
  await prisma.creditScore.upsert({
    where: { userId },
    update: { score: { increment: delta } },
    create: { userId, score: 500 + delta },
  });
  await prisma.creditScoreEvent.create({
    data: { userId, delta, reason },
  });
}
