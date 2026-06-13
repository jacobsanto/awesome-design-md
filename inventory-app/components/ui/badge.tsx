import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-[3px] transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-[#37352F] text-white",
        secondary:   "bg-[#E3E2E0] text-[#787774]",
        outline:     "border border-[#E9E8E4] text-[#787774] bg-transparent",
        destructive: "bg-[#FBE4E4] text-[#EB5757]",
        success:     "bg-[#DDEDEA] text-[#0F7B6C]",
        warning:     "bg-[#FBF3DB] text-[#DFAB01]",
        blue:        "bg-[#E7F3FF] text-[#1A6FBF]",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
