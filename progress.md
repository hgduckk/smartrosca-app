# SmartROSCA — Nhật ký tiến độ

> File tổng hợp lại toàn bộ quá trình xây dựng từ đầu tới hiện tại, để bất kỳ ai
> (kể cả Claude Code ở phiên làm việc sau) đọc vào là nắm được bối cảnh, đã làm
> gì, quyết định kiến trúc nào, và còn thiếu gì.

## 1. Bối cảnh dự án

SmartROSCA là nền tảng số hóa mô hình **hụi đấu** (auction-style ROSCA) của Việt
Nam, làm cho một cuộc thi fintech. Cơ chế nghiệp vụ:

- Mỗi kỳ, thành viên "kêu lãi" (bid) để giành quyền nhận tiền sớm — ai kêu cao
  nhất thắng.
- Hụi sống (chưa hốt) đóng ít hơn = phần hụi − lãi thắng. Hụi chết (đã hốt)
  đóng đủ phần hụi.
- Trần lãi 20%/năm (`maxBidCap`) được chặn cứng trong smart contract để tuân
  thủ luật VN.
- SmartROSCA là **công cụ hỗ trợ**, không phải chủ họ — người tạo dây tự làm
  chủ họ (và trên chain, họ chính là `organizer` của contract).

**Kiến trúc 2 luồng tách bạch:**
- Luồng dữ liệu minh bạch: mọi bid/đóng/nhận/phạt ghi lên smart contract
  (Sepolia testnet), bất biến.
- Luồng tiền: giai đoạn này **mock hết** phần thanh toán pháp lý — blockchain
  chỉ giữ dữ liệu, không có cổng thanh toán thật. eKYC **mock hoàn toàn** (ảnh
  giả → chờ vài giây → verified), CCCD/ảnh mặt không bao giờ lên blockchain.

**Stack:** Next.js 15 (App Router) + TypeScript, Supabase/Postgres qua Prisma,
ethers.js v6, MetaMask, deploy dự kiến Vercel. Dependency tối thiểu — không cài
UI kit hay state management ngoài những gì kể trên.

Toàn bộ yêu cầu chi tiết từng giai đoạn nằm trong `PLAN.md` ở gốc repo.

## 2. Tiến độ theo giai đoạn

### Giai đoạn 0 — Nền móng
- Next.js 15.5 + TypeScript scaffold thủ công (không dùng `create-next-app`
  mặc định vì bản mới nhất của nó cài Next 16, không đúng yêu cầu Next 15).
- `prisma/schema.prisma`: 8 model — `User`, `KycRecord`, `CreditScore`,
  `CreditScoreEvent`, `HuiGroup`, `HuiMember`, `Round`, `Bid`, `Contribution`.
  Tiền on-chain lưu dạng `string` (wei) để tránh tràn số.
- `lib/prisma.ts` (singleton client), `lib/contract.ts` (khai báo ABI/địa chỉ
  contract, lúc này còn để trống).
- `.env.example`: `DATABASE_URL`, `NEXT_PUBLIC_CONTRACT_ADDRESS`,
  `NEXT_PUBLIC_CHAIN_ID=11155111`.

### Giai đoạn 1 — Kết nối ví & eKYC mock
- `lib/wallet-context.tsx`: `WalletProvider`/`useWallet` — kết nối MetaMask
  bằng ethers v6, tự phát hiện ví đã cấp quyền sẵn, lắng nghe
  `accountsChanged`/`chainChanged`, kiểm tra đúng Sepolia (11155111), tự thêm
  mạng nếu ví chưa có. Mỗi khi có địa chỉ ví → upsert `User` qua API.
- `components/ConnectWalletButton.tsx`, `app/api/user/route.ts` (upsert theo
  wallet, tạo kèm `KycRecord` PENDING mặc định).
- `app/kyc/page.tsx`: chọn ảnh bất kỳ (không upload thật) → "Xác thực" → giả
  lập 2.5s → `POST /api/kyc` → badge "Đã xác thực ✓".
- `components/RequireVerifiedKyc.tsx`: guard **phía client** (không phải
  `middleware.ts`) vì trạng thái MetaMask chỉ tồn tại trong trình duyệt, edge
  middleware không thấy được.

### Giai đoạn 2 — Tạo & tham gia dây hụi
- `app/create/page.tsx`: form tạo dây hụi (tên, phần hụi/kỳ, ký quỹ, số thành
  viên, thời gian kỳ/đấu giá bằng ETH/ngày/phút), convert sang wei bằng
  `parseEther`.
- `app/groups/page.tsx`: danh sách `HuiGroup` status=OPEN, nút "Tham gia".
- `app/api/groups/route.ts`, `app/api/members/route.ts`.
- **Quyết định placeholder ban đầu:** vì contract chưa có ABI thật lúc này,
  `createGroupOnChain()`/`joinGroupOnChain()` chỉ throw lỗi rõ ràng
  ("chưa cấu hình ABI/contract thật") — toàn bộ UI/API/DB vẫn build/test được,
  chỉ chờ ABI thật (xem mục 4).

### Giai đoạn 3 — Đấu giá
- Thêm `createdAt` vào model `Round` (schema gốc thiếu field này — cần để tính
  đồng hồ đếm ngược `bidDuration`).
- `app/groups/[id]/bid/page.tsx`: đồng hồ đếm ngược, ô nhập lãi kêu + cảnh báo
  vượt `maxBidCap` (ước tính client-side qua `lib/hui-math.ts` lúc ABI chưa
  sẵn), danh sách bid (poll 4s + lắng nghe event `BidPlaced` song song), nút
  "Chốt vòng đấu" khi hết giờ.
- `app/api/groups/[id]/route.ts`, `app/api/rounds/route.ts` (lấy/tạo vòng đấu
  hiện tại — idempotent), `app/api/rounds/[id]/close/route.ts`,
  `app/api/bids/route.ts`.

### Giai đoạn 4 — Đóng góp & giải ngân
- Mở rộng ngay trong trang phòng đấu giá (không tạo route riêng): sau khi
  `bidClosed`, hiển thị từng thành viên cần đóng bao nhiêu (hụi sống/hụi chết,
  trừ người thắng kỳ này), nút "Đóng góp", nút "Giải ngân" (chỉ bật khi tất cả
  đã đóng đủ).
- `app/api/contributions/route.ts`, `app/api/rounds/[id]/payout/route.ts`.
- `onTime` (đóng đúng hạn) tính theo `round.createdAt + roundDurationSec` —
  dùng luôn thời lượng cả kỳ làm hạn chót vì schema gốc không có field hạn
  đóng góp riêng.

### Giai đoạn 5 — Dashboard & Credit Scoring
- `lib/credit-score.ts`: `applyCreditScoreDelta()` — cộng/trừ điểm + ghi
  `CreditScoreEvent`. Hằng số: đóng đúng hạn `+10`, trễ hạn `-20`, default
  `-50`. Điểm khởi đầu mặc định 500.
- `lib/credit-score-level.ts`: `creditScoreLevel(score)` → badge/màu (Tốt
  ≥650, Trung bình 400–649, Rủi ro cao <400).
- `app/api/contributions/route.ts` cập nhật để tự cộng/trừ điểm ngay khi tạo
  `Contribution`.
- `app/api/members/default/route.ts`: trừ điểm khi nhận event `MemberDefaulted`.
- `app/api/dashboard/route.ts` + `app/dashboard/page.tsx`: credit score +
  lịch sử điểm, danh sách dây hụi kèm trạng thái từng kỳ, lịch sử giao dịch
  (nguồn: tx hash đã lưu trong DB — `Bid.txHash`, `Round.closeRoundTxHash`,
  `Round.payoutTxHash`, `Contribution.txHash`, `HuiMember.joinTxHash` — vì
  contract chưa deploy nên chưa query lịch sử event thật qua
  `contract.queryFilter`; hàm `getOnChainHistory()` để sẵn placeholder cho
  việc này sau).

## 3. Thiết kế giao diện (UI pass)

Sau khi xong 6 giai đoạn, làm một lượt thiết kế UI cơ bản — **không cài thêm
thư viện UI nào**, giữ đúng yêu cầu dependency tối thiểu:

- `app/globals.css`: hệ thống design token thuần CSS — biến màu sáng/tối
  (`prefers-color-scheme` + `data-theme` override), button (`btn`,
  `btn-primary`, `btn-outline`), card, badge (`badge-success/warning/danger/
  neutral`), input/field, header/nav, v.v.
- Áp lại vào toàn bộ trang: `layout.tsx` (header sticky), `page.tsx` (landing
  đơn giản với các nút dẫn vào luồng chính), `kyc`, `create`, `groups`,
  `groups/[id]/bid`, `dashboard`, và 2 component dùng chung.
- Đã kiểm tra bằng Chrome thật (dark mode tự nhận đúng, layout gọn gàng).

### 3.1. Luồng "Liên kết nguồn thanh toán" (theo mẫu Figma)

Dựng đầy đủ 9 màn Figma còn thiếu route (`public/Figma/Nguôn liên kết-*`,
`Tài khoản liên kết`). Toàn bộ full-screen, có back-nav riêng (đã thêm
`/accounts` vào `BARE_PREFIXES` trong `AppChrome` — bare nhưng vẫn yêu cầu đăng
nhập vì không nằm trong `PUBLIC_PREFIXES`). Không thêm thư viện nào.

- `lib/payment-providers.ts`: danh mục 6 ngân hàng + 4 ví điện tử (tên/màu/ký
  hiệu), và tầng lưu tài khoản đã liên kết trong `localStorage` (seed khớp mẫu:
  Vietcombank mặc định, MB Bank, MoMo). Helper: `read/add/setDefault/remove`,
  `maskNumber`. Giai đoạn thật thay tầng lưu này bằng API/DB, giữ nguyên UI.
- `components/accounts/`: `LinkNav` (back + tiêu đề giữa) & `StepDots` (1-2-3),
  `ProviderLogo` (ô logo mock bằng ký hiệu ngắn trên nền brand).
- Route: `app/accounts/page.tsx` (danh sách, đặt mặc định khi chạm),
  `app/accounts/link/page.tsx` (chọn loại nguồn), `app/accounts/link/bank`
  (wizard 1 trang, state-machine: chọn NH → nhập TT → xác thực → OTP → thành
  công), `app/accounts/link/wallet` (chọn ví → chuyển hướng app → thành công).
  Tái dùng `OtpInput`, `SuccessCheck`, `WaveBg`, các primitive `.ob-*`.
- CSS `.ln-*` cuối `globals.css` — theme-aware (thẻ tóm tắt dùng
  `--color-primary-soft` để chữ đọc rõ ở cả sáng & tối).
- Entry point: thêm hàng "Tài khoản liên kết" ở trang Hồ sơ → `/accounts`.
- Đã kiểm thử end-to-end bằng Chrome headless (CDP): cả 2 wizard chạy đủ bước,
  ảnh chụp khớp mẫu; tsc + eslint sạch.
- Logo ngân hàng/ví: dùng ảnh thật user tải lên trong `public/bank-wallet-logo/`
  (10 file png/jpg), render `<img>` phủ kín ô bo góc, nền trắng fallback —
  thay cho ô ký hiệu chữ mock ban đầu.

### 3.2. Chi tiết dây hụi & Tham gia hụi (nốt các màn Figma còn lại)

Dựng 2 màn Figma cuối chưa có route: "Thông tin hụi đã tham gia" / "Lịch sử đấu
giá" (gộp thành trang chi tiết 4 tab) và "Tham gia hụi".

- `lib/hui-mock.ts`: dữ liệu mẫu tĩnh cho tổng quan/lịch sử/thành viên/thanh
  toán/tham gia (số liệu khớp mẫu Figma: tiến độ 83%, kỳ 05/12, v.v.).
- `components/hui/HuiDetailHeader.tsx`: header avatar hoa + tên hụi + phần
  hụi/kỳ + số thành viên + nút chia sẻ/cài đặt. (Back dùng `.hd-back` tĩnh —
  KHÔNG dùng `.ln-nav-back` vì class đó `position:absolute` sẽ thoát ra giữa
  màn hình.)
- `app/groups/[id]/page.tsx`: trang chi tiết 1 file, 4 tab bằng state (Tổng
  quan / Thành viên / Thanh toán / Lịch sử). Tổng quan: thanh tiến độ + lưới 8
  ô thống kê + nút "Đóng tiền"/"Xem đấu giá". Lịch sử: timeline dọc có dot,
  thẻ người trúng + badge "Đã nhận"/"Đang diễn ra"/"Sắp diễn ra". Deep-link tab
  qua `?tab=` đọc phía client (tránh cần Suspense của useSearchParams).
- `app/groups/[id]/join/page.tsx`: "Tham gia hụi" — thẻ chủ hụi gradient +
  trust score + 2 ô thống kê, bảng chi tiết dây hụi, nút "Tham gia".
- `AppChrome`: thêm `BARE_PATTERNS` (regex) cho `/groups/<id>` và
  `/groups/<id>/join` để 2 màn này full-screen (header/tab riêng) mà vẫn cần
  đăng nhập. Route `/groups/<id>/bid` giữ nguyên (vẫn có tabbar).
- Wiring: trang chủ "Chi tiết" → `/groups/<id>`, "Đóng ngay" →
  `/groups/grp-xxx?tab=payments`; danh sách dây hụi thêm nút "Chi tiết" →
  `/groups/<id>/join`.
- CSS `.hd-*` (chi tiết) & `.jn-*` (tham gia) — theme-aware. Đã chụp kiểm thử
  cả 4 tab + màn tham gia ở light mode, khớp mẫu; tsc + eslint sạch.

### 3.3. Hồ sơ (menu) & Trust Score (gauge)

- Đổi chữ hiển thị "Credit Score" → "Trust Score" ở dashboard + hồ sơ (giữ
  nguyên tên biến/model/API bên trong).
- `app/profile/page.tsx`: dựng lại theo mẫu Figma "Hồ sơ" — header "Hồ sơ" +
  chuông/cài đặt, thẻ hồ sơ (avatar + badge "Thành viên" + SĐT), list mục
  (Thông tin cá nhân, Trust Score, Tài khoản liên kết, Nguồn thanh toán, Đổi
  mật khẩu, Thiết bị đăng nhập, Cài đặt, Trợ giúp) + Đăng xuất đỏ. Mục chưa có
  route → toast "đang phát triển". Ẩn app-header chung trên `/profile` (thêm
  vào `NO_HEADER_ROUTES`), giữ tabbar. CSS `.pf-*`.
- `app/trust-score/page.tsx`: theo photo `public/Figma/trustscore.png` — màn
  nền tím đậm full-screen (thêm `/trust-score` vào `BARE_PREFIXES`), gauge SVG
  cung ~220° gradient đỏ→xanh + knob trắng theo tỉ lệ điểm, số lớn + "/1000" +
  badge phân hạng (Xuất sắc/Tốt/Khá/Trung bình/Yếu), 2 thẻ "Các mức điểm" &
  "Lịch sử cộng điểm" (thẻ lịch sử mở rộng inline từ creditScoreEvents thật).
  Điểm lấy từ `/api/dashboard` (mock 720). CSS `.tsx-*` (luôn tối, fill
  `100dvh`). Đã chụp kiểm thử khớp photo; tsc + eslint sạch.

## 4. Git & hạ tầng

- Khởi tạo git cục bộ (`git init`) — lý do trực tiếp: để VS Code tự làm mờ file
  `.env` trong Explorer (hiệu ứng chỉ chạy khi có `.gitignore` + là git repo).
- `.env` đã nằm trong `.gitignore` từ Giai đoạn 0, xác nhận không bị track.
- Remote: `https://github.com/hgduckk/smartrosca-app.git`, branch `main`.
- Commit đầu tiên: 39 file (toàn bộ code, không có `.env`/secret nào).
- Đã push thành công lên `origin/main`.

## 5. Database thật (Supabase)

- User tự tạo Supabase project, điền `DATABASE_URL` vào `.env` (không phải tôi
  nhập — mật khẩu là secret của user).
- Chạy `npx prisma generate` (tôi chạy) — đọc được `.env` thành công.
- User tự chạy `npx prisma migrate dev --name init` — đã tạo xong 8 bảng trên
  Supabase (thư mục `prisma/migrations/20260728081107_init/` đã xuất hiện).

## 6. Tích hợp ABI thật của smart contract `HuiDauROSCA`

User compile contract trên Remix và đưa ABI thật. Đọc ABI cho thấy một điểm
kiến trúc quan trọng: **contract không có hàm `createGroup()` dùng chung** —
constructor nhận thẳng `(shareAmount, totalMembers, collateralAmount,
roundDuration, bidDuration)`. Nghĩa là:

> **Mỗi dây hụi = một lần deploy contract riêng.** Người gọi deploy (ví
> MetaMask của người tạo dây) tự động trở thành `organizer` — khớp hoàn toàn
> với nguyên tắc nghiệp vụ "người tạo dây tự làm chủ họ".

Đã cập nhật `lib/contract.ts`:
- Dán ABI thật đầy đủ (constructor, các event `BidPlaced`, `ContributionMade`,
  `GroupCompleted`, `MemberDefaulted`, `MemberJoined`, `Payout`, `RoundClosed`,
  `RoundStarted`, và toàn bộ hàm view/nonpayable/payable).
- `createGroupOnChain()`: dùng `ContractFactory` để **deploy** một contract mới
  cho mỗi group — cần `CONTRACT_BYTECODE` lấy từ Remix (Solidity Compiler →
  Bytecode → field `"object"`). **Đã dán xong** và đối chiếu khớp 100% với
  bản gốc; `IS_BYTECODE_CONFIGURED` dùng để UI tự nhận biết khi nào sẵn sàng
  deploy.
- `joinGroupOnChain()` → `join({ value: collateralWei })`.
- `placeBidOnChain()` → `placeBid(amountWei)` (không payable — chỉ ghi nhận
  mức lãi, tiền không chuyển lúc bid).
- `closeRoundOnChain()` → đọc `currentRound()` **trước** khi gọi `closeRound()`
  (vì contract có thể tự tăng `currentRound` ngay sau khi đóng vòng), rồi đọc
  `getRoundInfo()` của đúng vòng vừa đóng.
- `contributeOnChain()` → `contribute({ value: amountWei })`.
- `payoutOnChain()` → `payout()`.
- `getMaxBidCapOnChain()` → đọc thật `maxBidCap()` (view, không tốn gas) —
  không cần ước tính client-side nữa (vẫn giữ `estimateMaxBidCapWei` làm
  fallback nếu chưa có provider).
- Thêm mới `getRoundInfoOnChain()`, `getOrganizerOnChain()`.
- **Dọn dẹp:** bỏ `CONTRACT_ADDRESS`/`getContract()` (global, dùng chung 1
  contract) vì không còn phù hợp kiến trúc "mỗi group 1 contract". Biến env
  `NEXT_PUBLIC_CONTRACT_ADDRESS` hiện không còn được code dùng tới — có thể
  xoá khỏi `.env`/`.env.example` khi tiện (không bắt buộc, không gây hại nếu
  để nguyên).

## 7. Tính năng "Đánh dấu vi phạm" (markDefault)

ABI có hàm `markDefault(address member)` nhưng không có cơ chế tự động gọi nó
(blockchain không có cron/scheduler). Đã quyết định và triển khai theo hướng
**thủ công**, tổ chức bởi organizer:

- `lib/contract.ts`: thêm `getOrganizerOnChain()` (đọc `organizer()` để so
  sánh với ví đang kết nối) và `markDefaultOnChain()` (gọi `markDefault()`).
- `app/groups/[id]/bid/page.tsx`:
  - Nút **"Đánh dấu vi phạm"** chỉ hiện với `isOrganizer` (so địa chỉ ví hiện
    tại với `organizer()` đọc từ contract).
  - Chỉ hiện cạnh thành viên **chưa đóng góp** kỳ hiện tại; bị `disabled` kèm
    `title` tooltip "Chưa tới hạn đóng góp" nếu chưa quá hạn
    (`round.createdAt + roundDurationSec`).
  - Bấm → `markDefaultOnChain()` → chờ tx confirm → thành viên đó chuyển badge
    "Vi phạm" (state cục bộ `defaultedUserIds`); credit score tự giảm qua
    listener `listenForMemberDefaulted` đã có sẵn từ Giai đoạn 5 (gọi
    `POST /api/members/default`).

## 8. Trạng thái hiện tại — checklist

- [x] Next.js 15 scaffold, Prisma schema, 8 model, migration đã chạy trên
      Supabase thật.
- [x] Kết nối ví MetaMask + kiểm tra mạng Sepolia.
- [x] eKYC mock end-to-end.
- [x] Tạo/tham gia dây hụi (UI + API + DB) — deploy thật qua `ContractFactory`.
- [x] Phòng đấu giá: bid, đồng hồ đếm ngược, chốt vòng, đọc `maxBidCap` thật.
- [x] Đóng góp, giải ngân, "Đánh dấu vi phạm" thủ công cho organizer.
- [x] Dashboard: credit score, trạng thái từng kỳ, lịch sử giao dịch.
- [x] UI cơ bản nhất quán (design token CSS, không thư viện ngoài).
- [x] Git repo + push GitHub (`hgduckk/smartrosca-app`, branch `main`).
- [x] Database Supabase thật đã migrate.
- [x] ABI + bytecode thật đã tích hợp — **không còn hàm on-chain nào là
      placeholder throw lỗi nữa**. `createGroupOnChain()` deploy thật qua
      `ContractFactory` (đã đối chiếu bytecode dán vào khớp 100% với bản gốc
      Remix gửi qua, không lệch ký tự nào).

### Còn thiếu / chờ quyết định

1. Người tạo dây cần có Sepolia ETH testnet (faucet) để trả gas deploy contract
   mới cho mỗi dây hụi — **chưa có báo cáo nào về việc đã thử deploy/test thật
   trên Sepolia** với ABI+bytecode hiện tại; nên coi đây là bước kiểm thử
   end-to-end còn treo (deploy → join → bid → close → contribute → payout →
   markDefault), không chỉ là vấn đề gas.
2. `NEXT_PUBLIC_CONTRACT_ADDRESS` trong `.env`/`.env.example` không còn được
   dùng — có thể dọn sau, không gấp.
3. `getOnChainHistory()` trong `lib/contract.ts` vẫn là placeholder trả về
   mảng rỗng — dashboard đang dùng tx hash lưu sẵn trong DB (đủ dùng), việc
   query lại lịch sử event qua `contract.queryFilter` là optional nếu muốn
   xác thực chéo với chain sau này.
4. Migration mới nhất (thêm cột `createdAt` cho `Round`) đã được áp dụng qua
   `prisma migrate dev` — nhớ chạy lại migrate sau mỗi lần thay đổi
   `schema.prisma` nếu có thay đổi tiếp theo. Hiện chỉ có 1 migration
   (`20260728081107_init`) trên Supabase.
