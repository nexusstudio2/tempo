"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = { label: string; icon: string; href?: string; onClick?: () => void; active?: boolean };

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 grid border-t border-line bg-surface px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))]"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      {items.map((item) => {
        const active = item.active ?? (item.href ? pathname.startsWith(item.href) : false);
        const className = cn(
          "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-medium",
          active ? "font-semibold text-brand" : "text-muted",
        );
        const content = (
          <>
            <span aria-hidden="true" className="text-xl leading-none">
              {item.icon}
            </span>
            {item.label}
          </>
        );
        return item.href ? (
          <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={className}>
            {content}
          </Link>
        ) : (
          <button key={item.label} type="button" onClick={item.onClick} aria-current={active ? "page" : undefined} className={className}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
