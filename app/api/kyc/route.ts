import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Đọc trạng thái KYC hiện tại của user theo địa chỉ ví.
export async function GET(req: NextRequest) {
  const walletAddress = req.nextUrl.searchParams.get("walletAddress");
  if (!walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: { kycRecord: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Chưa có user — kết nối ví trước" }, { status: 404 });
  }

  return NextResponse.json({ kyc: user.kycRecord });
}

// Mock xác thực eKYC: đánh dấu VERIFIED ngay lập tức.
// Ảnh CCCD/khuôn mặt KHÔNG được gửi lên đây và KHÔNG lưu trữ ở đâu cả — chỉ có
// mockDocType (vd: "image/png") để log lại loại tài liệu giả lập đã "nộp".
export async function POST(req: NextRequest) {
  const body = await req.json();
  const walletAddress = body?.walletAddress;
  const mockDocType = typeof body?.mockDocType === "string" ? body.mockDocType : null;

  if (typeof walletAddress !== "string" || !walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: "Chưa có user — kết nối ví trước" }, { status: 404 });
  }

  const kyc = await prisma.kycRecord.upsert({
    where: { userId: user.id },
    update: { status: "VERIFIED", mockDocType, verifiedAt: new Date() },
    create: { userId: user.id, status: "VERIFIED", mockDocType, verifiedAt: new Date() },
  });

  return NextResponse.json({ kyc });
}
