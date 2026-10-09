import { Card } from '@/Components/UI/Card';
import { cn } from '@/Utils/format';
import { ReactNode } from 'react';

const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
    indigo: 'bg-indigo-50 text-indigo-600',
} as const;

export default function StatCard({
    label,
    value,
    icon,
    tone = 'blue',
    hint,
}: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    tone?: keyof typeof toneMap;
    hint?: string;
}) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
                </div>
                {icon && (
                    <div
                        className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                            toneMap[tone],
                        )}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
