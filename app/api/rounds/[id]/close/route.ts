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

  // Upsert thay vì findUnique+404: người thắng chắc chắn tồn tại on-chain (đã
  // join + đặt bid), nhưng nếu vì lý do gì đó User off-chain chưa kịp tạo, ta vẫn
  // phải ghi nhận kết quả chốt vòng — không được để round kẹt mãi ở bidClosed=false
  // chỉ vì thiếu 1 bản ghi User có thể tự tạo được.
  const winner = await prisma.user.upsert({
    where: { walletAddress: winnerWalletAddress.toLowerCase() },
    update: {},
    create: { walletAddress: winnerWalletAddress.toLowerCase() },
  });

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
