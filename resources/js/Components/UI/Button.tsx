import { cn } from '@/Utils/format';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}

const variants: Record<Variant, string> = {
    primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 disabled:bg-blue-400',
    secondary:
        'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:outline-gray-600 disabled:bg-gray-100',
    outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-600',
    ghost: 'text-gray-600 hover:bg-gray-100 focus-visible:outline-gray-600',
    danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-400',
    success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600 disabled:bg-emerald-400',
};

const sizes: Record<Size, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
});

export default Button;
