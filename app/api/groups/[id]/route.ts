import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MODE, mockGroupDetail } from "@/lib/mock";

// Chi tiết 1 dây hụi kèm danh sách thành viên — dùng cho trang đấu giá.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (MOCK_MODE) return NextResponse.json(mockGroupDetail(id));

  const group = await prisma.huiGroup.findUnique({
    where: { id },
    include: { members: { include: { user: true } } },
  });

  if (!group) {
    return NextResponse.json({ error: "Không tìm thấy dây hụi" }, { status: 404 });
  }

  return NextResponse.json({ group });
}
