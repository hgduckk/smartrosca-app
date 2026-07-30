const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

// Trần lãi tối đa 20%/năm theo luật VN (MAX_ANNUAL_RATE_BPS trong smart contract).
const ANNUAL_MAX_BID_RATE_PERCENT = BigInt(20);

// Ước tính trần lãi ĐỘNG cho kỳ hiện tại, theo đúng công thức Điều 21 Nghị định
// 19/2019 mà smart contract dùng trong currentMaxBidCap():
//   trần = 20%/năm × (n-k+1)×P × [(n-k)×t/365]
// với k = kỳ đang hốt (1-based), n = tổng số thành viên, P = phần hụi (mỗi kỳ),
// t = thời lượng 1 kỳ (giây). Trần cao khi hốt sớm (k nhỏ), giảm dần và bằng 0 ở
// kỳ cuối cùng (k = n) vì khi đó không còn kỳ nào phía sau để tính lãi.
//
// Đây CHỈ là ước tính phía client để cảnh báo sớm cho UX — giá trị chốt chặn thật
// sự phải đọc từ currentMaxBidCap() trên smart contract (xem
// getCurrentMaxBidCapOnChain trong lib/contract.ts), vì trần phụ thuộc kỳ đang
// diễn ra thực tế trên chain, không phải ước lượng tĩnh phía client.
export function estimateMaxBidCapWei(
  shareAmountWei: bigint,
  totalMembers: number,
  currentRoundNumber: number,
  roundDurationSec: number
): bigint {
  const n = BigInt(totalMembers);
  const k = BigInt(currentRoundNumber);
  if (currentRoundNumber <= 0 || k >= n) {
    return BigInt(0);
  }
  const remainingMembers = n - k + BigInt(1);
  const poolWei = remainingMembers * shareAmountWei;
  const remainingRounds = n - k;
  // Nhân trước khi chia để giữ độ chính xác khi tính bằng BigInt.
  return (
    (poolWei * ANNUAL_MAX_BID_RATE_PERCENT * remainingRounds * BigInt(roundDurationSec)) /
    (BigInt(100) * BigInt(SECONDS_PER_YEAR))
  );
}
