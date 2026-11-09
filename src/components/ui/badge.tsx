import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0052ff] text-white shadow-xs",
        secondary:
          "border-slate-200/80 bg-slate-100 text-slate-800",
        destructive:
          "border-rose-200/80 bg-rose-50 text-rose-800 font-semibold shadow-xs",
        outline: "border-slate-300 text-slate-900 bg-white",
        success:
          "border-emerald-200/80 bg-emerald-50 text-emerald-800 font-semibold shadow-xs",
        warning:
          "border-amber-200/80 bg-amber-50 text-amber-900 font-semibold shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

