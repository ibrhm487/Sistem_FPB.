import { cn } from '@/Utils/format';
import { ReactNode } from 'react';

const palette = [
    '#2563eb',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#0ea5e9',
    '#64748b',
];

export function DonutChart({
    data,
    size = 180,
    thickness = 26,
    centerLabel,
}: {
    data: { label: string; value: number; color?: string }[];
    size?: number;
    thickness?: number;
    centerLabel?: ReactNode;
}) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={thickness}
                    />
                    {total > 0 &&
                        data.map((item, index) => {
                            const fraction = item.value / total;
                            const dash = fraction * circumference;
                            const circle = (
                                <circle
                                    key={index}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={item.color ?? palette[index % palette.length]}
                                    strokeWidth={thickness}
                                    strokeDasharray={`${dash} ${circumference - dash}`}
                                    strokeDashoffset={-offset}
                                />
                            );
                            offset += dash;
                            return circle;
                        })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {centerLabel}
                    <span className="text-xl font-bold text-gray-900">{total}</span>
                </div>
            </div>
            <ul className="flex-1 space-y-2">
                {data.map((item, index) => (
                    <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color ?? palette[index % palette.length] }}
                            />
                            {item.label}
                        </span>
                        <span className="font-medium text-gray-900">
                            {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function BarChart({
    data,
    height = 220,
    valueFormatter,
}: {
    data: { label: string; value: number; secondary?: number }[];
    height?: number;
    valueFormatter?: (value: number) => string;
}) {
    const max = Math.max(...data.map((item) => item.value), 1);

    if (data.length === 0) {
        return <p className="py-8 text-center text-sm text-gray-400">Belum ada data.</p>;
    }

    return (
        <div className="flex items-end gap-2 overflow-x-auto" style={{ height }}>
            {data.map((item, index) => (
                <div key={index} className="flex min-w-[42px] flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-500">
                        {valueFormatter ? valueFormatter(item.value) : item.value}
                    </span>
                    <div
                        className="w-full rounded-t-md bg-blue-500/80 transition hover:bg-blue-600"
                        style={{
                            height: `${Math.max((item.value / max) * (height - 50), 4)}px`,
                        }}
                        title={`${item.label}: ${item.value}`}
                    />
                    <span className="whitespace-nowrap text-[10px] text-gray-500">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function RankList({
    data,
    valueFormatter,
    emptyText = 'Belum ada data.',
}: {
    data: { label: string; value: number; hint?: string }[];
    valueFormatter?: (value: number) => string;
    emptyText?: string;
}) {
    const max = Math.max(...data.map((item) => item.value), 1);

    if (data.length === 0) {
        return <p className="py-8 text-center text-sm text-gray-400">{emptyText}</p>;
    }

    return (
        <ul className="space-y-3">
            {data.map((item, index) => (
                <li key={index}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-gray-700">{item.label}</span>
                        <span className="shrink-0 font-medium text-gray-900">
                            {valueFormatter ? valueFormatter(item.value) : item.value}
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className={cn('h-full rounded-full', index === 0 ? 'bg-blue-600' : 'bg-blue-400')}
                            style={{ width: `${(item.value / max) * 100}%` }}
                        />
                    </div>
                    {item.hint && (
                        <p className="mt-0.5 text-xs text-gray-400">{item.hint}</p>
                    )}
                </li>
            ))}
        </ul>
    );
}
