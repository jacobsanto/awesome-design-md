import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[13px] font-medium transition-colors duration-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#2383E2] text-white hover:bg-[#1d74c9] rounded-[3px]",
        secondary:
          "bg-transparent text-[#37352F] hover:bg-[#EFEFEF] rounded-[3px]",
        outline:
          "bg-white text-[#37352F] border border-[#E9E8E4] hover:bg-[#F7F6F3] rounded-[3px]",
        ghost:
          "bg-transparent text-[#787774] hover:bg-[#F7F6F3] hover:text-[#37352F] rounded-[3px]",
        destructive:
          "bg-transparent text-[#EB5757] hover:bg-[#FBE4E4] rounded-[3px]",
        link: "text-[#2383E2] underline-offset-2 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-7 px-3 py-0",
        sm: "h-6 px-2 text-[12px]",
        lg: "h-8 px-4 text-[14px]",
        icon: "h-7 w-7 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
