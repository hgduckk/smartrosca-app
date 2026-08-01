// ============================================================================
// CHẾ ĐỘ MOCK — có công tắc, dùng cho bản test giao diện.
//
// Bật/tắt bằng biến môi trường NEXT_PUBLIC_MOCK_MODE:
//   - Không đặt, hoặc khác "false"  => MOCK bật (mặc định cho bản test hiện tại).
//   - "false"                        => dùng code THẬT (ví MetaMask, contract, DB).
//
// Toàn bộ code ví / smart contract / Prisma vẫn được GIỮ NGUYÊN. Khi MOCK bật,
// các provider & API route rẽ sang nhánh trả dữ liệu giả để test được mọi trang
// mà không cần ví, mạng blockchain hay database. Giai đoạn thật chỉ cần đặt
// NEXT_PUBLIC_MOCK_MODE=false là chạy code thật như cũ.
// ============================================================================

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE !== "false";

// Địa chỉ ví giả để mọi UI phụ thuộc ví hiển thị như "đã kết nối".
export const MOCK_ADDRESS = "0xF00dCafe0000000000000000000000000000BEEF";

// Tx hash giả (0x + 64 hex ngẫu nhiên) cho các hành động on-chain mock.
export function mockTxHash() {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

// Địa chỉ contract giả cho dây hụi vừa "deploy".
export function mockContractAddress() {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

// Giả lập độ trễ mạng/blockchain để UI hiển thị trạng thái "đang xử lý".
export function mockDelay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

// Ví/kỳ hạn tính bằng wei dạng string (0.5 ETH, 1 ETH...) để khớp kiểu dữ liệu thật.
const ETH = (n: number) => BigInt(Math.round(n * 1e6)).toString() + "000000000000";

// --- Dữ liệu mẫu ---------------------------------------------------------

// Khoá lưu tạm thông tin đăng ký (trước khi đăng nhập) để các bước eKYC/OTP/đăng
// nhập trong luồng onboarding dùng lại. Chỉ tồn tại trong phiên trình duyệt.
export const PENDING_REG_KEY = "rosca-pending-reg";

export type PendingReg = {
  name: string;
  cccd: string;
  phone: string;
  email: string;
  password: string;
};

export function readPendingReg(): PendingReg | null {
  try {
    const raw = sessionStorage.getItem(PENDING_REG_KEY);
    return raw ? (JSON.parse(raw) as PendingReg) : null;
  } catch {
    return null;
  }
}

// Kết quả OCR giả lập cho CCCD — dùng ở bước "Kiểm tra thông tin" của eKYC.
// Giai đoạn thật sẽ thay bằng kết quả nhận diện từ dịch vụ OCR/eKYC.
export function mockCccdOcr() {
  return {
    name: "NGUYỄN VĂN A",
    cccd: "079203001234",
    dob: "01/01/1990",
    gender: "Nam",
    nationality: "Việt Nam",
    hometown: "Phường 1, TP. Đà Lạt, Lâm Đồng",
    residence: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  };
}

export function mockKyc() {
  return {
    kyc: {
      id: "mock-kyc",
      userId: "mock-user",
      status: "VERIFIED" as const,
      mockDocType: "image/png",
      verifiedAt: new Date().toISOString(),
    },
  };
}

export function mockGroupsList() {
  return {
    groups: [
      {
        id: "grp-xxx",
        name: "Hụi XXX",
        contractAddress: "0xAbc0000000000000000000000000000000000001",
        shareAmountWei: ETH(0.5),
        totalMembers: 10,
        collateralWei: ETH(1),
        roundDurationSec: 30 * 86400,
        bidDurationSec: 15 * 60,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        members: [{ id: "m1" }, { id: "m2" }, { id: "m3" }],
      },
      {
        id: "grp-yyy",
        name: "Hụi YYY",
        contractAddress: "0xAbc0000000000000000000000000000000000002",
        shareAmountWei: ETH(1),
        totalMembers: 12,
        collateralWei: ETH(2),
        roundDurationSec: 30 * 86400,
        bidDurationSec: 20 * 60,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        members: [{ id: "m4" }, { id: "m5" }],
      },
    ],
  };
}

export function mockGroupDetail(id: string) {
  return {
    group: {
      id,
      name: id === "grp-yyy" ? "Hụi YYY" : "Hụi XXX",
      contractAddress: "0xAbc0000000000000000000000000000000000001",
      shareAmountWei: ETH(0.5),
      totalMembers: 10,
      collateralWei: ETH(1),
      roundDurationSec: 30 * 86400,
      bidDurationSec: 15 * 60,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      members: [
        { userId: "mock-user", hasWon: false, wonRound: null, isActive: true, user: { walletAddress: MOCK_ADDRESS.toLowerCase() } },
        { userId: "u2", hasWon: true, wonRound: 1, isActive: true, user: { walletAddress: "0x1111111111111111111111111111111111111111" } },
        { userId: "u3", hasWon: false, wonRound: null, isActive: true, user: { walletAddress: "0x2222222222222222222222222222222222222222" } },
      ],
    },
  };
}

// --- Vòng đấu / bid (trang đấu giá) --------------------------------------

type MockRound = Record<string, unknown>;

export function mockRound(groupId: string, over: MockRound = {}) {
  return {
    round: {
      id: "mock-round-1",
      groupId,
      roundNumber: 1,
      createdAt: new Date().toISOString(),
      bidClosed: false,
      settled: false,
      winnerUserId: null,
      winner: null,
      winningBidWei: null,
      requiredFromSurvivorWei: null,
      requiredFromDeadWei: null,
      closeRoundTxHash: null,
      payoutTxHash: null,
      ...over,
    },
  };
}

export function mockBids() {
  return {
    bids: [
      { id: "b1", amountWei: "40000000000000000", user: { walletAddress: "0x1111111111111111111111111111111111111111" } },
      { id: "b2", amountWei: "55000000000000000", user: { walletAddress: MOCK_ADDRESS.toLowerCase() } },
    ],
  };
}

export function mockDashboard() {
  const now = Date.now();
  const iso = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();
  return {
    creditScore: { score: 720, updatedAt: iso(1) },
    creditScoreEvents: [
      { id: "e1", delta: 20, reason: "Đóng góp đúng hạn — Kỳ 2", createdAt: iso(1) },
      { id: "e2", delta: 20, reason: "Đóng góp đúng hạn — Kỳ 1", createdAt: iso(31) },
      { id: "e3", delta: 30, reason: "Hoàn tất xác thực eKYC", createdAt: iso(40) },
    ],
    memberships: [
      {
        groupId: "grp-xxx",
        groupName: "Hụi XXX",
        hasWon: false,
        wonRound: null,
        rounds: [
          { roundNumber: 1, roundId: "r1" },
          { roundNumber: 2, roundId: "r2" },
        ],
      },
      {
        groupId: "grp-yyy",
        groupName: "Hụi YYY",
        hasWon: true,
        wonRound: 1,
        rounds: [{ roundNumber: 1, roundId: "r3" }],
      },
    ],
    history: [
      { type: "Đóng góp — Kỳ 2", groupName: "Hụi XXX", txHash: "0xdeadbeef00000000000000000000000000000000000000000000000000000001", createdAt: iso(1) },
      { type: "Tham gia dây hụi", groupName: "Hụi YYY", txHash: "0xdeadbeef00000000000000000000000000000000000000000000000000000002", createdAt: iso(20) },
      { type: "Tạo dây hụi", groupName: "Hụi XXX", txHash: "0xdeadbeef00000000000000000000000000000000000000000000000000000003", createdAt: iso(45) },
    ],
  };
}
