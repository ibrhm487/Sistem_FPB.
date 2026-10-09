<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Katalog produk Mayora, satu baris per varian.
     *
     * @return array<int, array{0: string, 1: string}>
     */
    private function catalog(): array
    {
        return [
            // Biskuit & Kue
            ['Roma Malkist Original', 'Biskuit & Kue'],
            ['Roma Malkist Coklat', 'Biskuit & Kue'],
            ['Roma Malkist Kelapa', 'Biskuit & Kue'],
            ['Roma Malkist Keju', 'Biskuit & Kue'],
            ['Roma Malkist Sandwich Coklat', 'Biskuit & Kue'],
            ['Roma Marie Susu', 'Biskuit & Kue'],
            ['Roma Biskuit Kelapa', 'Biskuit & Kue'],
            ['Roma Sandwich Vanilla', 'Biskuit & Kue'],
            ['Slai Olai Biskuit Coklat', 'Biskuit & Kue'],
            ['Slai Olai Biskuit Nanas', 'Biskuit & Kue'],
            ['Danisa Butter Cookies', 'Biskuit & Kue'],

            // Wafer & Cokelat
            ['Beng Beng', 'Wafer & Cokelat'],
            ['Beng Beng Maxx', 'Wafer & Cokelat'],
            ['Beng Beng Share It', 'Wafer & Cokelat'],
            ['Choki Choki', 'Wafer & Cokelat'],
            ['Astor Wafer Cokelat', 'Wafer & Cokelat'],
            ['Kopiko Wafer', 'Wafer & Cokelat'],
            ['Roma Wafer Cokelat', 'Wafer & Cokelat'],
            ['Roma Wafer Vanilla', 'Wafer & Cokelat'],
            ['Roma Wafer Kelapa', 'Wafer & Cokelat'],
            ['Milano Wafer Cookies', 'Wafer & Cokelat'],
        ];
    }

    public function run(): void
    {
        $code = 1;

        foreach ($this->catalog() as [$name, $category]) {
            $productCode = 'PRD-' . str_pad((string) $code, 4, '0', STR_PAD_LEFT);

            Product::updateOrCreate(
                ['product_code' => $productCode],
                [
                    'name' => $name,
                    'category' => $category,
                    'unit' => 'pcs',
                    'price' => 0,
                    'tax_rate' => 11,
                    'is_active' => true,
                ],
            );

            $code++;
        }
    }
}
