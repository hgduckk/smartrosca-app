import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyCreditScoreDelta,
  CONTRIBUTION_LATE_DELTA,
  CONTRIBUTION_ON_TIME_DELTA,
} from "@/lib/credit-score";
import { MOCK_MODE, MOCK_ADDRESS, mockTxHash } from "@/lib/mock";

// Lưu 1 khoản đóng góp — gọi SAU KHI đã contribute() thành công trên smart contract.
// Đồng thời cập nhật credit score: cộng điểm nếu đóng đúng hạn, trừ điểm nếu trễ hạn.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roundId, walletAddress, amountWei, txHash, onTime } = body ?? {};

  if (MOCK_MODE) {
    return NextResponse.json({
      contribution: { id: `ct-${Date.now()}`, roundId, amountWei, onTime: onTime ?? true, txHash: txHash ?? mockTxHash() },
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
    return NextResponse.json({ error: "Thiếu dữ liệu đóng góp" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Chưa có user — kết nối ví trước" }, { status: 404 });
  }

  const isOnTime = typeof onTime === "boolean" ? onTime : true;

  const contribution = await prisma.contribution.create({
    data: {
      roundId,
      userId: user.id,
      amountWei,
      txHash: typeof txHash === "string" ? txHash : null,
      onTime: isOnTime,
    },
  });

  await applyCreditScoreDelta(
    user.id,
    isOnTime ? CONTRIBUTION_ON_TIME_DELTA : CONTRIBUTION_LATE_DELTA,
    isOnTime ? "Đóng góp đúng hạn" : "Đóng góp trễ hạn"
  );

  return NextResponse.json({ contribution });
}

// Danh sách đóng góp của 1 vòng đấu — dùng để biết ai đã đóng, ai chưa.
export async function GET(req: NextRequest) {
  const roundId = req.nextUrl.searchParams.get("roundId");
  if (!roundId) {
    return NextResponse.json({ error: "Thiếu roundId" }, { status: 400 });
  }

  if (MOCK_MODE) {
    return NextResponse.json({
      contributions: [
        { id: "ct-seed", amountWei: "450000000000000000", onTime: true, user: { walletAddress: MOCK_ADDRESS.toLowerCase() } },
      ],
    });
  }

  const contributions = await prisma.contribution.findMany({
    where: { roundId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ contributions });
}
