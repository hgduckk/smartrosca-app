import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ghi nhận thành viên tham gia dây hụi — gọi SAU KHI đã join() + ký quỹ thành công
// trên smart contract, backend chỉ lưu lại joinTxHash làm bằng chứng.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { groupId, walletAddress, joinTxHash } = body ?? {};

  if (
    typeof groupId !== "string" ||
    !groupId ||
    typeof walletAddress !== "string" ||
    !walletAddress
  ) {
    return NextResponse.json({ error: "Thiếu groupId hoặc walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Chưa có user — kết nối ví trước" }, { status: 404 });
  }

  const member = await prisma.huiMember.upsert({
    where: { groupId_userId: { groupId, userId: user.id } },
    update: {},
    create: {
      groupId,
      userId: user.id,
      joinTxHash: typeof joinTxHash === "string" ? joinTxHash : null,
    },
  });

  return NextResponse.json({ member });
}

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) {
    return NextResponse.json({ error: "Thiếu groupId" }, { status: 400 });
  }

  const members = await prisma.huiMember.findMany({
    where: { groupId },
    include: { user: true },
  });

  return NextResponse.json({ members });
}
