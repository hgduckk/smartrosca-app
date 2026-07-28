# SmartROSCA — Prompt cho Claude Code

Dùng file này khi làm việc với Claude Code. Đưa **Prompt khởi tạo** trước (1 lần), sau đó đưa lần lượt từng **Prompt giai đoạn**. Không dán hết một lúc — làm xong giai đoạn nào, review rồi mới sang giai đoạn sau.

---

## PROMPT KHỞI TẠO (đưa đầu tiên, 1 lần duy nhất)

```
Tôi đang xây dựng SmartROSCA — nền tảng số hóa mô hình hụi đấu (auction-style ROSCA)
của Việt Nam, cho cuộc thi fintech. Đây là project ĐỘC LẬP, không liên quan tới bất
kỳ project nào khác của tôi. Hãy đọc kỹ context này trước khi code, và LÀM THEO TỪNG
GIAI ĐOẠN — tôi sẽ ra lệnh từng phần, đừng tự động dựng hết một lúc.

## Bối cảnh nghiệp vụ
- Hụi đấu: mỗi kỳ, thành viên "kêu lãi" (bid) để giành quyền nhận tiền sớm. Ai kêu
  cao nhất thắng. Hụi sống (chưa hốt) đóng ít hơn = phần_hụi − lãi_thắng. Hụi chết
  (đã hốt) đóng đủ phần hụi.
- Có cơ chế chặn trần lãi 20%/năm (maxBidCap) trong smart contract để tuân thủ luật VN.
- SmartROSCA là NỀN TẢNG công cụ hỗ trợ, KHÔNG phải chủ họ. Người tạo dây tự làm chủ họ.

## Kiến trúc (2 luồng tách bạch — RẤT QUAN TRỌNG)
- Luồng dữ liệu minh bạch: mọi giao dịch (bid/đóng/nhận/phạt) ghi lên smart contract
  (blockchain Sepolia testnet), bất biến.
- Luồng tiền: ở production sẽ đi qua cổng thanh toán được cấp phép — nhưng GIAI ĐOẠN
  NÀY MOCK HẾT (không tích hợp thật). Blockchain chỉ giữ dữ liệu, không giữ tiền thật.
- eKYC: MOCK hoàn toàn (upload ảnh giả → chờ vài giây → trả badge verified).
- CCCD/ảnh khuôn mặt KHÔNG BAO GIỜ đẩy lên blockchain, chỉ lưu trạng thái ở DB.

## Stack bắt buộc
- Next.js 15 (App Router) + TypeScript
- Supabase (Postgres) qua Prisma ORM
- ethers.js v6 để tương tác smart contract
- Kết nối ví MetaMask
- Deploy dự kiến: Vercel

## Lưu ý quan trọng
- Smart contract CHƯA deploy lên Sepolia — dùng biến môi trường
  NEXT_PUBLIC_CONTRACT_ADDRESS làm placeholder, tôi sẽ điền địa chỉ thật sau.
- Mọi số tiền on-chain là BigInt (wei) — lưu DB dạng string để tránh tràn số.
- Ưu tiên code rõ ràng, dễ đọc, comment tiếng Việt ở các chỗ logic quan trọng.
- KHÔNG tự ý cài thêm thư viện nặng (UI kit, state management phức tạp) trừ khi tôi
  yêu cầu — giữ dependency tối thiểu.
- Sau mỗi giai đoạn, DỪNG LẠI và liệt kê những gì đã làm + lệnh tôi cần chạy (npm
  install, prisma migrate...) để tôi tự chạy, đừng giả định đã chạy được.

Hãy xác nhận đã hiểu context, rồi CHỜ tôi ra lệnh Giai đoạn 0. Chưa code gì cả.
```

---

## GIAI ĐOẠN 0 — Nền móng

```
Giai đoạn 0: Dựng nền móng project.

1. Khởi tạo Next.js 15 (App Router, TypeScript) với cấu trúc thư mục tối giản.
2. Cài và cấu hình Prisma với datasource Postgres (Supabase), dùng env DATABASE_URL.
3. Tạo file prisma/schema.prisma với các model sau (off-chain data):
   - User (id, walletAddress unique, displayName, email, createdAt)
   - KycRecord (userId unique, status enum PENDING/VERIFIED/REJECTED, mockDocType,
     verifiedAt) — prototype mock, KHÔNG lưu ảnh thật
   - CreditScore (userId unique, score int default 500, updatedAt) + CreditScoreEvent
     (delta, reason, createdAt) để log lịch sử điểm
   - HuiGroup (name, contractAddress, shareAmountWei string, totalMembers,
     collateralWei string, roundDurationSec, bidDurationSec, status enum
     OPEN/ACTIVE/COMPLETED/CANCELLED, createdAt)
   - HuiMember (groupId, userId, hasWon, wonRound, isActive, joinTxHash) unique(groupId,userId)
   - Round (groupId, roundNumber, winnerUserId, winningBidWei string,
     requiredFromSurvivorWei string, requiredFromDeadWei string, bidClosed, settled,
     closeRoundTxHash, payoutTxHash) unique(groupId,roundNumber)
   - Bid (roundId, userId, amountWei string, txHash, createdAt)
   - Contribution (roundId, userId, amountWei string, txHash, onTime bool, createdAt)
   Nhớ các quan hệ (relations) giữa các model.
4. Tạo lib/prisma.ts (singleton Prisma client) và lib/contract.ts (nơi khai báo
   ABI + địa chỉ contract từ env NEXT_PUBLIC_CONTRACT_ADDRESS — để trống ABI tạm,
   tôi sẽ dán ABI thật sau khi compile contract).
5. Tạo file .env.example liệt kê các biến cần: DATABASE_URL, NEXT_PUBLIC_CONTRACT_ADDRESS,
   NEXT_PUBLIC_CHAIN_ID (Sepolia = 11155111).

Xong thì dừng lại, liệt kê các lệnh tôi cần chạy (npm install, prisma generate,
prisma migrate) và chờ tôi sang Giai đoạn 1.
```

---

## GIAI ĐOẠN 1 — Kết nối ví & eKYC mock

```
Giai đoạn 1: Kết nối ví MetaMask + eKYC mock.

1. Tạo hook/lib kết nối ví MetaMask bằng ethers.js v6: nút "Kết nối ví", lấy địa chỉ,
   kiểm tra đúng mạng Sepolia (chainId 11155111), nếu sai mạng thì yêu cầu chuyển.
2. Khi kết nối ví: gọi API tạo hoặc tìm User theo walletAddress (upsert).
3. Màn hình eKYC mock (/app/kyc):
   - Cho upload 1 ảnh bất kỳ (giả làm CCCD) — KHÔNG lưu ảnh thật, chỉ giả lập.
   - Bấm "Xác thực" → hiện trạng thái "Đang xác thực..." trong ~2-3 giây → cập nhật
     KycRecord.status = VERIFIED qua API → hiện badge "Đã xác thực ✓".
4. Middleware/guard: user chưa VERIFIED thì không được vào trang tạo/join hụi
   (redirect về /kyc).
5. API routes cần thiết: /api/user (upsert theo wallet), /api/kyc (cập nhật trạng thái).

Giữ UI đơn giản, gọn gàng (chưa cần đẹp — sẽ polish sau theo Figma). Xong thì dừng,
liệt kê thay đổi và chờ Giai đoạn 2.
```

---

## GIAI ĐOẠN 2 — Tạo & tham gia dây hụi

```
Giai đoạn 2: Tạo và tham gia dây hụi.

1. Trang tạo dây hụi (/app/create): form nhập tên dây, số tiền/kỳ (ETH), số thành viên,
   thời gian mỗi kỳ, thời gian đấu giá. Khi submit:
   - Gọi contract để deploy/tạo group (tôi sẽ cung cấp hàm contract sau — tạm để hàm
     placeholder createGroupOnChain() trong lib/contract.ts).
   - Lưu HuiGroup vào DB kèm contractAddress và các tham số (dạng wei string).
2. Trang danh sách dây hụi đang mở (/app/groups): hiển thị các HuiGroup status=OPEN,
   nút "Tham gia".
3. Tham gia: gọi contract join() kèm ký quỹ (collateral), lưu HuiMember + joinTxHash.
   Hiển thị link tx trên sepolia.etherscan.io sau khi thành công.
4. API routes: /api/groups (tạo, list), /api/members (join).

Nhớ: mọi tương tác tiền/giao dịch đi qua ví MetaMask của user (ethers.js), backend
chỉ ghi nhận kết quả + tx hash vào DB. Xong thì dừng, chờ Giai đoạn 3.
```

---

## GIAI ĐOẠN 3 — Đấu giá (lõi hụi đấu)

```
Giai đoạn 3: Màn đấu giá.

1. Trang đấu giá (/app/groups/[id]/bid): hiển thị kỳ hiện tại, đồng hồ đếm ngược tới
   hết bidDuration.
2. Ô nhập mức lãi kêu → gọi contract placeBid(bidAmount). Hiển thị cảnh báo nếu vượt
   maxBidCap (đọc maxBidCap từ contract).
3. Hiển thị realtime danh sách bid hiện tại + ai đang cao nhất — lắng nghe event
   BidPlaced từ contract (ethers.js contract.on).
4. Khi hết giờ: nút "Chốt vòng đấu" gọi closeRound(). Hiển thị người thắng + số tiền
   mỗi nhóm phải đóng (đọc getRoundInfo).
5. Lưu Bid + Round info vào DB qua API, kèm tx hash.

Xong thì dừng, chờ Giai đoạn 4.
```

---

## GIAI ĐOẠN 4 — Đóng góp & giải ngân

```
Giai đoạn 4: Đóng góp và giải ngân.

1. Sau closeRound: hiển thị mỗi thành viên phải đóng bao nhiêu (survivor vs dead).
2. Nút "Đóng góp" → gọi contract contribute() với đúng số tiền của user đó.
3. Khi đủ người đóng: nút "Giải ngân" gọi payout() → chuyển tiền cho winner, mở kỳ kế.
4. Hiển thị nổi bật link transaction hash (sepolia.etherscan.io/tx/...) sau mỗi bước
   quan trọng — đây là bằng chứng minh bạch on-chain.
5. Lưu Contribution + cập nhật Round.settled + payoutTxHash vào DB.

Xong thì dừng, chờ Giai đoạn 5.
```

---

## GIAI ĐOẠN 5 — Dashboard & Credit Scoring

```
Giai đoạn 5: Dashboard và credit scoring.

1. Dashboard (/app/dashboard): các dây hụi của tôi, trạng thái từng kỳ (đã đóng/chưa,
   sống/chết), điểm credit score hiện tại.
2. Lịch sử giao dịch: đọc từ event on-chain (BidPlaced, RoundClosed, Payout) + hiển
   thị link etherscan.
3. Credit scoring logic (backend): cộng điểm khi đóng đúng hạn (Contribution.onTime=true),
   trừ điểm khi default (lắng nghe event MemberDefaulted). Ghi CreditScoreEvent mỗi lần
   thay đổi.
4. Hiển thị badge/màu theo mức điểm để trực quan.

Xong thì dừng, chờ chỉ đạo tiếp (data mẫu, polish UI, deploy Vercel).
```

---

## Ghi chú khi dùng

- **ABI contract:** sau khi compile contract trên Remix, copy ABI (tab Solidity Compiler
  → nút ABI) và dán vào `lib/contract.ts`. Nói với Claude Code: "Đây là ABI thật, cập
  nhật vào lib/contract.ts và hoàn thiện các hàm placeholder."
- **Địa chỉ contract:** sau khi deploy Sepolia, điền vào `.env` biến
  `NEXT_PUBLIC_CONTRACT_ADDRESS`.
- **Nếu Claude Code làm quá đà** (dựng nhiều hơn giai đoạn yêu cầu), nhắc: "Chỉ làm
  đúng giai đoạn tôi yêu cầu, dừng lại chờ tôi review."
- **Mỗi giai đoạn xong**, chạy thử `npm run dev` xem có lỗi không rồi mới sang giai đoạn kế.
