"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Shake" },
  { href: "/saved", label: "Saved" },
  { href: "/settings", label: "Settings" },
  { href: "/diet", label: "The Diet" },
] as const;

export default function BottomNav({ savedCount }: { savedCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {item.label}
                {item.href === "/saved" && savedCount > 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 text-[10px] tabular-nums text-emerald-400">
                    {savedCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
