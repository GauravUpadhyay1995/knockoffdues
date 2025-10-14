import * as React from "react";
import { cn } from "@/lib/utils"; // Optional: utility for merging classes (see below)

/**
 * Root Card component — wraps content in a clean, rounded container
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * Inner content wrapper for padding and layout consistency
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * Optional: Header for titles inside cards
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 pb-0 text-lg font-semibold", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Optional: Footer for actions or summaries inside cards
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 pt-0 border-t border-gray-100", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
