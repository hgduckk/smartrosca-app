"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WaveBg } from "@/components/onboarding/WaveBg";

// Màn chụp CCCD (mặt trước / mặt sau) — dùng camera THẬT của thiết bị qua
// getUserMedia để đi trọn quy trình quét. Ở bản test không có backend OCR: ảnh
// chụp được lưu tạm vào sessionStorage, bước "Kiểm tra thông tin" sẽ điền dữ liệu
// giả lập. Nếu thiết bị không có camera / bị từ chối quyền, vẫn có nút "Dùng ảnh
// mẫu" để hoàn tất luồng demo.
type Phase = "live" | "captured" | "scanning";

export function CameraCapture({
  title,
  subtitle,
  nextHref,
  storageKey,
}: {
  title: string;
  subtitle: string;
  nextHref: string;
  storageKey?: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("live");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [photo, setPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState(false); // hiệu ứng chớp khi chụp
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setReady(false);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch {
      setError("Không truy cập được camera. Hãy cho phép quyền camera hoặc dùng ảnh mẫu để tiếp tục.");
    }
  }, [facing, stopStream]);

  // Khởi động / khởi động lại camera khi ở chế độ xem trực tiếp hoặc đổi camera.
  useEffect(() => {
    if (phase !== "live") return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt không hỗ trợ camera. Dùng ảnh mẫu để tiếp tục.");
      return;
    }
    startStream();
    return stopStream;
  }, [phase, startStream, stopStream]);

  useEffect(() => stopStream, [stopStream]);

  function persist(dataUrl: string) {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, dataUrl);
    } catch {
      /* sessionStorage không khả dụng — bỏ qua, luồng vẫn tiếp tục */
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      // camera trước bị lật gương — vẽ lại cho đúng chiều.
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    setPhoto(dataUrl);
    setPhase("captured");
    stopStream();
  }

  // Không có camera: tạo ảnh mẫu để luồng demo đi tiếp.
  function useSample() {
    const canvas = document.createElement("canvas");
    canvas.width = 856;
    canvas.height = 540;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, "#e6e2ee");
      g.addColorStop(1, "#c9c2e0");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6c4bf4";
      ctx.font = "bold 40px system-ui, sans-serif";
      ctx.fillText("CĂN CƯỚC CÔNG DÂN", 60, 90);
      ctx.fillStyle = "#241f4d";
      ctx.font = "600 30px system-ui, sans-serif";
      ctx.fillText("Ảnh mẫu (bản demo)", 60, 300);
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    setPhase("captured");
    stopStream();
  }

  function retake() {
    setPhoto(null);
    setPhase("live");
  }

  function confirm() {
    if (photo) persist(photo);
    setPhase("scanning");
    // Giả lập nhận diện/OCR rồi sang bước kế.
    setTimeout(() => router.push(nextHref), 1400);
  }

  return (
    <div className="ob-camera">
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <h1 className="ob-title">{title}</h1>
        <p className="ob-subtitle">
          {phase === "scanning" ? "Đang nhận diện thông tin trên thẻ..." : subtitle}
        </p>
      </div>

      <div className="ob-frame">
        <div className="ob-frame-media">
          {phase === "live" && !error && (
            <video
              ref={videoRef}
              className="ob-cam-video"
              playsInline
              muted
              style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
            />
          )}
          {phase === "live" && error && (
            <div className="ob-cam-error">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
                <circle cx="12" cy="13" r="4" />
                <path d="M1 1l22 22" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {phase !== "live" && photo && (
            <img src={photo} alt="Ảnh CCCD đã chụp" className="ob-cap-photo" />
          )}
          {phase === "scanning" && (
            <div className="ob-frame-scan">
              <span className="ob-scan-line" />
              <span>Đang nhận diện...</span>
            </div>
          )}
        </div>
        <span className="ob-frame-corner tl" />
        <span className="ob-frame-corner tr" />
        <span className="ob-frame-corner bl" />
        <span className="ob-frame-corner br" />
        {flash && <span className="ob-flash-pop" />}
      </div>

      {phase === "live" && (
        <div className="ob-camera-controls">
          <button
            type="button"
            className="ob-camera-icon-btn"
            aria-label="Đổi camera"
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            disabled={!!error}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 21v-5h5M21 3v5h-5" />
            </svg>
          </button>

          <button
            type="button"
            className="ob-shutter"
            aria-label="Chụp ảnh"
            onClick={capture}
            disabled={!ready || !!error}
          />

          <button
            type="button"
            className="ob-camera-icon-btn ob-cam-sample"
            aria-label="Dùng ảnh mẫu"
            onClick={useSample}
            title="Dùng ảnh mẫu"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 15l4-4 4 4 3-3 5 5" />
              <circle cx="9" cy="10" r="1.4" />
            </svg>
          </button>
        </div>
      )}

      {phase === "captured" && (
        <div className="ob-cap-actions">
          <button type="button" className="ob-btn ob-btn--outline" onClick={retake}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-2.6-6.3" />
              <path d="M21 4v5h-5" />
            </svg>
            Chụp lại
          </button>
          <button type="button" className="ob-btn" onClick={confirm}>
            Dùng ảnh này
          </button>
        </div>
      )}

      {phase === "live" && (
        <p className="ob-cam-hint">
          {error
            ? "Bấm biểu tượng ảnh để dùng ảnh mẫu và tiếp tục."
            : "Đặt CCCD nằm gọn trong khung, đủ sáng và rõ nét."}
        </p>
      )}

      <WaveBg />
    </div>
  );
}
