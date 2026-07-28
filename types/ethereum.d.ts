// Khai báo tối giản provider EIP-1193 mà MetaMask inject vào window.ethereum.
export interface Eip1193Provider {
  isMetaMask?: boolean;
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeListener(event: string, listener: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export {};
