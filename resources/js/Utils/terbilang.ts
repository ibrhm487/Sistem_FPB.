export function terbilang(value: number | string | null | undefined): string {
    const number = Math.floor(Math.abs(Number(value ?? 0)));

    if (!Number.isFinite(number) || number === 0) {
        return 'nol';
    }

    return convert(number).trim();
}

const units = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
];

function convert(n: number): string {
    if (n < 12) {
        return units[n];
    }
    if (n < 20) {
        return `${convert(n - 10)} belas`;
    }
    if (n < 100) {
        return `${convert(Math.floor(n / 10))} puluh ${convert(n % 10)}`;
    }
    if (n < 200) {
        return `seratus ${convert(n - 100)}`;
    }
    if (n < 1000) {
        return `${convert(Math.floor(n / 100))} ratus ${convert(n % 100)}`;
    }
    if (n < 2000) {
        return `seribu ${convert(n - 1000)}`;
    }
    if (n < 1000000) {
        return `${convert(Math.floor(n / 1000))} ribu ${convert(n % 1000)}`;
    }
    if (n < 1000000000) {
        return `${convert(Math.floor(n / 1000000))} juta ${convert(n % 1000000)}`;
    }
    if (n < 1000000000000) {
        return `${convert(Math.floor(n / 1000000000))} miliar ${convert(n % 1000000000)}`;
    }

    return `${convert(Math.floor(n / 1000000000000))} triliun ${convert(n % 1000000000000)}`;
}
