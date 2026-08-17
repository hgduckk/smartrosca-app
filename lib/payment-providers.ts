// ============================================================================
// Danh mục nguồn thanh toán (ngân hàng + ví điện tử) và lưu trữ tài khoản đã
// liên kết cho luồng "Tài khoản liên kết" / "Nguồn liên kết" (theo mẫu Figma).
//
// Giai đoạn hiện tại: MOCK — tài khoản liên kết được lưu trong localStorage để
// UI hoạt động đầy đủ (thêm/xoá/đặt mặc định) mà không cần cổng thanh toán thật.
// Khi sang giai đoạn thật, thay tầng lưu trữ này bằng API/DB, giữ nguyên UI.
// ============================================================================

export type ProviderKind = "bank" | "wallet";

export type Provider = {
  id: string;
  name: string;
  kind: ProviderKind;
  logo: string; // đường dẫn ảnh logo trong public/
};

export const BANKS: Provider[] = [
  { id: "vietcombank", name: "Vietcombank", kind: "bank", logo: "/bank-wallet-logo/vietcombank.png" },
  { id: "mbbank", name: "MB Bank", kind: "bank", logo: "/bank-wallet-logo/mbbank.png" },
  { id: "techcombank", name: "Techcombank", kind: "bank", logo: "/bank-wallet-logo/techcombank.jpg" },
  { id: "agribank", name: "Agribank", kind: "bank", logo: "/bank-wallet-logo/agribank.png" },
  { id: "tpbank", name: "TPBank", kind: "bank", logo: "/bank-wallet-logo/tpbank.jpg" },
  { id: "vpbank", name: "VPBank", kind: "bank", logo: "/bank-wallet-logo/vpbank.jpg" },
];

export const WALLETS: Provider[] = [
  { id: "momo", name: "MoMo", kind: "wallet", logo: "/bank-wallet-logo/momo.jpg" },
  { id: "zalopay", name: "ZaloPay", kind: "wallet", logo: "/bank-wallet-logo/zalopay.png" },
  { id: "shopeepay", name: "ShopeePay", kind: "wallet", logo: "/bank-wallet-logo/shopeepay.png" },
  { id: "vnpay", name: "VnPay", kind: "wallet", logo: "/bank-wallet-logo/vnpay.jpg" },
];

const ALL = [...BANKS, ...WALLETS];

export function findProvider(id: string): Provider | undefined {
  return ALL.find((p) => p.id === id);
}

// --- Tài khoản đã liên kết -------------------------------------------------

export type LinkedAccount = {
  id: string;
  providerId: string;
  kind: ProviderKind;
  holder: string; // tên chủ tài khoản
  number: string; // số tài khoản / số điện thoại ví (dạng đầy đủ)
  branch?: string; // chi nhánh (chỉ ngân hàng)
  isDefault: boolean;
};

const STORAGE_KEY = "rosca-linked-accounts";

// Dữ liệu seed khớp mẫu Figma "Tài khoản liên kết" (Vietcombank mặc định, MB
// Bank, MoMo) — dùng khi chưa có gì trong localStorage.
function seed(): LinkedAccount[] {
  return [
    { id: "acc-vcb", providerId: "vietcombank", kind: "bank", holder: "Nguyễn Văn A", number: "12345678987", branch: "Hồ Chí Minh", isDefault: true },
    { id: "acc-mb", providerId: "mbbank", kind: "bank", holder: "Nguyễn Văn A", number: "98765432789", branch: "Hồ Chí Minh", isDefault: false },
    { id: "acc-momo", providerId: "momo", kind: "wallet", holder: "Nguyễn Văn A", number: "0901234567", isDefault: false },
  ];
}

export function readLinkedAccounts(): LinkedAccount[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as LinkedAccount[];
  } catch {
    return seed();
  }
}

function write(accounts: LinkedAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    /* bỏ qua */
  }
}

export function addLinkedAccount(
  input: Omit<LinkedAccount, "id" | "isDefault"> & { isDefault?: boolean },
): LinkedAccount {
  const accounts = readLinkedAccounts();
  const account: LinkedAccount = {
    ...input,
    id: `acc-${Date.now().toString(36)}`,
    // Tài khoản đầu tiên tự động thành mặc định.
    isDefault: input.isDefault ?? accounts.length === 0,
  };
  const next = account.isDefault
    ? [...accounts.map((a) => ({ ...a, isDefault: false })), account]
    : [...accounts, account];
  write(next);
  return account;
}

export function setDefaultAccount(id: string) {
  write(readLinkedAccounts().map((a) => ({ ...a, isDefault: a.id === id })));
}

export function removeLinkedAccount(id: string) {
  const rest = readLinkedAccounts().filter((a) => a.id !== id);
  // Nếu xoá tài khoản mặc định thì đề cử tài khoản đầu còn lại làm mặc định.
  if (rest.length && !rest.some((a) => a.isDefault)) rest[0].isDefault = true;
  write(rest);
}

// Che số tài khoản/ví, chỉ chừa vài ký tự cuối (khớp mẫu Figma xxxxxxxx987).
export function maskNumber(kind: ProviderKind, number: string): string {
  const clean = number.replace(/\s+/g, "");
  if (kind === "wallet") {
    const last = clean.slice(-3);
    return `09xx xxx ${last}`;
  }
  const last = clean.slice(-3);
  return `${"x".repeat(Math.max(clean.length - 3, 8))}${last}`;
}
