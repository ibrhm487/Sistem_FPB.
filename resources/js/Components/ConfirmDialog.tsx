import Button from '@/Components/UI/Button';
import Modal from '@/Components/Modal';
import { ReactNode } from 'react';

export default function ConfirmDialog({
    show,
    title,
    message,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    processing = false,
    variant = 'primary',
    onConfirm,
    onClose,
    children,
}: {
    show: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    processing?: boolean;
    variant?: 'primary' | 'danger' | 'success';
    onConfirm: () => void;
    onClose: () => void;
    children?: ReactNode;
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
                {children && <div className="mt-4">{children}</div>}
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        {cancelLabel}
                    </Button>
                    <Button variant={variant} loading={processing} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
