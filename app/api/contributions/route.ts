import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  applyCreditScoreDelta,
  CONTRIBUTION_LATE_DELTA,
  CONTRIBUTION_ON_TIME_DELTA,
} from "@/lib/credit-score";
import { MOCK_MODE, MOCK_ADDRESS, mockTxHash } from "@/lib/mock";

// Lưu 1 khoản đóng góp — gọi SAU KHI đã contribute() thành công trên smart contract.
// Đồng thời cập nhật credit score: cộng điểm nếu đóng đúng hạn, trừ điểm nếu trễ hạn.
//
// Hai nguyên tắc bảo toàn tính đúng đắn của điểm tín nhiệm (Phần D & mục 15 PDF):
//  1. onTime được tính PHÍA SERVER từ round.createdAt + group.roundDurationSec —
//     KHÔNG tin giá trị onTime client gửi lên (client có thể luôn gửi true để né
//     điểm trừ). Server là nguồn sự thật duy nhất cho việc trễ/đúng hạn.
//  2. Idempotent theo unique [roundId, userId]: mỗi (kỳ, thành viên) chỉ ghi nhận
//     và chấm điểm đúng một lần, dù request bị gọi lại (reload, double-click).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roundId, walletAddress, amountWei, txHash } = body ?? {};

  if (MOCK_MODE) {
    return NextResponse.json({
      contribution: { id: `ct-${Date.now()}`, roundId, amountWei, onTime: true, txHash: txHash ?? mockTxHash() },
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

  // Tính đúng/trễ hạn PHÍA SERVER: hạn chót đóng góp của kỳ = round.createdAt +
  // roundDurationSec (dùng cả thời lượng kỳ làm hạn đóng góp — khớp cách contract
  // tính hạn markDefault). Nếu không đọc được round/group thì mặc định coi là đúng
  // hạn để không phạt oan do lỗi dữ liệu.
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { group: true },
  });
  const deadlineMs = round
    ? round.createdAt.getTime() + round.group.roundDurationSec * 1000
    : null;
  const isOnTime = deadlineMs === null ? true : Date.now() <= deadlineMs;

  try {
    const contribution = await prisma.contribution.create({
      data: {
        roundId,
        userId: user.id,
        amountWei,
        txHash: typeof txHash === "string" ? txHash : null,
        onTime: isOnTime,
      },
    });

    // Chỉ chấm điểm khi thực sự tạo mới bản ghi (lần đầu) — nếu đã đóng trước đó,
    // create ném P2002 và rơi xuống catch, KHÔNG chấm điểm lần nữa.
    await applyCreditScoreDelta(
      user.id,
      isOnTime ? CONTRIBUTION_ON_TIME_DELTA : CONTRIBUTION_LATE_DELTA,
      isOnTime ? "Đóng góp đúng hạn" : "Đóng góp trễ hạn"
    );

    return NextResponse.json({ contribution });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.contribution.findUnique({
        where: { roundId_userId: { roundId, userId: user.id } },
      });
      return NextResponse.json({ contribution: existing, alreadyContributed: true });
    }
    throw err;
  }
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
