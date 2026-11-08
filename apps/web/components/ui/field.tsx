import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export const Field = forwardRef<HTMLInputElement, Props>(function Field({ label, error, className, id, ...props }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className="mb-[18px]">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "h-[52px] w-full rounded-[14px] border-[1.5px] bg-surface px-4 text-base text-ink",
          error ? "border-danger" : "border-line",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
