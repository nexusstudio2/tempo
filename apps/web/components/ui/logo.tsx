import { cn } from "@/lib/cn";

export function LogoMark({ className, accent = "var(--br)" }: { className?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10", className)} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="36" cy="38" r="19" />
        <path d="M31 11h10M36 11v6M51 20l4-4M54 14l4 4M3 31h9M1 38h11M5 45h8" />
      </g>
      <path d="M28 38l6 6 10-11" fill="none" stroke={accent} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="Tempo" className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <LogoMark />
      <span aria-hidden="true" className="font-display text-[32px] font-semibold leading-none tracking-tight">
        tempo
      </span>
    </span>
  );
}
