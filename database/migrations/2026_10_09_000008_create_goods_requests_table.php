<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goods_requests', function (Blueprint $table) {
            $table->id();
            $table->string('fpb_number', 30)->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();

            // Header snapshot (taken from the requesting salesman + input).
            $table->string('branch', 100)->nullable();
            $table->string('subbranch', 100)->nullable();
            $table->string('salesman_name', 150)->nullable();
            $table->date('request_date');
            $table->string('ryn', 100)->nullable();
            $table->string('vehicle_number', 50)->nullable();

            $table->string('status', 20)->default('DRAFT')->index();
            $table->text('notes')->nullable();

            // Signature / approval blocks.
            $table->string('approved_by_name', 150)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->string('checked_by_name', 150)->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->string('requested_by_name', 150)->nullable();
            $table->timestamp('requested_at')->nullable();

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('request_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_requests');
    }
};
