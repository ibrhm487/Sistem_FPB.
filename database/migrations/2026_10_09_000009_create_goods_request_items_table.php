<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goods_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_request_id')->constrained('goods_requests')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();

            $table->unsignedInteger('line_number')->default(1);

            // Product snapshot so the printed document never changes if master data changes.
            $table->string('product_code', 50)->nullable();
            $table->string('product_name', 200);
            $table->string('unit', 30)->nullable();

            // DIMINTA has three segments with the same unit but different destinations.
            // They are stored separately and are intentionally NOT summed into a single quantity.
            $table->decimal('qty_ktn', 15, 2)->default(0);
            $table->decimal('qty_rcg', 15, 2)->default(0);
            $table->decimal('qty_bks', 15, 2)->default(0);

            $table->timestamps();

            $table->index('goods_request_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_request_items');
    }
};
