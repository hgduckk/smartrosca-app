import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Upsert User theo địa chỉ ví. Gọi mỗi khi user kết nối MetaMask.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const walletAddress = body?.walletAddress;

  if (typeof walletAddress !== "string" || !walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const address = walletAddress.toLowerCase();

  const user = await prisma.user.upsert({
    where: { walletAddress: address },
    update: {},
    create: {
      walletAddress: address,
      kycRecord: { create: {} },
    },
    include: { kycRecord: true },
  });

  return NextResponse.json({ user });
}

export async function GET(req: NextRequest) {
  const walletAddress = req.nextUrl.searchParams.get("walletAddress");
  if (!walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: { kycRecord: true },
  });

  return NextResponse.json({ user });
}
