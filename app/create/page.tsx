"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseEther } from "ethers";
import { RequireVerifiedKyc } from "@/components/RequireVerifiedKyc";
import { createGroupOnChain, getBrowserSigner } from "@/lib/contract";

type FormState = {
  name: string;
  shareAmountEth: string;
  collateralEth: string;
  totalMembers: string;
  roundDurationDays: string;
  bidDurationMinutes: string;
};

const initialForm: FormState = {
  name: "",
  shareAmountEth: "",
  collateralEth: "",
  totalMembers: "",
  roundDurationDays: "",
  bidDurationMinutes: "",
};

function CreateGroupForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const shareAmountWei = parseEther(form.shareAmountEth || "0");
      const collateralWei = parseEther(form.collateralEth || "0");
      const totalMembers = Number(form.totalMembers);
      const roundDurationSec = Number(form.roundDurationDays) * 86400;
      const bidDurationSec = Number(form.bidDurationMinutes) * 60;

      if (!Number.isInteger(totalMembers) || totalMembers < 2) {
        throw new Error("Số thành viên phải là số nguyên và tối thiểu là 2.");
      }

      // 1. Tạo group trên smart contract trước (nguồn sự thật minh bạch, bất biến).
      const signer = await getBrowserSigner();
      const { contractAddress, txHash } = await createGroupOnChain(signer, {
        name: form.name,
        shareAmountWei,
        totalMembers,
        collateralWei,
        roundDurationSec,
        bidDurationSec,
      });

      // 2. Backend chỉ ghi nhận kết quả on-chain, không tự tạo giao dịch.
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contractAddress,
          shareAmountWei: shareAmountWei.toString(),
          collateralWei: collateralWei.toString(),
          totalMembers,
          roundDurationSec,
          bidDurationSec,
          createTxHash: txHash,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Tạo dây hụi thất bại");
      }

      router.push("/groups");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <h1>Tạo dây hụi mới</h1>
      <p className="muted">
        Bạn là người tạo dây và sẽ tự làm chủ họ — SmartROSCA chỉ ghi nhận dữ liệu
        minh bạch lên smart contract, không thay bạn quản lý tiền.
      </p>

      <form onSubmit={handleSubmit} className="card stack">
        <label className="field">
          Tên dây hụi
          <input
            required
            className="input"
            value={form.name}
            onChange={handleChange("name")}
          />
        </label>
        <label className="field">
          Số tiền mỗi phần hụi / kỳ (ETH)
          <input
            required
            className="input"
            type="number"
            step="any"
            min="0"
            value={form.shareAmountEth}
            onChange={handleChange("shareAmountEth")}
          />
        </label>
        <label className="field">
          Số tiền ký quỹ mỗi thành viên (ETH)
          <input
            required
            className="input"
            type="number"
            step="any"
            min="0"
            value={form.collateralEth}
            onChange={handleChange("collateralEth")}
          />
        </label>
        <label className="field">
          Số thành viên
          <input
            required
            className="input"
            type="number"
            min="2"
            value={form.totalMembers}
            onChange={handleChange("totalMembers")}
          />
        </label>
        <label className="field">
          Thời gian mỗi kỳ (ngày)
          <input
            required
            className="input"
            type="number"
            min="1"
            value={form.roundDurationDays}
            onChange={handleChange("roundDurationDays")}
          />
        </label>
        <label className="field">
          Thời gian đấu giá (phút)
          <input
            required
            className="input"
            type="number"
            min="1"
            value={form.bidDurationMinutes}
            onChange={handleChange("bidDurationMinutes")}
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Đang tạo..." : "Tạo dây hụi"}
        </button>
      </form>
    </main>
  );
}

export default function CreateGroupPage() {
  return (
    <RequireVerifiedKyc>
      <CreateGroupForm />
    </RequireVerifiedKyc>
  );
}
