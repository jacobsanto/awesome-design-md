import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, onFocus, onBlur, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--notion-blue)";
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--notion-border)";
      onBlur?.(e);
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full px-2 py-1.5 text-[14px] disabled:cursor-not-allowed disabled:opacity-50 outline-none resize-none",
          className
        )}
        style={{
          border: "1px solid var(--notion-border)",
          borderRadius: "3px",
          background: "var(--notion-bg)",
          color: "var(--notion-text)",
          ...style,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
