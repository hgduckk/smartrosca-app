import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MODE, mockBids, mockTxHash } from "@/lib/mock";

// Lưu 1 bid vào DB — gọi SAU KHI đã placeBid() thành công trên smart contract.
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
