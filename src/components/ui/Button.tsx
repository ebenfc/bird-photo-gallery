import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-semibold
      rounded-[var(--radius-xl)]
      transition-all duration-[var(--timing-fast)]
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
      active:scale-[0.96] active:shadow-sm
      motion-reduce:transition-none motion-reduce:active:scale-100
    `;

    const variants = {
      primary: `
        bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)]
        text-white font-semibold
        shadow-[var(--shadow-md)]
        hover:from-[var(--moss-400)] hover:to-[var(--moss-500)]
        hover:shadow-[var(--shadow-moss-lg)] hover:-translate-y-0.5
        focus-visible:ring-[var(--moss-400)]
        active:from-[var(--moss-600)] active:to-[var(--moss-700)]
      `,
      secondary: `
        bg-[var(--card-bg)] text-[var(--text-label)] font-medium
        border-2 border-[var(--mist-200)]
        shadow-[var(--shadow-sm)]
        hover:bg-[var(--surface-moss)] hover:border-[var(--moss-300)]
        hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5
        focus-visible:ring-[var(--moss-400)]
        active:bg-[var(--moss-100)] active:border-[var(--moss-400)]
      `,
      ghost: `
        text-[var(--mist-600)] font-medium
        hover:text-[var(--forest-700)] hover:bg-[var(--surface-moss)]
        focus-visible:ring-[var(--moss-400)]
        active:bg-[var(--moss-100)]
      `,
      danger: `
        bg-gradient-to-b from-red-500 to-red-600
        text-white font-semibold
        shadow-[var(--shadow-md)]
        hover:from-red-400 hover:to-red-500
        hover:shadow-[0_4px_16px_rgba(239,68,68,0.25)] hover:-translate-y-0.5
        focus-visible:ring-red-400
        active:from-red-600 active:to-red-700
      `,
    };

    const sizes = {
      sm: "px-4 py-2 text-sm min-h-[44px]",
      md: "px-5 py-2.5 text-sm min-h-[44px]",
      lg: "px-7 py-3.5 text-base min-h-[52px]",
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
