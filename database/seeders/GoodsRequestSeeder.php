<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Services\GoodsRequestService;
use Illuminate\Database\Seeder;

class GoodsRequestSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(GoodsRequestService::class);

        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->take(6)
            ->get();

        $sales = User::query()->where('role', 'sales')->orderBy('name')->get();
        $admin = User::query()->where('role', 'admin')->first();

        if ($products->isEmpty() || $sales->isEmpty() || ! $admin) {
            return;
        }

        foreach ($sales->take(3)->values() as $index => $salesman) {
            $items = $products->take(4)->values()->map(fn (Product $product, int $i) => [
                'product_id' => $product->id,
                'qty_ktn' => ($i + 1) * 2,
                'qty_rcg' => $i + 1,
                'qty_bks' => $i % 2 === 0 ? 3 : 0,
            ])->all();

            $request = $service->create([
                'request_date' => now()->subDays($index)->toDateString(),
                'ryn' => 'RYN-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'vehicle_number' => 'B ' . (1000 + $index) . ' XYZ',
                'notes' => 'Contoh data FPB untuk demonstrasi.',
                'items' => $items,
            ], $salesman, $index < 2);

            if ($index === 0) {
                $service->approve($request, $admin, [
                    'approved_by_name' => 'BSM ' . $salesman->branch,
                    'checked_by_name' => 'SK ' . $salesman->branch,
                ]);
            }
        }
    }
}
