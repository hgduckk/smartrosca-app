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

  const group = await prisma.huiGroup.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) {
    return NextResponse.json({ error: "Không tìm thấy dây hụi" }, { status: 404 });
  }

  const alreadyMember = group.members.some((m) => m.userId === user.id);
  // Chặn tham gia khi dây đã đầy (khớp với contract sẽ revert "Day da du thanh vien").
  if (!alreadyMember && group.members.length >= group.totalMembers) {
    return NextResponse.json({ error: "Dây hụi đã đầy thành viên" }, { status: 409 });
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

  // Khi đủ số thành viên → dây chuyển sang ACTIVE và rời khỏi danh sách "đang mở".
  const memberCount = alreadyMember ? group.members.length : group.members.length + 1;
  if (group.status === "OPEN" && memberCount >= group.totalMembers) {
    await prisma.huiGroup.update({
      where: { id: groupId },
      data: { status: "ACTIVE" },
    });
  }

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
