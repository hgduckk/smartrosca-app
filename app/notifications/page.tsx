"use client";

import { useState } from "react";
import { SubPage } from "@/components/SubPage";

type Noti = {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
};

// Dữ liệu thông báo mock — phản ánh các sự kiện thật của hụi (đấu giá, tới hạn
// đóng, giải ngân, vi phạm, điểm tín nhiệm). Giai đoạn thật thay bằng nguồn từ API
// /notifications gắn với sự kiện on-chain + hạn đóng góp.
const SEED: Noti[] = [
  { id: "n1", title: "Sắp tới hạn đóng hụi", text: "Hụi XXX — Kỳ 5 sẽ hết hạn đóng góp trong 2 ngày. Hãy đóng 9,4 triệu đúng hạn để giữ điểm tín nhiệm.", time: "1 giờ trước", read: false },
  { id: "n2", title: "Bạn đã thắng vòng đấu 🎉", text: "Bạn kêu lãi cao nhất ở Hụi YYY — Kỳ 1 và sẽ nhận tiền sau khi mọi người đóng đủ.", time: "3 giờ trước", read: false },
  { id: "n3", title: "Điểm tín nhiệm +10", text: "Bạn đóng góp đúng hạn ở Hụi XXX — Kỳ 4. Tiếp tục giữ vững nhé!", time: "Hôm qua", read: true },
  { id: "n4", title: "Vòng đấu mới đã mở", text: "Hụi XXX — Kỳ 5 đã bắt đầu. Cửa sổ kêu lãi mở trong 15 phút.", time: "2 ngày trước", read: true },
  { id: "n5", title: "Giải ngân thành công", text: "Hụi XXX — Kỳ 4 đã giải ngân cho người thắng. Xem giao dịch trên blockchain.", time: "3 ngày trước", read: true },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<Noti[]>(SEED);
  const hasUnread = items.some((n) => !n.read);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <SubPage
      title="Thông báo"
      back="/profile"
      action={
        hasUnread ? (
          <button className="btn-link" onClick={markAllRead}>
            Đọc hết
          </button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="sub-empty">Chưa có thông báo nào.</p>
      ) : (
        items.map((n) => (
          <div
            key={n.id}
            className={`sub-noti ${n.read ? "is-read" : "is-unread"}`}
            onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
          >
            <span className="sub-noti-dot" />
            <div className="sub-noti-body">
              <p className="sub-noti-title">{n.title}</p>
              <p className="sub-noti-text">{n.text}</p>
              <p className="sub-noti-time">{n.time}</p>
            </div>
          </div>
        ))
      )}
    </SubPage>
  );
}
