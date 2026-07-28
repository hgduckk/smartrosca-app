"use client";

import { useCallback, useEffect, useState } from "react";

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";

export function useKycStatus(address: string | null) {
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!address) {
      setStatus(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/kyc?walletAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.kyc?.status ?? null);
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
