import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--primary-strong)]",
        secondary: "bg-white text-[var(--foreground)] ring-1 ring-[var(--border)] hover:bg-slate-50",
        ghost: "bg-transparent text-[var(--foreground)] hover:bg-white/50"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ asChild, className, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
