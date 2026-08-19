import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MODE, MOCK_ADDRESS, mockRound, mockTxHash } from "@/lib/mock";
import { applyCreditScoreDelta, GROUP_COMPLETED_DELTA } from "@/lib/credit-score";

// Đánh dấu vòng đấu đã giải ngân — gọi SAU KHI đã payout() thành công trên smart
// contract (tiền đã chuyển cho winner). Kỳ kế tiếp sẽ tự được tạo khi thành viên
// quay lại trang đấu giá (xem POST /api/rounds).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const payoutTxHash = body?.payoutTxHash;

  if (MOCK_MODE) {
    return NextResponse.json(
      mockRound("grp-xxx", {
        id,
        bidClosed: true,
        settled: true,
        winnerUserId: "mock-user",
        winner: { walletAddress: MOCK_ADDRESS.toLowerCase() },
        payoutTxHash: payoutTxHash ?? mockTxHash(),
      }),
    );
  }

  if (typeof payoutTxHash !== "string" || !payoutTxHash) {
    return NextResponse.json({ error: "Thiếu payoutTxHash" }, { status: 400 });
  }

  const round = await prisma.round.update({
    where: { id },
    data: {
      settled: true,
      payoutTxHash,
    },
    include: { winner: true, group: true },
  });

  // Nếu vừa giải ngân kỳ cuối (roundNumber == totalMembers) → dây hụi hoàn tất.
  // Guard `status !== COMPLETED` đảm bảo thưởng điểm hoàn thành đúng MỘT lần.
  if (round.roundNumber >= round.group.totalMembers && round.group.status !== "COMPLETED") {
    await prisma.huiGroup.update({
      where: { id: round.groupId },
      data: { status: "COMPLETED" },
    });
    // Thưởng điểm tín nhiệm cho mọi thành viên còn hoạt động (đi trọn dây hụi).
    const members = await prisma.huiMember.findMany({
      where: { groupId: round.groupId, isActive: true },
      select: { userId: true },
    });
    for (const m of members) {
      await applyCreditScoreDelta(
        m.userId,
        GROUP_COMPLETED_DELTA,
        `Hoàn thành dây hụi ${round.group.name}`
      );
    }
  }

  return NextResponse.json({ round });
}
