import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400 disabled:pointer-events-none disabled:opacity-50 duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-platinum-900 text-platinum-50 shadow hover:bg-platinum-800 hover:shadow-lg hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-platinum-200 bg-transparent shadow-sm hover:bg-platinum-50 hover:text-platinum-900",
        secondary:
          "bg-platinum-100 text-platinum-900 shadow-sm hover:bg-platinum-200",
        ghost: "hover:bg-platinum-100 hover:text-platinum-900",
        link: "text-platinum-900 underline-offset-4 hover:underline",
        luxury:
          "bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-10 text-base",
        xl: "h-14 rounded-md px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }