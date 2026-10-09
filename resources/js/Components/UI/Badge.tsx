import { cn } from '@/Utils/format';
import { ReactNode } from 'react';

type Tone = 'gray' | 'blue' | 'amber' | 'red' | 'green' | 'slate' | 'indigo';

const tones: Record<Tone, string> = {
    gray: 'bg-gray-100 text-gray-700 ring-gray-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export default function Badge({
    tone = 'gray',
    children,
    className,
}: {
    tone?: Tone;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
