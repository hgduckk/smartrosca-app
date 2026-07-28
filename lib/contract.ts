import { BrowserProvider, Contract, type ContractRunner, type InterfaceAbi, type Signer } from "ethers";

// Địa chỉ smart contract HuiGroup — đọc từ env, sẽ được điền sau khi deploy lên Sepolia.
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "11155111");

// ABI tạm để trống — dán ABI thật (xuất từ Remix sau khi compile contract) vào đây.
export const CONTRACT_ABI: InterfaceAbi = [];

export const IS_CONTRACT_CONFIGURED =
  Boolean(CONTRACT_ADDRESS) && Array.isArray(CONTRACT_ABI) && CONTRACT_ABI.length > 0;

// Trả về instance contract, dùng chung cho cả provider (đọc) lẫn signer (ghi giao dịch).
export function getContract(runner: ContractRunner) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
}

// Mỗi dây hụi có thể là 1 contract riêng (địa chỉ lưu ở HuiGroup.contractAddress),
// khác với CONTRACT_ADDRESS (contract factory dùng để tạo group ở createGroupOnChain).
export function getGroupContract(runner: ContractRunner, groupContractAddress: string) {
  return new Contract(groupContractAddress, CONTRACT_ABI, runner);
}

// Lấy signer từ ví MetaMask đang kết nối — dùng ngay trước khi gửi giao dịch,
// không cache lại vì signer có thể đổi theo tài khoản/mạng hiện tại của ví.
export async function getBrowserSigner(): Promise<Signer> {
  if (!window.ethereum) {
    throw new Error("Chưa cài đặt MetaMask.");
  }
  const provider = new BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export type CreateGroupParams = {
  name: string;
  shareAmountWei: bigint;
  totalMembers: number;
  collateralWei: bigint;
  roundDurationSec: number;
  bidDurationSec: number;
};

export type CreateGroupResult = {
  contractAddress: string;
  txHash: string;
};

// PLACEHOLDER — chưa có ABI/contract thật nên chưa thể gọi lên chain.
// Sau khi có ABI (deploy factory hoặc contract HuiGroup), thay thân hàm này bằng
// lời gọi thật, ví dụ:
//   const contract = getContract(signer);
//   const tx = await contract.createGroup(params.shareAmountWei, params.totalMembers, ...);
//   const receipt = await tx.wait();
//   return { contractAddress: receipt.contractAddress, txHash: tx.hash };
export async function createGroupOnChain(
  _signer: Signer,
  _params: CreateGroupParams
): Promise<CreateGroupResult> {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error(
      "Chưa cấu hình ABI/địa chỉ contract thật — cần deploy contract lên Sepolia trước khi tạo dây hụi."
    );
  }
  throw new Error("createGroupOnChain() chưa được cài đặt — cần hoàn thiện sau khi có ABI thật.");
}

// PLACEHOLDER — chưa có ABI/contract thật nên chưa thể gọi lên chain.
// Sau khi có ABI, thay thân hàm này bằng lời gọi contract.join({ value: collateralWei }).
export async function joinGroupOnChain(
  _signer: Signer,
  _groupContractAddress: string,
  _collateralWei: bigint
): Promise<{ txHash: string }> {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error(
      "Chưa cấu hình ABI contract thật — cần deploy contract lên Sepolia trước khi tham gia dây hụi."
    );
  }
  throw new Error("joinGroupOnChain() chưa được cài đặt — cần hoàn thiện sau khi có ABI thật.");
}

export type PlaceBidResult = {
  txHash: string;
};

// PLACEHOLDER — chưa có ABI/contract thật nên chưa thể gọi lên chain.
// Sau khi có ABI, thay thân hàm này bằng lời gọi contract.placeBid(amountWei), ví dụ:
//   const contract = getGroupContract(signer, groupContractAddress);
//   const tx = await contract.placeBid(amountWei);
//   await tx.wait();
//   return { txHash: tx.hash };
export async function placeBidOnChain(
  _signer: Signer,
  _groupContractAddress: string,
  _amountWei: bigint
): Promise<PlaceBidResult> {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error(
      "Chưa cấu hình ABI contract thật — cần deploy contract lên Sepolia trước khi đấu giá."
    );
  }
  throw new Error("placeBidOnChain() chưa được cài đặt — cần hoàn thiện sau khi có ABI thật.");
}

export type CloseRoundResult = {
  txHash: string;
  winnerAddress: string;
  winningBidWei: bigint;
  requiredFromSurvivorWei: bigint;
  requiredFromDeadWei: bigint;
};

// PLACEHOLDER — chưa có ABI/contract thật nên chưa thể gọi lên chain.
// Sau khi có ABI, thay thân hàm này bằng lời gọi contract.closeRound() rồi đọc
// getRoundInfo() để lấy winner + số tiền mỗi nhóm (sống/chết) phải đóng.
export async function closeRoundOnChain(
  _signer: Signer,
  _groupContractAddress: string
): Promise<CloseRoundResult> {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error(
      "Chưa cấu hình ABI contract thật — cần deploy contract lên Sepolia trước khi chốt vòng đấu."
    );
  }
  throw new Error("closeRoundOnChain() chưa được cài đặt — cần hoàn thiện sau khi có ABI thật.");
}

export type ContributeResult = {
  txHash: string;
};

// PLACEHOLDER — chưa có ABI/contract thật nên chưa thể gọi lên chain.
// Sau khi có ABI, thay thân hàm này bằng lời gọi contract.contribute({ value: amountWei }).
export async function contributeOnChain(
  _signer: Signer,
  _groupContractAddress: string,
  _amountWei: bigint
): Promise<ContributeResult> {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error(
      "Chưa cấu hình ABI contract thật — cần deploy contract lên Sepolia trước khi đóng góp."
    );
  }
  throw new Error("contributeOnChain() chưa được cài đặt — cần hoàn thiện sau khi có ABI thật.");
}

export type PayoutResult = {
  txHash: string;
};

// PLACEHOLDER — chưa có ABI/contract thật nên chưa thể gọi lên chain.
// Sau khi có ABI, thay thân hàm này bằng lời gọi contract.payout() (chuyển tiền cho
// winner và mở kỳ kế tiếp trên contract).
export async function payoutOnChain(
  _signer: Signer,
  _groupContractAddress: string
): Promise<PayoutResult> {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error(
      "Chưa cấu hình ABI contract thật — cần deploy contract lên Sepolia trước khi giải ngân."
    );
  }
  throw new Error("payoutOnChain() chưa được cài đặt — cần hoàn thiện sau khi có ABI thật.");
}

// PLACEHOLDER — đọc maxBidCap thật (đơn vị wei/kỳ) từ contract sau khi có ABI.
// Trả về null khi contract chưa sẵn sàng — UI sẽ dùng ước tính client-side thay thế
// (xem lib/hui-math.ts) chỉ để cảnh báo sớm, KHÔNG phải giá trị chốt chặn cuối cùng.
export async function getMaxBidCapOnChain(
  _groupContractAddress: string
): Promise<bigint | null> {
  if (!IS_CONTRACT_CONFIGURED) return null;
  return null;
}

// Lắng nghe realtime event BidPlaced từ contract của 1 group — no-op nếu contract
// chưa cấu hình (trả về hàm hủy đăng ký rỗng để UI vẫn gọi được an toàn).
export function listenForBidPlaced(
  groupContractAddress: string,
  onBid: (bidderAddress: string, amountWei: bigint) => void
): () => void {
  if (!IS_CONTRACT_CONFIGURED || !window.ethereum) {
    return () => {};
  }
  const provider = new BrowserProvider(window.ethereum);
  const contract = getGroupContract(provider, groupContractAddress);
  const handler = (bidder: string, amount: bigint) => onBid(bidder, amount);
  contract.on("BidPlaced", handler);
  return () => {
    contract.off("BidPlaced", handler);
  };
}

// Lắng nghe realtime event MemberDefaulted (thành viên bỏ đóng góp) từ contract của
// 1 group — dùng để trừ điểm credit score (xem POST /api/members/default). No-op
// nếu contract chưa cấu hình.
export function listenForMemberDefaulted(
  groupContractAddress: string,
  onDefault: (memberAddress: string) => void
): () => void {
  if (!IS_CONTRACT_CONFIGURED || !window.ethereum) {
    return () => {};
  }
  const provider = new BrowserProvider(window.ethereum);
  const contract = getGroupContract(provider, groupContractAddress);
  const handler = (memberAddress: string) => onDefault(memberAddress);
  contract.on("MemberDefaulted", handler);
  return () => {
    contract.off("MemberDefaulted", handler);
  };
}

export type OnChainHistoryEvent = {
  type: "BidPlaced" | "RoundClosed" | "Payout";
  txHash: string;
};

// PLACEHOLDER — đọc lịch sử event thật từ contract (contract.queryFilter) sau khi
// có ABI. Hiện tại dashboard hiển thị lịch sử dựa trên tx hash đã lưu trong DB
// (kết quả của các hành động on-chain thực hiện qua app này) — nguồn dữ liệu
// tương đương, không cần query lại chain cho mục đích hiển thị.
export async function getOnChainHistory(
  _groupContractAddress: string
): Promise<OnChainHistoryEvent[]> {
  if (!IS_CONTRACT_CONFIGURED) return [];
  return [];
}
