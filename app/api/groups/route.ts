import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tạo HuiGroup mới trong DB — gọi SAU KHI đã tạo group thành công trên smart contract,
// backend chỉ ghi nhận kết quả (contractAddress) chứ không tự tạo giao dịch.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    contractAddress,
    shareAmountWei,
    totalMembers,
    collateralWei,
    roundDurationSec,
    bidDurationSec,
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

  const group = await prisma.huiGroup.create({
    data: {
      name,
      contractAddress: typeof contractAddress === "string" ? contractAddress : null,
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
  const groups = await prisma.huiGroup.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { members: true },
  });

  return NextResponse.json({ groups });
}
