"use client";

import { useState } from "react";
import { SubPage } from "@/components/SubPage";
import { useToast } from "@/components/ToastProvider";

// Câu hỏi thường gặp — bám theo nghiệp vụ hụi đấu và cách SmartROSCA vận hành
// (Phần D, E, F của tài liệu master). Giải thích bằng ngôn ngữ đời thường.
const FAQS: { q: string; a: string }[] = [
  {
    q: "Hụi đấu (hụi có lãi) hoạt động thế nào?",
    a: "Mỗi kỳ, ai cần tiền gấp sẽ 'kêu lãi' — chấp nhận bớt một khoản để giành quyền nhận tiền sớm. Ai kêu cao nhất thắng kỳ đó. Người chưa hốt (hụi sống) đóng ít hơn nhờ được chia phần lãi; người đã hốt (hụi chết) đóng đủ phần hụi.",
  },
  {
    q: "Trần lãi 20%/năm là gì?",
    a: "Theo Điều 21 Nghị định 19/2019, lãi suất hụi không được vượt 20%/năm. SmartROSCA chặn cứng mức trần này ngay trong smart contract: mọi lệnh kêu lãi vượt trần sẽ bị từ chối tự động, không cần ai giám sát.",
  },
  {
    q: "Tiền của tôi có an toàn không?",
    a: "Trên SmartROSCA không ai — kể cả người tạo dây — được giữ hay rút quỹ tuỳ ý. Smart contract khoá tiền và chỉ chuyển cho người thắng đúng theo kết quả đấu giá. Kiểu giật hụi 'ôm tiền bỏ trốn' vì thế không thể xảy ra.",
  },
  {
    q: "Điểm tín nhiệm được tính thế nào?",
    a: "Điểm tăng khi bạn xác thực danh tính, đóng góp đúng hạn và hoàn thành trọn dây hụi; điểm giảm khi đóng trễ hoặc bỏ đóng. Lịch sử này theo bạn trên toàn hệ thống, giúp bạn tiếp cận các dây hụi lớn hơn và dịch vụ tài chính chính thức sau này.",
  },
  {
    q: "Nếu có thành viên bỏ đóng thì sao?",
    a: "Người tạo dây có thể 'Đánh dấu vi phạm' sau khi quá hạn đóng góp. Ký quỹ của người vi phạm sẽ được smart contract dùng để bù, và điểm tín nhiệm của họ bị trừ. Mọi thao tác đều ghi lên blockchain làm bằng chứng.",
  },
  {
    q: "eKYC có lưu ảnh CCCD của tôi lên blockchain không?",
    a: "Không. Ảnh CCCD và khuôn mặt KHÔNG bao giờ được đưa lên blockchain (dữ liệu blockchain là công khai). Chỉ trạng thái 'đã xác thực' được ghi nhận; dữ liệu cá nhân được bảo vệ riêng.",
  },
];

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function HelpPage() {
  const toast = useToast();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SubPage title="Trung tâm trợ giúp" back="/profile">
      <div>
        <p className="sub-group-label">Câu hỏi thường gặp</p>
        {FAQS.map((f, i) => (
          <div key={i} className={`sub-faq${open === i ? " is-open" : ""}`}>
            <button className="sub-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <Chevron />
            </button>
            {open === i && <p className="sub-faq-a">{f.a}</p>}
          </div>
        ))}
      </div>

      <div>
        <p className="sub-group-label">Liên hệ hỗ trợ</p>
        <div className="sub-group">
          <button className="sub-item" onClick={() => toast("Đang mở hộp thoại chat hỗ trợ...", "info")}>
            <span className="sub-item-icon">
              <Icon><path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 16 0Z" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Chat với hỗ trợ viên</p>
              <p className="sub-item-sub">Phản hồi trong giờ hành chính</p>
            </div>
            <Chevron />
          </button>
          <button className="sub-item" onClick={() => toast("Hotline: 1900 xxxx", "info")}>
            <span className="sub-item-icon">
              <Icon><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">Gọi tổng đài</p>
              <p className="sub-item-sub">1900 xxxx</p>
            </div>
            <Chevron />
          </button>
        </div>
      </div>
    </SubPage>
  );
}
