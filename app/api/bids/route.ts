import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MODE, mockBids, mockTxHash } from "@/lib/mock";
import { estimateMaxBidCapWei } from "@/lib/hui-math";

// Lưu 1 bid vào DB — gọi SAU KHI đã placeBid() thành công trên smart contract.
// Contract thật đã tự chặn 2 điều kiện dưới đây (vượt trần lãi, người đã hốt kêu
// lại), nhưng backend vẫn kiểm tra lại làm lớp phòng thủ thứ hai — đảm bảo dữ liệu
// off-chain luôn nhất quán với luật, kể cả khi contract chưa deploy (mock mode)
// hoặc ai đó gọi thẳng API không qua UI.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roundId, walletAddress, amountWei, txHash } = body ?? {};

  if (MOCK_MODE) {
    return NextResponse.json({
      bid: { id: `bid-${Date.now()}`, roundId, amountWei, txHash: txHash ?? mockTxHash() },
    });
  }

  if (
    typeof roundId !== "string" ||
    !roundId ||
    typeof walletAddress !== "string" ||
    !walletAddress ||
    typeof amountWei !== "string" ||
    !amountWei
  ) {
    return NextResponse.json({ error: "Thiếu dữ liệu bid" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Chưa có user — kết nối ví trước" }, { status: 404 });
  }

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { group: true },
  });
  if (!round) {
    return NextResponse.json({ error: "Không tìm thấy vòng đấu" }, { status: 404 });
  }
  if (round.bidClosed) {
    return NextResponse.json({ error: "Vòng đấu đã chốt, không thể kêu lãi." }, { status: 409 });
  }

  // Người đã hốt (hụi chết) không được kêu lãi lại — mỗi thành viên chỉ nhận 1 lần.
  const member = await prisma.huiMember.findUnique({
    where: { groupId_userId: { groupId: round.groupId, userId: user.id } },
  });
  if (member?.hasWon) {
    return NextResponse.json(
      { error: "Bạn đã hốt kỳ trước — không được kêu lãi lại." },
      { status: 403 }
    );
  }

  // Chặn bid vượt trần lãi 20%/năm (Điều 21 NĐ 19/2019). Dùng ước tính theo đúng
  // công thức của contract; ở real mode contract mới là chốt chặn tuyệt đối.
  const cap = estimateMaxBidCapWei(
    BigInt(round.group.shareAmountWei),
    round.group.totalMembers,
    round.roundNumber,
    round.group.roundDurationSec
  );
  let amount: bigint;
  try {
    amount = BigInt(amountWei);
  } catch {
    return NextResponse.json({ error: "amountWei không hợp lệ" }, { status: 400 });
  }
  if (amount < BigInt(0)) {
    return NextResponse.json({ error: "Mức lãi không được âm." }, { status: 400 });
  }
  if (cap > BigInt(0) && amount > cap) {
    return NextResponse.json(
      { error: "Mức lãi kêu vượt trần cho phép (20%/năm)." },
      { status: 422 }
    );
  }

  const bid = await prisma.bid.create({
    data: {
      roundId,
      userId: user.id,
      amountWei,
      txHash: typeof txHash === "string" ? txHash : null,
    },
  });

  return NextResponse.json({ bid });
}

// Danh sách bid của 1 vòng đấu (mới nhất trước) — dùng để hiển thị realtime.
export async function GET(req: NextRequest) {
  const roundId = req.nextUrl.searchParams.get("roundId");
  if (!roundId) {
    return NextResponse.json({ error: "Thiếu roundId" }, { status: 400 });
  }

  if (MOCK_MODE) return NextResponse.json(mockBids());

  const bids = await prisma.bid.findMany({
    where: { roundId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bids });
}
