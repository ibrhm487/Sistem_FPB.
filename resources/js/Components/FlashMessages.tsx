import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Toast = { id: number; type: 'success' | 'error'; message: string };

export default function FlashMessages() {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const next: Toast[] = [];

        if (flash?.success) {
            next.push({ id: Date.now(), type: 'success', message: flash.success });
        }
        if (flash?.error) {
            next.push({ id: Date.now() + 1, type: 'error', message: flash.error });
        }

        if (next.length > 0) {
            setToasts((current) => [...current, ...next]);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (toasts.length === 0) {
            return;
        }
        const timer = setTimeout(() => {
            setToasts((current) => current.slice(1));
        }, 4000);
        return () => clearTimeout(timer);
    }, [toasts]);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={
                        'pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg ' +
                        (toast.type === 'success'
                            ? 'border-emerald-200'
                            : 'border-red-200')
                    }
                >
                    <span
                        className={
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ' +
                            (toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500')
                        }
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d={toast.type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
                            />
                        </svg>
                    </span>
                    <p className="text-sm text-gray-700">{toast.message}</p>
                </div>
            ))}
        </div>
    );
}
