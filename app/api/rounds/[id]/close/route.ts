import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ghi nhận kết quả vòng đấu — gọi SAU KHI đã closeRound() thành công trên smart
// contract. Backend chỉ lưu lại người thắng + số tiền mỗi nhóm phải đóng, không
// tự tính toán/quyết định người thắng.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const {
    winnerWalletAddress,
    winningBidWei,
    requiredFromSurvivorWei,
    requiredFromDeadWei,
    closeRoundTxHash,
  } = body ?? {};

  if (typeof winnerWalletAddress !== "string" || !winnerWalletAddress) {
    return NextResponse.json({ error: "Thiếu winnerWalletAddress" }, { status: 400 });
  }

  const winner = await prisma.user.findUnique({
    where: { walletAddress: winnerWalletAddress.toLowerCase() },
  });
  if (!winner) {
    return NextResponse.json({ error: "Không tìm thấy user thắng cuộc" }, { status: 404 });
  }

  const round = await prisma.round.update({
    where: { id },
    data: {
      bidClosed: true,
      winnerUserId: winner.id,
      winningBidWei: typeof winningBidWei === "string" ? winningBidWei : null,
      requiredFromSurvivorWei:
        typeof requiredFromSurvivorWei === "string" ? requiredFromSurvivorWei : null,
      requiredFromDeadWei:
        typeof requiredFromDeadWei === "string" ? requiredFromDeadWei : null,
      closeRoundTxHash: typeof closeRoundTxHash === "string" ? closeRoundTxHash : null,
    },
    include: { winner: true },
  });

  // Đánh dấu người thắng để loại khỏi các vòng đấu sau (không được kêu lãi lại).
  await prisma.huiMember.updateMany({
    where: { groupId: round.groupId, userId: winner.id },
    data: { hasWon: true, wonRound: round.roundNumber },
  });

  return NextResponse.json({ round });
}
