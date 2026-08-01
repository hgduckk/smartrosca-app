import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyCreditScoreDelta, MEMBER_DEFAULT_DELTA } from "@/lib/credit-score";
import { MOCK_MODE, mockTxHash } from "@/lib/mock";

// Ghi nhận 1 thành viên bị đánh dấu vi phạm trong 1 kỳ ([id] = roundId) và trừ
// điểm credit score ĐÚNG MỘT LẦN. Gọi từ organizer sau khi markDefault() on-chain
// thành công. Unique [roundId, userId] đảm bảo idempotency: dù bị gọi lại (reload,
// nhiều client nghe event), điểm chỉ bị trừ một lần cho mỗi (kỳ, thành viên).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roundId } = await params;
  const body = await req.json();
  const walletAddress = body?.walletAddress;
  const txHash = typeof body?.txHash === "string" ? body.txHash : null;

  if (MOCK_MODE) {
    return NextResponse.json({
      default: { id: `def-${Date.now()}`, roundId, txHash: txHash ?? mockTxHash() },
      penalized: true,
    });
  }

  if (typeof walletAddress !== "string" || !walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  }

  try {
    const roundDefault = await prisma.roundDefault.create({
      data: { roundId, userId: user.id, txHash },
    });
    // Chỉ trừ điểm khi thực sự tạo mới bản ghi (lần đầu) — nhánh này không chạy lại
    // khi đã tồn tại vì create sẽ ném P2002 và rơi xuống catch bên dưới.
    await applyCreditScoreDelta(
      user.id,
      MEMBER_DEFAULT_DELTA,
      "Vi phạm: bỏ đóng góp (MemberDefaulted)"
    );
    return NextResponse.json({ default: roundDefault, penalized: true });
  } catch (err) {
    // Đã đánh dấu trước đó (unique roundId+userId) → không trừ điểm lần nữa.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.roundDefault.findUnique({
        where: { roundId_userId: { roundId, userId: user.id } },
      });
      return NextResponse.json({ default: existing, penalized: false });
    }
    throw err;
  }
}

// Danh sách thành viên bị đánh dấu vi phạm trong kỳ — để UI hiển thị badge "Vi phạm"
// và loại họ khỏi điều kiện "tất cả đã đóng" khi mở khóa nút Giải ngân.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roundId } = await params;

  if (MOCK_MODE) return NextResponse.json({ defaults: [] });

  const defaults = await prisma.roundDefault.findMany({
    where: { roundId },
  });
  return NextResponse.json({ defaults });
}
