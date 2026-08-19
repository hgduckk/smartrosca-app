"use client";

import { useState } from "react";
import { SubPage } from "@/components/SubPage";
import { useToast } from "@/components/ToastProvider";

type Device = {
  id: string;
  name: string;
  info: string;
  current: boolean;
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

// Danh sách phiên đăng nhập mock. Giai đoạn thật thay bằng nguồn từ hệ thống auth
// (Supabase sessions), và nút "Đăng xuất" gọi API thu hồi phiên tương ứng.
const SEED: Device[] = [
  { id: "d1", name: "iPhone 15 của bạn", info: "TP. Hồ Chí Minh · Đang hoạt động", current: true },
  { id: "d2", name: "Chrome · Windows", info: "TP. Hồ Chí Minh · 2 giờ trước", current: false },
  { id: "d3", name: "Samsung Galaxy A54", info: "Bình Dương · 3 ngày trước", current: false },
];

export default function DevicesPage() {
  const toast = useToast();
  const [devices, setDevices] = useState<Device[]>(SEED);

  function signOut(id: string) {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast("Đã đăng xuất thiết bị", "success");
  }

  return (
    <SubPage title="Thiết bị đăng nhập" back="/profile">
      <p className="sub-item-sub" style={{ margin: "0 0.2rem" }}>
        Đây là các thiết bị đang đăng nhập vào tài khoản của bạn. Đăng xuất thiết bị lạ nếu bạn không nhận ra.
      </p>
      <div className="sub-group">
        {devices.map((d) => (
          <div key={d.id} className="sub-item">
            <span className="sub-item-icon">
              <Icon><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M11 18h2" /></Icon>
            </span>
            <div className="sub-item-body">
              <p className="sub-item-title">{d.name}</p>
              <p className="sub-item-sub">{d.info}</p>
            </div>
            {d.current ? (
              <span className="badge badge-success">Thiết bị này</span>
            ) : (
              <button className="btn-link" style={{ color: "var(--color-danger)" }} onClick={() => signOut(d.id)}>
                Đăng xuất
              </button>
            )}
          </div>
        ))}
      </div>
    </SubPage>
  );
}
