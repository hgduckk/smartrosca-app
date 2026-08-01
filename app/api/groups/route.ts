import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MODE, mockGroupsList } from "@/lib/mock";

// Tạo HuiGroup mới trong DB — gọi SAU KHI đã tạo group thành công trên smart contract,
// backend chỉ ghi nhận kết quả (contractAddress) chứ không tự tạo giao dịch.
export async function POST(req: NextRequest) {
  if (MOCK_MODE) {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      group: { id: `grp-${Date.now()}`, ...body, status: "OPEN", createdAt: new Date().toISOString() },
    });
  }

  const body = await req.json();
  const {
    name,
    contractAddress,
    shareAmountWei,
    totalMembers,
    collateralWei,
    roundDurationSec,
    bidDurationSec,
    createTxHash,
    walletAddress,
  } = body ?? {};

  if (
    typeof name !== "string" ||
    !name ||
    typeof shareAmountWei !== "string" ||
    typeof collateralWei !== "string" ||
    typeof totalMembers !== "number" ||
    typeof roundDurationSec !== "number" ||
    typeof bidDurationSec !== "number"
  ) {
    return NextResponse.json({ error: "Thiếu hoặc sai kiểu dữ liệu" }, { status: 400 });
  }

  // Người tạo dây = organizer on-chain. Lưu creatorUserId để quy đúng createTxHash
  // cho họ trong lịch sử giao dịch (không gán nhầm cho các thành viên khác).
  let creatorUserId: string | null = null;
  if (typeof walletAddress === "string" && walletAddress) {
    const creator = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {},
      create: { walletAddress: walletAddress.toLowerCase() },
    });
    creatorUserId = creator.id;
  }

  const group = await prisma.huiGroup.create({
    data: {
      name,
      contractAddress: typeof contractAddress === "string" ? contractAddress : null,
      createTxHash: typeof createTxHash === "string" ? createTxHash : null,
      creatorUserId,
      shareAmountWei,
      totalMembers,
      collateralWei,
      roundDurationSec,
      bidDurationSec,
      status: "OPEN",
    },
  });

  return NextResponse.json({ group });
}

// Danh sách dây hụi đang mở (status = OPEN).
export async function GET() {
  if (MOCK_MODE) return NextResponse.json(mockGroupsList());

  const groups = await prisma.huiGroup.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { members: true },
  });

  return NextResponse.json({ groups });
}
