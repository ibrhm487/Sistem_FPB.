import { cn } from '@/Utils/format';
import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function TableWrap({ children }: { children: ReactNode }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-left text-sm">
                {children}
            </table>
        </div>
    );
}

export function THead({ children }: { children: ReactNode }) {
    return (
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            {children}
        </thead>
    );
}

export function TBody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TR({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return <tr className={cn('hover:bg-gray-50/70', className)}>{children}</tr>;
}

export function TH({
    children,
    className,
    ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
    return (
        <th
            className={cn('whitespace-nowrap px-4 py-3 font-semibold', className)}
            {...props}
        >
            {children}
        </th>
    );
}

export function TD({
    children,
    className,
    ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
    return (
        <td className={cn('px-4 py-3 text-gray-700', className)} {...props}>
            {children}
        </td>
    );
}
