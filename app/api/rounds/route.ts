import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Lấy vòng đấu hiện tại của 1 group; tự tạo vòng mới nếu vòng gần nhất đã settled.
// Vòng đấu thật sự được điều khiển bởi smart contract — đây chỉ là bản ghi tổng
// hợp phía off-chain để hiển thị UI (đồng hồ đếm ngược, danh sách bid...).
//
// Lưu ý: PHẢI lấy theo roundNumber lớn nhất, KHÔNG lọc theo bidClosed=false — nếu
// một vòng cũ hơn vì lý do gì đó không bao giờ được đóng (vd: race điều kiện tạo
// vòng khiến vòng sau được tạo trước khi vòng trước kịp đóng), lọc theo bidClosed
// sẽ kẹt mãi ở vòng cũ đó dù dây hụi thực tế đã tiến sang vòng mới hơn.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const groupId = body?.groupId;

  if (typeof groupId !== "string" || !groupId) {
    return NextResponse.json({ error: "Thiếu groupId" }, { status: 400 });
  }

  const lastRound = await prisma.round.findFirst({
    where: { groupId },
    orderBy: { roundNumber: "desc" },
    include: { winner: true },
  });
  if (lastRound && !lastRound.settled) {
    return NextResponse.json({ round: lastRound });
  }

  try {
    const round = await prisma.round.create({
      data: {
        groupId,
        roundNumber: (lastRound?.roundNumber ?? 0) + 1,
      },
      include: { winner: true },
    });
    return NextResponse.json({ round });
  } catch (err) {
    // Race: request khác đã tạo vòng này trước (đụng unique [groupId, roundNumber]) —
    // lấy lại bản ghi vừa được tạo thay vì báo lỗi.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const round = await prisma.round.findFirst({
        where: { groupId },
        orderBy: { roundNumber: "desc" },
        include: { winner: true },
      });
      return NextResponse.json({ round });
    }
    throw err;
  }
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
