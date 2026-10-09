export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatCurrency(value: string | number | null | undefined): string {
    const number = Number(value ?? 0);
    return `Rp ${currencyFormatter.format(Number.isFinite(number) ? number : 0)}`;
}

export function formatNumber(value: string | number | null | undefined): string {
    const number = Number(value ?? 0);
    return currencyFormatter.format(Number.isFinite(number) ? number : 0);
}

export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatMonth(month: string): string {
    const [year, m] = month.split('-');
    const date = new Date(Number(year), Number(m) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}
