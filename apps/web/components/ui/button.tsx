import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  full?: boolean;
};

const variants = {
  primary: "bg-brand text-white",
  secondary: "bg-surface text-ink border-[1.5px] border-line",
  danger: "bg-danger-soft text-danger",
};

export function Button({ variant = "primary", full = true, className, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "min-h-[52px] rounded-[14px] px-5 text-base font-semibold transition active:scale-[.99] disabled:opacity-60",
        variants[variant],
        full && "w-full",
        className,
      )}
      {...props}
    />
  );
}
