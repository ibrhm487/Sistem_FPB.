<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'product_code' => 'PRD-' . str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'name' => ucwords(fake()->words(3, true)),
            'category' => fake()->randomElement(['Biskuit & Kue', 'Wafer & Cokelat']),
            'description' => fake()->sentence(),
            'unit' => fake()->randomElement(['pcs', 'box', 'unit', 'lusin', 'kg']),
            'price' => fake()->numberBetween(10, 500) * 1000,
            'tax_rate' => 11,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
