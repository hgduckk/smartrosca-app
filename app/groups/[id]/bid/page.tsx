"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { RequireVerifiedKyc } from "@/components/RequireVerifiedKyc";
import { useWallet } from "@/lib/wallet-context";
import {
  closeRoundOnChain,
  contributeOnChain,
  getBrowserSigner,
  getCurrentMaxBidCapOnChain,
  getOrganizerOnChain,
  listenForBidPlaced,
  listenForMemberDefaulted,
  markDefaultOnChain,
  payoutOnChain,
  placeBidOnChain,
} from "@/lib/contract";
import { estimateMaxBidCapWei } from "@/lib/hui-math";

type Member = {
  userId: string;
  hasWon: boolean;
  user: { walletAddress: string };
};

type Group = {
  id: string;
  name: string;
  contractAddress: string | null;
  shareAmountWei: string;
  totalMembers: number;
  roundDurationSec: number;
  bidDurationSec: number;
  members: Member[];
};

type RoundData = {
  id: string;
  roundNumber: number;
  createdAt: string;
  bidClosed: boolean;
  settled: boolean;
  winnerUserId: string | null;
  winner: { walletAddress: string } | null;
  winningBidWei: string | null;
  requiredFromSurvivorWei: string | null;
  requiredFromDeadWei: string | null;
  closeRoundTxHash: string | null;
  payoutTxHash: string | null;
};

type BidData = {
  id: string;
  amountWei: string;
  user: { walletAddress: string };
};

type ContributionData = {
  id: string;
  userId: string;
  amountWei: string;
  user: { walletAddress: string };
};

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Đã hết giờ";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function BidRoom({ groupId }: { groupId: string }) {
  const { address } = useWallet();
  const [group, setGroup] = useState<Group | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [bids, setBids] = useState<BidData[]>([]);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [bidAmountEth, setBidAmountEth] = useState("");
  const [maxBidCapWei, setMaxBidCapWei] = useState<bigint | null>(null);
  const [maxBidCapIsOnChain, setMaxBidCapIsOnChain] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const [closingRound, setClosingRound] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [payingOut, setPayingOut] = useState(false);
  const [organizerAddress, setOrganizerAddress] = useState<string | null>(null);
  const [markingDefaultUserId, setMarkingDefaultUserId] = useState<string | null>(null);
  const [defaultedUserIds, setDefaultedUserIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadBids = useCallback(async (roundId: string) => {
    const res = await fetch(`/api/bids?roundId=${roundId}`);
    const data = await res.json();
    setBids(data.bids ?? []);
  }, []);

  const loadContributions = useCallback(async (roundId: string) => {
    const res = await fetch(`/api/contributions?roundId=${roundId}`);
    const data = await res.json();
    setContributions(data.contributions ?? []);
  }, []);

  const loadGroupAndRound = useCallback(async () => {
    const groupRes = await fetch(`/api/groups/${groupId}`);
    const groupData = await groupRes.json();
    if (!groupRes.ok) {
      setError(groupData.error ?? "Không tải được dây hụi");
      return;
    }
    setGroup(groupData.group);

    const roundRes = await fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    const roundData = await roundRes.json();
    if (!roundRes.ok) {
      setError(roundData.error ?? "Không tạo được vòng đấu");
      return;
    }
    setRound(roundData.round);
    await loadBids(roundData.round.id);
    if (roundData.round.bidClosed) {
      await loadContributions(roundData.round.id);
    }
  }, [groupId, loadBids, loadContributions]);

  useEffect(() => {
    loadGroupAndRound();
  }, [loadGroupAndRound]);

  // Đồng hồ đếm ngược — tick mỗi giây.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling danh sách bid mỗi 4 giây — thay thế tạm cho realtime event khi contract
  // chưa deploy. listenForBidPlaced bên dưới sẽ tự thay bằng event thật ngay khi
  // contract sẵn sàng (không cần sửa UI).
  useEffect(() => {
    if (!round || round.bidClosed) return;
    const timer = setInterval(() => loadBids(round.id), 4000);
    return () => clearInterval(timer);
  }, [round, loadBids]);

  // Lắng nghe event BidPlaced thật từ contract (no-op nếu chưa cấu hình ABI).
  useEffect(() => {
    if (!group?.contractAddress || !round) return;
    const unsubscribe = listenForBidPlaced(group.contractAddress, () => {
      loadBids(round.id);
    });
    return unsubscribe;
  }, [group?.contractAddress, round, loadBids]);

  // Lắng nghe event MemberDefaulted từ contract để trừ điểm credit score.
  useEffect(() => {
    if (!group?.contractAddress) return;
    const unsubscribe = listenForMemberDefaulted(group.contractAddress, (memberAddress) => {
      fetch("/api/members/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: memberAddress }),
      });
    });
    return unsubscribe;
  }, [group?.contractAddress]);

  // Đọc trần lãi ĐỘNG của kỳ hiện tại thật từ contract (currentMaxBidCap()) — ưu
  // tiên tuyệt đối vì trần phụ thuộc kỳ đang diễn ra trên chain, không thể suy ra
  // chính xác chỉ từ dữ liệu DB phía client. Chỉ fallback về ước tính client-side
  // khi chưa có provider (chưa cài MetaMask).
  useEffect(() => {
    if (!group || !round) return;
    (async () => {
      const onChainCap = group.contractAddress
        ? await getCurrentMaxBidCapOnChain(group.contractAddress)
        : null;
      setMaxBidCapIsOnChain(onChainCap !== null);
      setMaxBidCapWei(
        onChainCap ??
          estimateMaxBidCapWei(
            BigInt(group.shareAmountWei),
            group.totalMembers,
            round.roundNumber,
            group.roundDurationSec
          )
      );
    })();
  }, [group, round]);

  // Đọc địa chỉ organizer thật từ contract — quyết định ai thấy nút "Đánh dấu vi phạm".
  useEffect(() => {
    if (!group?.contractAddress) return;
    getOrganizerOnChain(group.contractAddress).then(setOrganizerAddress);
  }, [group?.contractAddress]);

  const isOrganizer = Boolean(
    address && organizerAddress && address.toLowerCase() === organizerAddress.toLowerCase()
  );

  const deadline = useMemo(() => {
    if (!round || !group) return null;
    return new Date(round.createdAt).getTime() + group.bidDurationSec * 1000;
  }, [round, group]);

  const remainingMs = deadline ? deadline - now : 0;
  const isExpired = deadline !== null && remainingMs <= 0;

  const sortedBids = useMemo(
    () => [...bids].sort((a, b) => (BigInt(a.amountWei) > BigInt(b.amountWei) ? -1 : 1)),
    [bids]
  );
  const topBid = sortedBids[0] ?? null;

  const bidAmountWei = useMemo(() => {
    if (!bidAmountEth) return null;
    try {
      return parseEther(bidAmountEth);
    } catch {
      return null;
    }
  }, [bidAmountEth]);

  const exceedsCap =
    bidAmountWei !== null && maxBidCapWei !== null && bidAmountWei > maxBidCapWei;

  const handlePlaceBid = async () => {
    if (!address || !round || !group?.contractAddress || bidAmountWei === null) return;
    setPlacingBid(true);
    setError(null);
    try {
      // 1. Đặt bid trên smart contract trước (nguồn sự thật minh bạch).
      const signer = await getBrowserSigner();
      const { txHash } = await placeBidOnChain(signer, group.contractAddress, bidAmountWei);

      // 2. Backend chỉ ghi nhận kết quả.
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: round.id,
          walletAddress: address,
          amountWei: bidAmountWei.toString(),
          txHash,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Đặt bid thất bại");
      }
      setBidAmountEth("");
      await loadBids(round.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setPlacingBid(false);
    }
  };

  const handleCloseRound = async () => {
    if (!round || !group?.contractAddress) return;
    setClosingRound(true);
    setError(null);
    try {
      // 1. Chốt vòng đấu trên smart contract trước — contract quyết định người thắng.
      const signer = await getBrowserSigner();
      const result = await closeRoundOnChain(signer, group.contractAddress);

      // 2. Backend chỉ ghi nhận kết quả on-chain.
      const res = await fetch(`/api/rounds/${round.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerWalletAddress: result.winnerAddress,
          winningBidWei: result.winningBidWei.toString(),
          requiredFromSurvivorWei: result.requiredFromSurvivorWei.toString(),
          requiredFromDeadWei: result.requiredFromDeadWei.toString(),
          closeRoundTxHash: result.txHash,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Chốt vòng đấu thất bại");
      }
      const data = await res.json();
      setRound(data.round);
      setContributions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setClosingRound(false);
    }
  };

  // Người thắng kỳ này chỉ nhận tiền, không phải đóng góp ở kỳ này.
  const requiredMembers = useMemo(() => {
    if (!group || !round) return [];
    return group.members.filter((m) => m.userId !== round.winnerUserId);
  }, [group, round]);

  const requiredWeiFor = useCallback(
    (member: Member) => {
      if (!round) return null;
      return member.hasWon ? round.requiredFromDeadWei : round.requiredFromSurvivorWei;
    },
    [round]
  );

  const hasContributed = useCallback(
    (userId: string) => contributions.some((c) => c.userId === userId),
    [contributions]
  );

  const myMember = useMemo(
    () => requiredMembers.find((m) => m.user.walletAddress.toLowerCase() === address?.toLowerCase()),
    [requiredMembers, address]
  );

  const allContributed =
    requiredMembers.length > 0 && requiredMembers.every((m) => hasContributed(m.userId));

  // Hạn đóng góp của kỳ = round.startTime + roundDuration (cả kỳ, không phải riêng
  // bidDuration). Dùng để quyết định nút "Đánh dấu vi phạm" có bấm được chưa.
  const contributionDeadlineMs = useMemo(() => {
    if (!round || !group) return null;
    return new Date(round.createdAt).getTime() + group.roundDurationSec * 1000;
  }, [round, group]);
  const isPastContributionDeadline =
    contributionDeadlineMs !== null && now > contributionDeadlineMs;

  // Đánh dấu vi phạm — hành động THỦ CÔNG của organizer, không có gì tự động chạy
  // theo thời gian (blockchain không có cron/scheduler). Credit score của thành
  // viên sẽ tự giảm qua listener event MemberDefaulted đã đăng ký ở trên.
  const handleMarkDefault = async (member: Member) => {
    if (!group?.contractAddress) return;
    setMarkingDefaultUserId(member.userId);
    setError(null);
    try {
      const signer = await getBrowserSigner();
      await markDefaultOnChain(signer, group.contractAddress, member.user.walletAddress);
      setDefaultedUserIds((prev) => new Set(prev).add(member.userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setMarkingDefaultUserId(null);
    }
  };

  const handleContribute = async () => {
    if (!address || !round || !group?.contractAddress || !myMember) return;
    const requiredWei = requiredWeiFor(myMember);
    if (!requiredWei) return;
    setContributing(true);
    setError(null);
    try {
      // 1. Đóng góp trên smart contract trước.
      const signer = await getBrowserSigner();
      const { txHash } = await contributeOnChain(signer, group.contractAddress, BigInt(requiredWei));

      // 2. Backend chỉ ghi nhận kết quả.
      const onTime = Date.now() <= new Date(round.createdAt).getTime() + group.roundDurationSec * 1000;
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: round.id,
          walletAddress: address,
          amountWei: requiredWei,
          txHash,
          onTime,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Đóng góp thất bại");
      }
      await loadContributions(round.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setContributing(false);
    }
  };

  const handlePayout = async () => {
    if (!round || !group?.contractAddress) return;
    setPayingOut(true);
    setError(null);
    try {
      // 1. Giải ngân trên smart contract trước — contract chuyển tiền cho winner.
      const signer = await getBrowserSigner();
      const { txHash } = await payoutOnChain(signer, group.contractAddress);

      // 2. Backend chỉ ghi nhận kết quả.
      const res = await fetch(`/api/rounds/${round.id}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutTxHash: txHash }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Giải ngân thất bại");
      }
      const data = await res.json();
      setRound(data.round);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setPayingOut(false);
    }
  };

  if (!group || !round) {
    return (
      <main className="page">
        <p className="muted">Đang tải phòng đấu giá...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>
        {group.name} — Kỳ {round.roundNumber}
      </h1>

      {error && <p className="error-text">{error}</p>}

      {round.bidClosed ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Kết quả vòng đấu</h2>
          <p>Người thắng: <strong>{round.winner ? truncate(round.winner.walletAddress) : "—"}</strong></p>
          <p>Lãi thắng: {round.winningBidWei ? formatEther(round.winningBidWei) : "—"} ETH</p>
          <p>
            Hụi sống cần đóng:{" "}
            {round.requiredFromSurvivorWei ? formatEther(round.requiredFromSurvivorWei) : "—"} ETH
          </p>
          <p>
            Hụi chết cần đóng:{" "}
            {round.requiredFromDeadWei ? formatEther(round.requiredFromDeadWei) : "—"} ETH
          </p>
          {round.closeRoundTxHash && (
            <p>
              <a
                href={`https://sepolia.etherscan.io/tx/${round.closeRoundTxHash}`}
                target="_blank"
                rel="noreferrer"
              >
                Xem giao dịch chốt vòng trên Etherscan
              </a>
            </p>
          )}

          <hr className="divider" />

          <h3>Đóng góp kỳ này</h3>
          <ul className="list-plain">
            {requiredMembers.map((m) => {
              const requiredWei = requiredWeiFor(m);
              const paid = hasContributed(m.userId);
              const isDefaulted = defaultedUserIds.has(m.userId);
              const canMarkDefault = isOrganizer && !paid && !isDefaulted;
              return (
                <li key={m.userId} className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    {truncate(m.user.walletAddress)}{" "}
                    <span className="badge badge-neutral">{m.hasWon ? "hụi chết" : "hụi sống"}</span>{" "}
                    <span className="muted">
                      cần đóng {requiredWei ? formatEther(requiredWei) : "—"} ETH
                    </span>
                  </span>
                  <span className="row" style={{ gap: "0.4rem" }}>
                    <span
                      className={`badge ${
                        isDefaulted ? "badge-danger" : paid ? "badge-success" : "badge-neutral"
                      }`}
                    >
                      {isDefaulted ? "Vi phạm" : paid ? "Đã đóng ✓" : "Chưa đóng"}
                    </span>
                    {canMarkDefault && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleMarkDefault(m)}
                        disabled={!isPastContributionDeadline || markingDefaultUserId === m.userId}
                        title={!isPastContributionDeadline ? "Chưa tới hạn đóng góp" : undefined}
                      >
                        {markingDefaultUserId === m.userId ? "Đang xử lý..." : "Đánh dấu vi phạm"}
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          {myMember && !hasContributed(myMember.userId) && (
            <button className="btn btn-primary" onClick={handleContribute} disabled={contributing}>
              {contributing ? "Đang đóng góp..." : "Đóng góp"}
            </button>
          )}

          {round.settled ? (
            <div className="stack" style={{ marginTop: "1rem" }}>
              <span className="badge badge-success" style={{ alignSelf: "flex-start" }}>
                Đã giải ngân ✓
              </span>
              {round.payoutTxHash && (
                <p style={{ margin: 0 }}>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${round.payoutTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem giao dịch giải ngân trên Etherscan
                  </a>
                </p>
              )}
              <button className="btn btn-outline" onClick={loadGroupAndRound} style={{ alignSelf: "flex-start" }}>
                Sang kỳ tiếp theo
              </button>
            </div>
          ) : (
            <div className="stack" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                onClick={handlePayout}
                disabled={!allContributed || payingOut}
                style={{ alignSelf: "flex-start" }}
              >
                {payingOut ? "Đang giải ngân..." : "Giải ngân"}
              </button>
              {!allContributed && <p className="muted">Chờ tất cả thành viên đóng góp đủ.</p>}
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="row">
            Đồng hồ đếm ngược:{" "}
            <span className={`badge ${isExpired ? "badge-danger" : "badge-warning"}`}>
              {formatCountdown(remainingMs)}
            </span>
          </p>

          <div className="card">
            <label className="field">
              Mức lãi kêu (ETH)
              <input
                className="input"
                type="number"
                step="any"
                min="0"
                value={bidAmountEth}
                onChange={(e) => setBidAmountEth(e.target.value)}
                disabled={isExpired}
              />
            </label>
            {maxBidCapWei !== null && (
              <p className="muted" style={{ fontSize: "0.85rem" }}>
                {maxBidCapIsOnChain
                  ? `Trần lãi kỳ ${round.roundNumber} (đọc từ contract, 20%/năm):`
                  : `Trần lãi ước tính kỳ ${round.roundNumber} (~20%/năm):`}{" "}
                {formatEther(maxBidCapWei)} ETH
                {maxBidCapWei === BigInt(0) && " — kỳ cuối không còn kỳ nào để tính lãi"}
              </p>
            )}
            {exceedsCap && (
              <p style={{ color: "var(--color-warning)" }}>
                Cảnh báo: mức lãi kêu vượt trần{maxBidCapIsOnChain ? "" : " ước tính"} — smart
                contract sẽ từ chối giao dịch.
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={handlePlaceBid}
              disabled={isExpired || placingBid || bidAmountWei === null}
            >
              {placingBid ? "Đang đặt bid..." : "Đặt bid"}
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Danh sách bid hiện tại</h3>
            {sortedBids.length === 0 && <p className="empty-state">Chưa có ai đặt bid.</p>}
            <ul className="list-plain">
              {sortedBids.map((b) => (
                <li key={b.id} className="row" style={{ justifyContent: "space-between" }}>
                  <span>{truncate(b.user.walletAddress)}</span>
                  <span>
                    {formatEther(b.amountWei)} ETH{" "}
                    {topBid?.id === b.id && <span className="badge badge-success">cao nhất</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button className="btn btn-outline" onClick={handleCloseRound} disabled={!isExpired || closingRound}>
            {closingRound ? "Đang chốt..." : "Chốt vòng đấu"}
          </button>
        </>
      )}
    </main>
  );
}

export default function BidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireVerifiedKyc>
      <BidRoom groupId={id} />
    </RequireVerifiedKyc>
  );
}
