"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatEther } from "ethers";
import { RequireVerifiedKyc } from "@/components/RequireVerifiedKyc";
import { useWallet } from "@/lib/wallet-context";
import { getBrowserSigner, joinGroupOnChain } from "@/lib/contract";

type Group = {
  id: string;
  name: string;
  contractAddress: string | null;
  shareAmountWei: string;
  collateralWei: string;
  totalMembers: number;
  roundDurationSec: number;
  bidDurationSec: number;
  members: { id: string }[];
};

function formatEth(wei: string) {
  try {
    return formatEther(wei);
  } catch {
    return wei;
  }
}

function GroupsList() {
  const { address } = useWallet();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txLinks, setTxLinks] = useState<Record<string, string>>({});

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleJoin = async (group: Group) => {
    if (!address) return;
    setJoiningId(group.id);
    setError(null);
    try {
      if (!group.contractAddress) {
        throw new Error("Dây hụi này chưa có địa chỉ contract hợp lệ.");
      }
      // 1. Join + ký quỹ trên smart contract trước.
      const signer = await getBrowserSigner();
      const { txHash } = await joinGroupOnChain(
        signer,
        group.contractAddress,
        BigInt(group.collateralWei)
      );

      // 2. Backend chỉ ghi nhận kết quả (joinTxHash).
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          walletAddress: address,
          joinTxHash: txHash,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Tham gia thất bại");
      }

      setTxLinks((links) => ({ ...links, [group.id]: txHash }));
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Đang tải danh sách dây hụi...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Các dây hụi đang mở</h1>
      {error && <p className="error-text">{error}</p>}
      {groups.length === 0 && <p className="empty-state">Chưa có dây hụi nào đang mở.</p>}
      <ul className="list-plain">
        {groups.map((g) => (
          <li key={g.id} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: 0 }}>{g.name}</h2>
              <span className="badge badge-neutral">
                {g.members.length}/{g.totalMembers} thành viên
              </span>
            </div>
            <p className="muted" style={{ margin: "0.5rem 0" }}>
              Phần hụi/kỳ: <strong>{formatEth(g.shareAmountWei)} ETH</strong> · Ký quỹ:{" "}
              <strong>{formatEth(g.collateralWei)} ETH</strong>
            </p>
            <p className="muted" style={{ marginTop: 0 }}>
              Kỳ: {Math.round(g.roundDurationSec / 86400)} ngày · Đấu giá:{" "}
              {Math.round(g.bidDurationSec / 60)} phút
            </p>
            <div className="row">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleJoin(g)}
                disabled={joiningId === g.id}
              >
                {joiningId === g.id ? "Đang tham gia..." : "Tham gia"}
              </button>
              <Link href={`/groups/${g.id}/bid`} className="btn btn-outline btn-sm">
                Vào phòng đấu giá
              </Link>
            </div>
            {txLinks[g.id] && (
              <p style={{ marginBottom: 0 }}>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txLinks[g.id]}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem giao dịch trên Etherscan
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function GroupsPage() {
  return (
    <RequireVerifiedKyc>
      <GroupsList />
    </RequireVerifiedKyc>
  );
}
