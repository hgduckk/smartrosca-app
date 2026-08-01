import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MODE, mockDashboard } from "@/lib/mock";

// Tổng hợp dữ liệu cho dashboard: các dây hụi đang tham gia (trạng thái từng kỳ),
// credit score hiện tại + lịch sử thay đổi, và lịch sử giao dịch (tx hash) đã ghi
// nhận qua app này — đây chính là bằng chứng minh bạch on-chain (BidPlaced,
// RoundClosed, Payout tương ứng với Bid/Round.closeRoundTxHash/Round.payoutTxHash).
export async function GET(req: NextRequest) {
  if (MOCK_MODE) return NextResponse.json(mockDashboard());

  const walletAddress = req.nextUrl.searchParams.get("walletAddress");
  if (!walletAddress) {
    return NextResponse.json({ error: "Thiếu walletAddress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: {
      creditScore: true,
      creditScoreEvents: { orderBy: { createdAt: "desc" }, take: 20 },
      bids: { include: { round: { include: { group: true } } } },
      contributions: { include: { round: { include: { group: true } } } },
      huiMembers: {
        include: {
          group: {
            include: {
              rounds: { orderBy: { roundNumber: "asc" }, include: { winner: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Chưa có user — kết nối ví trước" }, { status: 404 });
  }

  const contributionByRoundId = new Map(user.contributions.map((c) => [c.roundId, c]));

  const memberships = user.huiMembers.map((m) => ({
    groupId: m.group.id,
    groupName: m.group.name,
    hasWon: m.hasWon,
    wonRound: m.wonRound,
    rounds: m.group.rounds.map((r) => {
      const isSelfWinner = r.winnerUserId === user.id;
      const wasAlreadyDead = m.wonRound !== null && m.wonRound < r.roundNumber;
      const contribution = contributionByRoundId.get(r.id) ?? null;

      return {
        roundId: r.id,
        roundNumber: r.roundNumber,
        bidClosed: r.bidClosed,
        settled: r.settled,
        winnerAddress: r.winner?.walletAddress ?? null,
        isSelfWinner,
        status: isSelfWinner ? "winner" : wasAlreadyDead ? "dead" : "survivor",
        requiredWei: isSelfWinner
          ? null
          : wasAlreadyDead
            ? r.requiredFromDeadWei
            : r.requiredFromSurvivorWei,
        contributed: Boolean(contribution),
        contributionOnTime: contribution?.onTime ?? null,
      };
    }),
  }));

  type HistoryItem = {
    type: string;
    groupName: string;
    txHash: string;
    createdAt: string;
  };
  const history: HistoryItem[] = [];

  for (const m of user.huiMembers) {
    // Người tạo dây (organizer) thấy giao dịch deploy contract của chính họ.
    if (m.group.createTxHash && m.group.creatorUserId === user.id) {
      history.push({
        type: "Tạo dây hụi",
        groupName: m.group.name,
        txHash: m.group.createTxHash,
        createdAt: m.group.createdAt.toISOString(),
      });
    }
    if (m.joinTxHash) {
      history.push({
        type: "Tham gia dây hụi",
        groupName: m.group.name,
        txHash: m.joinTxHash,
        createdAt: m.createdAt.toISOString(),
      });
    }
    for (const r of m.group.rounds) {
      if (r.closeRoundTxHash) {
        history.push({
          type: `Chốt vòng đấu — Kỳ ${r.roundNumber}`,
          groupName: m.group.name,
          txHash: r.closeRoundTxHash,
          createdAt: r.createdAt.toISOString(),
        });
      }
      if (r.payoutTxHash) {
        history.push({
          type: `Giải ngân — Kỳ ${r.roundNumber}`,
          groupName: m.group.name,
          txHash: r.payoutTxHash,
          createdAt: r.createdAt.toISOString(),
        });
      }
    }
  }
  for (const b of user.bids) {
    if (b.txHash) {
      history.push({
        type: `Đặt bid — Kỳ ${b.round.roundNumber}`,
        groupName: b.round.group.name,
        txHash: b.txHash,
        createdAt: b.createdAt.toISOString(),
      });
    }
  }
  for (const c of user.contributions) {
    if (c.txHash) {
      history.push({
        type: `Đóng góp — Kỳ ${c.round.roundNumber}`,
        groupName: c.round.group.name,
        txHash: c.txHash,
        createdAt: c.createdAt.toISOString(),
      });
    }
  }
  history.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({
    creditScore: user.creditScore ?? { score: 500, updatedAt: null },
    creditScoreEvents: user.creditScoreEvents,
    memberships,
    history,
  });
}
