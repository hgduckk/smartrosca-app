"use client";

import Link from "next/link";
import { ShieldArt } from "@/components/onboarding/KycArt";
import { WaveBg } from "@/components/onboarding/WaveBg";

const CHECKS = ["Chụp rõ nét", "Rõ thông tin", "Không bị che khuất"];

function Tick() {
  return (
    <svg className="ob-tick" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function VerifyIntroPage() {
  return (
    <div className="ob-screen">
      <div className="ob-body">
        <div style={{ marginTop: "2rem" }}>
          <h1 className="ob-title">Xác minh danh tính</h1>
          <p className="ob-subtitle">
            Tải lên giấy tờ tùy thân
            <br />
            để xác minh danh tính
          </p>
        </div>

        <ul className="ob-tick-list" style={{ marginTop: "2rem", alignSelf: "center" }}>
          {CHECKS.map((c) => (
            <li key={c}>
              <Tick /> {c}
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}>
          <ShieldArt size={210} />
        </div>

        <div className="ob-spacer" />

        <Link href="/verify/cccd-front" className="ob-btn">
          Tiếp tục
        </Link>
      </div>
      <WaveBg />
    </div>
  );
}
