import { cn } from '@/Utils/format';
import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
    'block w-full rounded-lg border-gray-300 text-sm shadow-sm transition focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className, ...props }, ref) {
        return <input ref={ref} className={cn(base, className)} {...props} />;
    },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    function Select({ className, children, ...props }, ref) {
        return (
            <select ref={ref} className={cn(base, 'pr-8', className)} {...props}>
                {children}
            </select>
        );
    },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    function Textarea({ className, ...props }, ref) {
        return <textarea ref={ref} className={cn(base, className)} {...props} />;
    },
);
