"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const LEFT_TABS: Tab[] = [
  {
    href: "/",
    label: "Trang chủ",
    icon: (
      <path d="M3 11.5 12 4l9 7.5M5 10v9.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    ),
  },
  {
    href: "/groups",
    label: "Dây hụi",
    icon: (
      <path d="M4 19v-1.5A3.5 3.5 0 0 1 7.5 14h3a3.5 3.5 0 0 1 3.5 3.5V19M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 8v-1.2a3 3 0 0 0-2-2.83M14.5 5.2a3 3 0 0 1 0 5.6" />
    ),
  },
];

const RIGHT_TABS: Tab[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <path d="M4 19V10m6 9V5m6 14v-7M3 19h18" />,
  },
  {
    href: "/profile",
    label: "Hồ sơ",
    icon: (
      <>
        <circle cx="12" cy="8.2" r="3.2" />
        <path d="M5 20c0-3.5 3.1-6.2 7-6.2s7 2.7 7 6.2" />
      </>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link href={tab.href} className={`phone-tab${active ? " phone-tab-active" : ""}`}>
      <svg
        className="phone-tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {tab.icon}
      </svg>
      <span>{tab.label}</span>
    </Link>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="phone-tabbar">
      {LEFT_TABS.map((tab) => (
        <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab.href)} />
      ))}

      <Link href="/create" className="phone-tab-fab-slot">
        <span className="phone-fab">
          <svg
            className="phone-fab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span className="phone-fab-label">Tạo hụi</span>
      </Link>

      {RIGHT_TABS.map((tab) => (
        <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab.href)} />
      ))}
    </nav>
  );
}
