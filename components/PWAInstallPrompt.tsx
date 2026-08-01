"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// beforeinstallprompt chưa có trong lib.dom mặc định → khai báo tối thiểu (không any).
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = "pwa-install-dismissed";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPad iOS 13+ báo cáo như macOS nhưng có cảm ứng.
  const iPadOS = ua.includes("Macintosh") && "ontouchend" in document;
  return iOSDevice || iPadOS;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS dùng navigator.standalone (không chuẩn) → ép kiểu tối thiểu.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return; // đã cài → không hiện
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* localStorage có thể bị chặn — bỏ qua */
    }

    const iosDevice = isIos();
    setIos(iosDevice);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari không phát beforeinstallprompt → hiện hướng dẫn thủ công.
    if (iosDevice) setVisible(true);

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* bỏ qua */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") setVisible(false);
    else dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="install-card"
          role="dialog"
          aria-label="Cài đặt ứng dụng"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          <div className="install-card-head">
            <span className="install-card-logo" aria-hidden="true">
              H
            </span>
            <div className="install-card-title">
              <strong>Cài đặt Quản lý Hụi</strong>
              <span className="muted">Mở nhanh như một ứng dụng thật, dùng được cả khi offline.</span>
            </div>
            <button
              type="button"
              className="install-card-close"
              onClick={dismiss}
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {ios ? (
            <ol className="install-steps">
              <li>
                Nhấn nút <strong>Chia sẻ</strong>
                <span className="install-ios-icon" aria-hidden="true">
                  {/* icon Share của iOS */}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M8 8l4-4 4 4" />
                    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                  </svg>
                </span>{" "}
                trên thanh Safari.
              </li>
              <li>
                Chọn <strong>Thêm vào MH chính</strong> (Add to Home Screen).
              </li>
              <li>
                Nhấn <strong>Thêm</strong> — xong! Biểu tượng Hụi xuất hiện ở màn hình chính.
              </li>
            </ol>
          ) : (
            <div className="install-actions">
              <button type="button" className="btn btn-primary" onClick={install} disabled={!deferred}>
                Cài đặt ứng dụng
              </button>
              <button type="button" className="btn btn-outline" onClick={dismiss}>
                Để sau
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
