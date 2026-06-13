import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, onFocus, onBlur, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = "var(--notion-blue)";
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = "var(--notion-border)";
      onBlur?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-2 py-1 text-[14px] disabled:cursor-not-allowed disabled:opacity-50 outline-none",
          className
        )}
        style={{
          height: "28px",
          border: "1px solid var(--notion-border)",
          borderRadius: "3px",
          background: "var(--notion-bg)",
          color: "var(--notion-text)",
          ...style,
        }}
        placeholder={props.placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
