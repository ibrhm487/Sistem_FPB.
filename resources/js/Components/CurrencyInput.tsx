import { Input } from '@/Components/UI/Input';
import { InputHTMLAttributes } from 'react';

interface CurrencyInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number | string;
    onValueChange: (value: number) => void;
}

export default function CurrencyInput({
    value,
    onValueChange,
    ...props
}: CurrencyInputProps) {
    const numeric = Number(value ?? 0);

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">
                Rp
            </span>
            <Input
                {...props}
                type="text"
                inputMode="numeric"
                className="pl-9 text-right"
                value={numeric ? numeric.toLocaleString('id-ID') : ''}
                onChange={(event) => {
                    const raw = event.target.value.replace(/[^\d]/g, '');
                    onValueChange(raw ? Number(raw) : 0);
                }}
            />
        </div>
    );
}
