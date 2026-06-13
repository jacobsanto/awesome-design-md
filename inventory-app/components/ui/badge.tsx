import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-1.5 py-0.5 font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        destructive: "",
        outline: "",
        success: "",
        warning: "",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
);

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "var(--notion-gray-bg)",
    color: "var(--notion-text)",
    borderRadius: "3px",
    fontSize: "11px",
  },
  secondary: {
    background: "var(--notion-gray-bg)",
    color: "var(--notion-text-secondary)",
    borderRadius: "3px",
    fontSize: "11px",
  },
  destructive: {
    background: "var(--notion-red-bg)",
    color: "var(--notion-red)",
    borderRadius: "3px",
    fontSize: "11px",
  },
  outline: {
    background: "transparent",
    color: "var(--notion-text-secondary)",
    border: "1px solid var(--notion-border)",
    borderRadius: "3px",
    fontSize: "11px",
  },
  success: {
    background: "var(--notion-green-bg)",
    color: "var(--notion-green)",
    borderRadius: "3px",
    fontSize: "11px",
  },
  warning: {
    background: "var(--notion-yellow-bg)",
    color: "var(--notion-yellow)",
    borderRadius: "3px",
    fontSize: "11px",
  },
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = "secondary", style, ...props }: BadgeProps) {
  const variantStyle = variantStyles[variant ?? "secondary"] ?? variantStyles.secondary;
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyle, ...style }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
