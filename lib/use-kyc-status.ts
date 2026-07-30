"use client";

import { useCallback, useEffect, useState } from "react";

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";

export function useKycStatus(address: string | null) {
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!address) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/kyc?walletAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.kyc?.status ?? null);
      } else {
        // Fail-safe: đừng để trạng thái của địa chỉ ví trước đó (vd: VERIFIED)
        // còn sót lại khi đổi sang địa chỉ khác chưa có User trong DB.
        setStatus(null);
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { status, loading, refetch };
}
