// ============================================================================
// Dữ liệu mẫu (mock) cho các màn chi tiết dây hụi & tham gia hụi — dựng theo
// mẫu Figma ("Thông tin hụi đã tham gia", "Lịch sử đấu giá", "Tham gia hụi").
// Giai đoạn UI: dữ liệu tĩnh, keyed theo id. Giai đoạn thật thay bằng API/DB.
// ============================================================================

export type HuiOverview = {
  name: string;
  sharePerRound: string; // "500.000 đ"
  memberCount: number;
  progressRound: number; // kỳ hiển thị ở thanh tiến độ
  totalRounds: number;
  progressPercent: number;
  paidLabel: string; // "4.000.000 đ"
  targetLabel: string; // "4.800.000 đ"
  currentRound: number; // kỳ hiện tại (ô lưới)
  totalValueLabel: string;
  remainingLabel: string;
  currentPotLabel: string;
  startDate: string;
  nextContribDate: string;
  endDate: string;
};

export type AuctionRound = {
  round: number;
  date: string;
  winner: string | null;
  wonPrice: string | null;
  saved: string | null;
  status: "received" | "ongoing" | "upcoming";
};

export type HuiMember = {
  id: string;
  name: string;
  role: "organizer" | "member";
  hasWon: boolean;
  wonRound: number | null;
  trustScore: number;
};

export type HuiPayment = {
  round: number;
  dueDate: string;
  amount: string;
  status: "paid" | "due" | "upcoming";
  paidDate?: string;
};

export type JoinInfo = {
  huiName: string;
  organizer: string;
  trustScore: number;
  createdCount: number;
  completionRate: number;
  sharePerRound: string;
  totalRounds: number;
  startDate: string;
  monthlyDueLabel: string;
  method: string;
};

export function mockHuiName(id: string): string {
  if (id === "grp-yyy") return "Hụi YYY";
  if (id === "grp-xxx") return "Hụi XXX";
  return "Hụi của tui";
}

export function mockHuiOverview(id: string): HuiOverview {
  return {
    name: mockHuiName(id),
    sharePerRound: "500.000 đ",
    memberCount: 12,
    progressRound: 5,
    totalRounds: 12,
    progressPercent: 83,
    paidLabel: "4.000.000 đ",
    targetLabel: "4.800.000 đ",
    currentRound: 6,
    totalValueLabel: "6.000.000 đ",
    remainingLabel: "3.000.000 đ",
    currentPotLabel: "3.000.000 đ",
    startDate: "05/08/2026",
    nextContribDate: "05/02/2027",
    endDate: "05/07/2027",
  };
}

const WINNERS = ["Nguyễn Văn A", "Trần Thị B", "Huỳnh Văn C", "Trần Văn D", "Nguyễn Thị E"];
const PRICES = ["5.520.000 đ", "5.410.000 đ", "5.300.000 đ", "5.180.000 đ", "5.050.000 đ"];
const SAVED = ["480.000 đ", "590.000 đ", "700.000 đ", "820.000 đ", "950.000 đ"];
const DATES = [
  "05/08/2026", "05/09/2026", "05/10/2026", "05/11/2026", "05/12/2026",
  "05/01/2027", "05/02/2027", "05/03/2027", "05/04/2027", "05/05/2027",
  "05/06/2027", "05/07/2027",
];

export function mockAuctionHistory(): AuctionRound[] {
  return DATES.map((date, i) => {
    const round = i + 1;
    if (round <= 5) {
      return { round, date, winner: WINNERS[i], wonPrice: PRICES[i], saved: SAVED[i], status: "received" as const };
    }
    if (round === 6) {
      return { round, date, winner: null, wonPrice: null, saved: null, status: "ongoing" as const };
    }
    return { round, date, winner: null, wonPrice: null, saved: null, status: "upcoming" as const };
  });
}

const MEMBER_NAMES = [
  "Nguyễn Văn B", "Nguyễn Văn A", "Trần Thị B", "Huỳnh Văn C", "Trần Văn D",
  "Nguyễn Thị E", "Lê Văn F", "Phạm Thị G", "Vũ Văn H", "Đỗ Thị K",
  "Bùi Văn L", "Hồ Thị M",
];

export function mockHuiMembers(): HuiMember[] {
  return MEMBER_NAMES.map((name, i) => ({
    id: `mem-${i}`,
    name,
    role: i === 0 ? ("organizer" as const) : ("member" as const),
    hasWon: i >= 1 && i <= 5,
    wonRound: i >= 1 && i <= 5 ? i : null,
    trustScore: 900 - i * 17,
  }));
}

export function mockHuiPayments(): HuiPayment[] {
  return DATES.map((dueDate, i) => {
    const round = i + 1;
    if (round <= 5) return { round, dueDate, amount: "400.000 đ", status: "paid" as const, paidDate: dueDate };
    if (round === 6) return { round, dueDate, amount: "500.000 đ", status: "due" as const };
    return { round, dueDate, amount: "500.000 đ", status: "upcoming" as const };
  });
}

export function mockJoinInfo(): JoinInfo {
  return {
    huiName: "Hụi Newbie",
    organizer: "Nguyễn Văn B",
    trustScore: 927,
    createdCount: 25,
    completionRate: 100,
    sharePerRound: "500.000 đ",
    totalRounds: 12,
    startDate: "05/08/2026",
    monthlyDueLabel: "05 hàng tháng",
    method: "Đấu giá công khai",
  };
}
