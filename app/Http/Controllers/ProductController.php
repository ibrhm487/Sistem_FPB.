<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLog)
    {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::query()
            ->search($request->string('search')->toString())
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')->toString()))
            ->when($request->filled('status'), function ($q) use ($request) {
                $status = $request->string('status')->toString();
                $q->where('is_active', $status === 'active');
            })
            ->withCount('goodsRequestItems')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => Product::query()
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
            'filters' => $request->only(['search', 'category', 'status', 'per_page']),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $data['product_code'] = $data['product_code'] ?? $this->generateCode();

        $product = Product::create($data);

        $this->activityLog->record(
            ActivityLogService::ACTION_CREATE_PRODUCT,
            $product,
            "Menambahkan product {$product->name}.",
        );

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();
        $data['product_code'] = $data['product_code'] ?? $product->product_code;

        $product->update($data);

        $this->activityLog->record(
            ActivityLogService::ACTION_UPDATE_PRODUCT,
            $product,
            "Memperbarui product {$product->name}.",
        );

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $name = $product->name;
        $product->delete();

        $this->activityLog->record(
            ActivityLogService::ACTION_UPDATE_PRODUCT,
            null,
            "Menghapus product {$name}.",
        );

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    private function generateCode(): string
    {
        $next = (int) DB::table('products')->max('id') + 1;

        do {
            $code = 'PRD-' . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
            $next++;
        } while (Product::where('product_code', $code)->exists());

        return $code;
    }
}
