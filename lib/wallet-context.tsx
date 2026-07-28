"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BrowserProvider } from "ethers";
import { CHAIN_ID } from "./contract";

type WalletState = {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
};

type WalletContextValue = WalletState & {
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  switchToSepolia: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

const SEPOLIA_HEX_CHAIN_ID = `0x${CHAIN_ID.toString(16)}`;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  // Upsert User trong DB ngay khi biết địa chỉ ví — backend chỉ ghi nhận, không giữ tiền.
  const syncUser = useCallback(async (walletAddress: string) => {
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
    } catch {
      // Lỗi backend tạm thời không nên chặn trải nghiệm dùng ví.
    }
  }, []);

  // Kiểm tra ví đã cấp quyền sẵn chưa (không hiện popup) mỗi khi load trang.
  const refreshFromProvider = useCallback(async () => {
    if (!window.ethereum) return;
    const provider = new BrowserProvider(window.ethereum);
    const [accounts, network] = await Promise.all([
      provider.listAccounts(),
      provider.getNetwork(),
    ]);
    const address = accounts[0]?.address ?? null;
    setState((s) => ({ ...s, address, chainId: Number(network.chainId) }));
    if (address) await syncUser(address);
  }, [syncUser]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((s) => ({ ...s, error: "Chưa cài đặt MetaMask." }));
      return;
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
      const network = await provider.getNetwork();
      setState({
        address: accounts[0] ?? null,
        chainId: Number(network.chainId),
        isConnecting: false,
        error: null,
      });
      if (accounts[0]) await syncUser(accounts[0]);
    } catch (err) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err instanceof Error ? err.message : "Kết nối ví thất bại.",
      }));
    }
  }, [syncUser]);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_HEX_CHAIN_ID }],
      });
    } catch (err) {
      // Mã lỗi 4902: mạng chưa tồn tại trong ví -> yêu cầu thêm mới Sepolia.
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_HEX_CHAIN_ID,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  }, []);

  useEffect(() => {
    refreshFromProvider();

    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      const address = accounts[0] ?? null;
      setState((s) => ({ ...s, address }));
      if (address) syncUser(address);
    };
    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      setState((s) => ({ ...s, chainId: parseInt(chainIdHex, 16) }));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
    // Chỉ chạy 1 lần khi mount — refreshFromProvider/syncUser đã ổn định qua useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCorrectNetwork = state.chainId === CHAIN_ID;

  return (
    <WalletContext.Provider
      value={{ ...state, isCorrectNetwork, connect, switchToSepolia }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet phải được dùng bên trong <WalletProvider>");
  return ctx;
}
