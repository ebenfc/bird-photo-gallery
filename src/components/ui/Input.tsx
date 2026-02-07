"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  floatingLabel?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, floatingLabel = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== "";

    if (floatingLabel && label) {
      return (
        <div className="w-full">
          <div className="relative">
            <input
              ref={ref}
              className={`
                peer block w-full px-4 py-3.5 pt-6
                bg-[var(--card-bg)] text-[var(--foreground)] placeholder-transparent
                border-2 border-[var(--mist-200)] rounded-[var(--radius-lg)]
                shadow-[var(--shadow-inset-sm)]
                transition-all duration-[var(--timing-fast)]
                focus:outline-none focus:border-[var(--moss-400)]
                focus:shadow-[var(--shadow-moss),var(--shadow-inset-sm)]
                hover:border-[var(--mist-300)]
                text-base
                ${error ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15),var(--shadow-inset-sm)]" : ""}
                ${className}
              `}
              placeholder={label}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              {...props}
            />
            <label
              className={`
                absolute left-4 transition-all duration-[var(--timing-fast)] pointer-events-none
                ${isFocused || hasValue
                  ? "top-2 text-xs font-medium text-[var(--moss-600)]"
                  : "top-1/2 -translate-y-1/2 text-base text-[var(--mist-400)]"
                }
                ${error ? "text-red-500" : ""}
                peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium
                peer-focus:text-[var(--moss-600)]
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
                peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--mist-400)]
              `}
            >
              {label}
            </label>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[var(--text-label)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            block w-full px-4 py-3
            bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--mist-400)]
            border-2 border-[var(--mist-200)] rounded-[var(--radius-lg)]
            shadow-[var(--shadow-inset-sm)]
            transition-all duration-[var(--timing-fast)]
            focus:outline-none focus:border-[var(--moss-400)]
            focus:shadow-[var(--shadow-moss),var(--shadow-inset-sm)]
            hover:border-[var(--mist-300)]
            text-base
            ${error ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15),var(--shadow-inset-sm)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
