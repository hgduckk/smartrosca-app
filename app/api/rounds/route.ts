import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lấy vòng đấu hiện tại (chưa đóng bid) của 1 group; tự tạo vòng mới nếu chưa có.
// Vòng đấu thật sự được điều khiển bởi smart contract — đây chỉ là bản ghi tổng
// hợp phía off-chain để hiển thị UI (đồng hồ đếm ngược, danh sách bid...).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const groupId = body?.groupId;

  if (typeof groupId !== "string" || !groupId) {
    return NextResponse.json({ error: "Thiếu groupId" }, { status: 400 });
  }

  const openRound = await prisma.round.findFirst({
    where: { groupId, bidClosed: false },
    orderBy: { roundNumber: "desc" },
    include: { winner: true },
  });
  if (openRound) {
    return NextResponse.json({ round: openRound });
  }

  const lastRound = await prisma.round.findFirst({
    where: { groupId },
    orderBy: { roundNumber: "desc" },
  });

  const round = await prisma.round.create({
    data: {
      groupId,
      roundNumber: (lastRound?.roundNumber ?? 0) + 1,
    },
    include: { winner: true },
  });

  return NextResponse.json({ round });
}

// Lịch sử tất cả vòng đấu của 1 group (dùng lại cho dashboard ở Giai đoạn 5).
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) {
    return NextResponse.json({ error: "Thiếu groupId" }, { status: 400 });
  }

  const rounds = await prisma.round.findMany({
    where: { groupId },
    orderBy: { roundNumber: "asc" },
    include: { winner: true },
  });

  return NextResponse.json({ rounds });
}
