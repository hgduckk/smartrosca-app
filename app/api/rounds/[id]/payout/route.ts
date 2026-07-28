import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Đánh dấu vòng đấu đã giải ngân — gọi SAU KHI đã payout() thành công trên smart
// contract (tiền đã chuyển cho winner). Kỳ kế tiếp sẽ tự được tạo khi thành viên
// quay lại trang đấu giá (xem POST /api/rounds).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const payoutTxHash = body?.payoutTxHash;

  if (typeof payoutTxHash !== "string" || !payoutTxHash) {
    return NextResponse.json({ error: "Thiếu payoutTxHash" }, { status: 400 });
  }

  const round = await prisma.round.update({
    where: { id },
    data: {
      settled: true,
      payoutTxHash,
    },
    include: { winner: true },
  });

  return NextResponse.json({ round });
}
