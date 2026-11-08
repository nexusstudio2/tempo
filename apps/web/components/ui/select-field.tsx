import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string };

export const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, error, className, id, children, ...props },
  ref,
) {
  const auto = useId();
  const selectId = id ?? auto;
  return (
    <div className="mb-[18px]">
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={cn("h-[52px] w-full rounded-[14px] border-[1.5px] bg-surface px-3.5 text-base text-ink", error ? "border-danger" : "border-line", className)}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
