import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, children, ...props }, ref) => {
    return (
      <div className={className || "w-full"}>
        {label && (
          <label className="block text-sm font-semibold text-[var(--forest-800)] mb-2">
            {label}
          </label>
        )}
        <div className="relative inline-flex w-full">
          <select
            ref={ref}
            className={`
              block w-full px-4 py-3 pr-10
              bg-white text-[var(--foreground)]
              border-2 border-[var(--mist-200)] rounded-[var(--radius-lg)]
              shadow-[var(--shadow-sm)]
              appearance-none cursor-pointer
              transition-all duration-[var(--timing-fast)]
              focus:outline-none focus:border-[var(--moss-400)]
              focus:shadow-[var(--shadow-moss)]
              hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-md)]
              text-base font-medium
              ${error ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}
            `}
            {...props}
          >
            {children}
          </select>
          {/* Custom dropdown arrow with animation */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-[var(--mist-500)] transition-transform duration-[var(--timing-fast)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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
);

Select.displayName = "Select";

export default Select;
