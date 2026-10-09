<?php

namespace App\Services;

class TerbilangService
{
    /**
     * @var array<int, string>
     */
    private array $units = [
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

    /**
     * Convert a number into Indonesian words ("terbilang").
     */
    public function terbilang(float|int $number): string
    {
        $value = (int) floor(abs($number));

        if ($value === 0) {
            return 'nol';
        }

        return trim($this->convert($value));
    }

    private function convert(int $number): string
    {
        if ($number < 12) {
            return $this->units[$number];
        }

        if ($number < 20) {
            return $this->convert($number - 10) . ' belas';
        }

        if ($number < 100) {
            return $this->convert(intdiv($number, 10)) . ' puluh ' . $this->convert($number % 10);
        }

        if ($number < 200) {
            return 'seratus ' . $this->convert($number - 100);
        }

        if ($number < 1000) {
            return $this->convert(intdiv($number, 100)) . ' ratus ' . $this->convert($number % 100);
        }

        if ($number < 2000) {
            return 'seribu ' . $this->convert($number - 1000);
        }

        if ($number < 1000000) {
            return $this->convert(intdiv($number, 1000)) . ' ribu ' . $this->convert($number % 1000);
        }

        if ($number < 1000000000) {
            return $this->convert(intdiv($number, 1000000)) . ' juta ' . $this->convert($number % 1000000);
        }

        if ($number < 1000000000000) {
            return $this->convert(intdiv($number, 1000000000)) . ' miliar ' . $this->convert($number % 1000000000);
        }

        return $this->convert(intdiv($number, 1000000000000)) . ' triliun ' . $this->convert($number % 1000000000000);
    }
}
