import { cn } from '@/Utils/format';
import { ReactNode } from 'react';

export function Card({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-gray-200 bg-white shadow-sm',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    description,
    action,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                {description && (
                    <p className="mt-0.5 text-sm text-gray-500">{description}</p>
                )}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}

export function CardBody({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn('p-5', className)}>{children}</div>;
}
