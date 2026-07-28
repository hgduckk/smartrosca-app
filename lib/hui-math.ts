const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

// Trần lãi tối đa 20%/năm theo luật VN (maxBidCap trong smart contract).
const ANNUAL_MAX_BID_RATE_PERCENT = BigInt(20);

// Ước tính trần lãi tối đa cho MỘT kỳ, dựa trên tổng giá trị dây hụi và thời lượng
// kỳ đó, quy đổi từ mức trần 20%/năm. Đây CHỈ là ước tính phía client để cảnh báo
// sớm cho UX — giá trị chốt chặn thật sự phải đọc từ maxBidCap trên smart contract
// (xem getMaxBidCapOnChain trong lib/contract.ts) sau khi contract được deploy.
export function estimateMaxBidCapWei(
  shareAmountWei: bigint,
  totalMembers: number,
  roundDurationSec: number
): bigint {
  const poolWei = shareAmountWei * BigInt(totalMembers);
  // Nhân trước khi chia để giữ độ chính xác khi tính bằng BigInt.
  return (
    (poolWei * ANNUAL_MAX_BID_RATE_PERCENT * BigInt(roundDurationSec)) /
    (BigInt(100) * BigInt(SECONDS_PER_YEAR))
  );
}
