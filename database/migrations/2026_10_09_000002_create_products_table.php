<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_code', 30)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit', 20)->default('pcs');
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(11);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
