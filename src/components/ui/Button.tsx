import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]";

    const variants = {
      primary:
        "bg-gradient-to-b from-[var(--forest-700)] to-[var(--forest-800)] text-white hover:from-[var(--forest-600)] hover:to-[var(--forest-700)] focus:ring-[var(--forest-500)]",
      secondary:
        "bg-white text-[var(--forest-800)] border border-[var(--mist-200)] hover:bg-[var(--moss-50)] hover:border-[var(--moss-300)] focus:ring-[var(--moss-400)]",
      ghost:
        "text-[var(--mist-600)] hover:text-[var(--forest-700)] hover:bg-[var(--moss-50)] focus:ring-[var(--moss-400)] shadow-none hover:shadow-none",
      danger:
        "bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
