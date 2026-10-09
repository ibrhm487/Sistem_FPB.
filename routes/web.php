<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoodsRequestController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Form Permintaan Barang / FPB (Admin & Sales)
    |--------------------------------------------------------------------------
    */
    Route::get('goods-requests', [GoodsRequestController::class, 'index'])->name('goods-requests.index');
    Route::get('goods-requests/create', [GoodsRequestController::class, 'create'])->name('goods-requests.create');
    Route::post('goods-requests', [GoodsRequestController::class, 'store'])->name('goods-requests.store');

    Route::post('goods-requests/{goods_request}/submit', [GoodsRequestController::class, 'submit'])->name('goods-requests.submit');
    Route::post('goods-requests/{goods_request}/approve', [GoodsRequestController::class, 'approve'])->name('goods-requests.approve');
    Route::post('goods-requests/{goods_request}/cancel', [GoodsRequestController::class, 'cancel'])->name('goods-requests.cancel');

    Route::get('goods-requests/{goods_request}/pdf', [GoodsRequestController::class, 'pdf'])->name('goods-requests.pdf');

    Route::get('goods-requests/{goods_request}', [GoodsRequestController::class, 'show'])->name('goods-requests.show');
    Route::get('goods-requests/{goods_request}/edit', [GoodsRequestController::class, 'edit'])->name('goods-requests.edit');
    Route::put('goods-requests/{goods_request}', [GoodsRequestController::class, 'update'])->name('goods-requests.update');

    /*
    |--------------------------------------------------------------------------
    | Master Data & Administration (Admin only)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    });

    /*
    |--------------------------------------------------------------------------
    | Profile (Breeze)
    |--------------------------------------------------------------------------
    */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
