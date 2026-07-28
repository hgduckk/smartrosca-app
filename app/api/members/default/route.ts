import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyCreditScoreDelta, MEMBER_DEFAULT_DELTA } from "@/lib/credit-score";

// Ghi nhận phạt credit score khi contract phát sự kiện MemberDefaulted (thành viên
// bỏ đóng góp). Gọi từ listener lib/contract.ts#listenForMemberDefaulted.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const walletAddress = body?.walletAddress;

  if (typeof walletAddress !== "string" || !walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  }

  await applyCreditScoreDelta(
    user.id,
    MEMBER_DEFAULT_DELTA,
    "Vi phạm: bỏ đóng góp (MemberDefaulted)"
  );

  return NextResponse.json({ ok: true });
}
