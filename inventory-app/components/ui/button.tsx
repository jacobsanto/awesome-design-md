import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0",
  {
    variants: {
      variant: {
        default: "text-white",
        secondary: "bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-transparent",
        outline: "bg-white",
        link: "bg-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 px-3 text-[13px]",
        sm: "h-7 px-3 text-[13px]",
        lg: "h-8 px-4 text-[14px]",
        icon: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "var(--notion-blue)",
    color: "#ffffff",
    borderRadius: "3px",
  },
  secondary: {
    background: "transparent",
    color: "var(--notion-text)",
    borderRadius: "3px",
  },
  ghost: {
    background: "transparent",
    color: "var(--notion-text-secondary)",
    borderRadius: "3px",
  },
  destructive: {
    background: "transparent",
    color: "var(--notion-red)",
    borderRadius: "3px",
  },
  outline: {
    background: "white",
    color: "var(--notion-text)",
    border: "1px solid var(--notion-border)",
    borderRadius: "3px",
  },
  link: {
    background: "transparent",
    color: "var(--notion-text)",
    borderRadius: "3px",
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size, asChild = false, style, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const variantKey = variant ?? "default";
    const baseStyle = variantStyles[variantKey] ?? variantStyles.default;

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget as HTMLElement;
      if (variantKey === "default") el.style.background = "#1d74c9";
      else if (variantKey === "secondary") el.style.background = "var(--notion-bg-hover)";
      else if (variantKey === "ghost") el.style.background = "var(--notion-bg-secondary)";
      else if (variantKey === "destructive") el.style.background = "var(--notion-red-bg)";
      else if (variantKey === "outline") el.style.background = "var(--notion-bg-hover)";
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget as HTMLElement;
      if (variantKey === "default") el.style.background = "var(--notion-blue)";
      else if (variantKey === "secondary") el.style.background = "transparent";
      else if (variantKey === "ghost") el.style.background = "transparent";
      else if (variantKey === "destructive") el.style.background = "transparent";
      else if (variantKey === "outline") el.style.background = "white";
      onMouseLeave?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{ ...baseStyle, ...style }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
