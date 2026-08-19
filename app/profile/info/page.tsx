"use client";

import { useState } from "react";
import { SubPage } from "@/components/SubPage";
import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@/lib/wallet-context";
import { useToast } from "@/components/ToastProvider";

function maskCccd(v?: string) {
  const d = (v ?? "").replace(/\D/g, "");
  if (d.length < 4) return "•••• •••• ••••";
  return `•••• •••• ${d.slice(-4)}`;
}

function truncate(a?: string | null) {
  return a ? `${a.slice(0, 10)}...${a.slice(-8)}` : "Chưa liên kết";
}

export default function PersonalInfoPage() {
  const { user, updateUser } = useAuth();
  const { address } = useWallet();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? user?.account ?? "");

  function handleSave() {
    updateUser({ name: name.trim() || "Người dùng", email: email.trim(), phone: phone.trim() });
    setEditing(false);
    toast("Đã lưu thông tin cá nhân", "success");
  }

  function handleCancel() {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? user?.account ?? "");
    setEditing(false);
  }

  return (
    <SubPage
      title="Thông tin cá nhân"
      back="/profile"
      action={
        !editing ? (
          <button className="btn-link" onClick={() => setEditing(true)}>
            Sửa
          </button>
        ) : null
      }
    >
      {/* Danh tính đã eKYC — chỉ đọc (không sửa được, khớp giấy tờ đã xác thực) */}
      <div>
        <p className="sub-group-label">Danh tính đã xác thực (eKYC)</p>
        <div className="sub-group">
          <div className="sub-item">
            <div className="sub-item-body">
              <p className="sub-item-title">Số CCCD</p>
              <p className="sub-item-sub">{maskCccd(user?.account)}</p>
            </div>
            <span className="badge badge-success">Đã xác thực ✓</span>
          </div>
          <div className="sub-item">
            <div className="sub-item-body">
              <p className="sub-item-title">Ví blockchain</p>
              <p className="sub-item-sub">{truncate(address)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin liên hệ — sửa được */}
      <div>
        <p className="sub-group-label">Thông tin liên hệ</p>
        {editing ? (
          <div className="card stack" style={{ gap: "0.9rem" }}>
            <label className="field">
              Họ và tên
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              Số điện thoại
              <input
                className="input"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="field">
              Email
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <div className="row" style={{ gap: "0.6rem" }}>
              <button className="btn btn-primary" onClick={handleSave}>
                Lưu thay đổi
              </button>
              <button className="btn btn-outline" onClick={handleCancel}>
                Huỷ
              </button>
            </div>
          </div>
        ) : (
          <div className="sub-group">
            <div className="sub-item">
              <div className="sub-item-body">
                <p className="sub-item-title">Họ và tên</p>
                <p className="sub-item-sub">{user?.name || "Chưa cập nhật"}</p>
              </div>
            </div>
            <div className="sub-item">
              <div className="sub-item-body">
                <p className="sub-item-title">Số điện thoại</p>
                <p className="sub-item-sub">{user?.phone || user?.account || "Chưa cập nhật"}</p>
              </div>
            </div>
            <div className="sub-item">
              <div className="sub-item-body">
                <p className="sub-item-title">Email</p>
                <p className="sub-item-sub">{user?.email || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SubPage>
  );
}
