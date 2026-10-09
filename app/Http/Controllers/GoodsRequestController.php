<?php

namespace App\Http\Controllers;

use App\Enums\GoodsRequestStatus;
use App\Http\Requests\ApproveGoodsRequestRequest;
use App\Http\Requests\StoreGoodsRequestRequest;
use App\Http\Requests\UpdateGoodsRequestRequest;
use App\Models\GoodsRequest;
use App\Models\Product;
use App\Services\ActivityLogService;
use App\Services\GoodsRequestService;
use App\Services\TerbilangService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoodsRequestController extends Controller
{
    public function __construct(
        private readonly GoodsRequestService $service,
        private readonly ActivityLogService $activityLog,
        private readonly TerbilangService $terbilang,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $sort = in_array($request->string('sort')->toString(), ['fpb_number', 'request_date', 'status', 'created_at'], true)
            ? $request->string('sort')->toString()
            : 'created_at';
        $direction = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';

        $requests = GoodsRequest::query()
            ->visibleTo($user)
            ->with(['user:id,name'])
            ->withCount('items')
            ->search($request->string('search')->toString())
            ->status($request->string('status')->toString())
            ->when($user->isAdmin() && $request->filled('user_id'), fn ($q) => $q->where('user_id', $request->integer('user_id')))
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('request_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('request_date', '<=', $request->date('date_to')))
            ->orderBy($sort, $direction)
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('GoodsRequests/Index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'status', 'user_id', 'date_from', 'date_to', 'sort', 'direction', 'per_page']),
            'statuses' => $this->statusOptions(),
            'sales' => $user->isAdmin()
                ? \App\Models\User::query()->where('role', 'sales')->select('id', 'name')->orderBy('name')->get()
                : [],
        ]);
    }

    public function create(): Response
    {
        $user = request()->user();

        return Inertia::render('GoodsRequests/Create', [
            'products' => $this->productOptions(),
            'defaults' => [
                'branch' => $user->branch,
                'subbranch' => $user->subbranch,
                'salesman_name' => $user->name,
                'request_date' => now()->toDateString(),
            ],
        ]);
    }

    public function store(StoreGoodsRequestRequest $request)
    {
        $goodsRequest = $this->service->create(
            $request->validated(),
            $request->user(),
            $request->input('action') === 'submit',
        );

        $message = $goodsRequest->status === GoodsRequestStatus::SUBMITTED
            ? 'Form Permintaan Barang berhasil diajukan.'
            : 'Form Permintaan Barang berhasil disimpan.';

        return redirect()
            ->route('goods-requests.show', $goodsRequest)
            ->with('success', $message);
    }

    public function show(Request $request, GoodsRequest $goodsRequest): Response
    {
        $this->authorize('view', $goodsRequest);

        $goodsRequest->load(['user:id,name,email', 'items']);

        return Inertia::render('GoodsRequests/Show', [
            'goodsRequest' => $goodsRequest,
            'totals' => $goodsRequest->totals(),
            'can' => [
                'update' => $request->user()->can('update', $goodsRequest),
                'submit' => $request->user()->can('submit', $goodsRequest),
                'approve' => $request->user()->can('approve', $goodsRequest),
                'cancel' => $request->user()->can('cancel', $goodsRequest),
            ],
        ]);
    }

    public function edit(Request $request, GoodsRequest $goodsRequest): Response
    {
        $this->authorize('update', $goodsRequest);

        $goodsRequest->load('items');

        return Inertia::render('GoodsRequests/Edit', [
            'goodsRequest' => $goodsRequest,
            'products' => $this->productOptions(),
        ]);
    }

    public function update(UpdateGoodsRequestRequest $request, GoodsRequest $goodsRequest)
    {
        $goodsRequest = $this->service->update($goodsRequest, $request->validated(), $request->user());

        if ($request->input('action') === 'submit') {
            $this->service->submit($goodsRequest, $request->user());

            return redirect()
                ->route('goods-requests.show', $goodsRequest)
                ->with('success', 'Form Permintaan Barang berhasil diajukan.');
        }

        return redirect()
            ->route('goods-requests.show', $goodsRequest)
            ->with('success', 'Form Permintaan Barang berhasil disimpan.');
    }

    public function submit(Request $request, GoodsRequest $goodsRequest)
    {
        $this->authorize('submit', $goodsRequest);

        $this->service->submit($goodsRequest, $request->user());

        return back()->with('success', 'Form Permintaan Barang berhasil diajukan.');
    }

    public function approve(ApproveGoodsRequestRequest $request, GoodsRequest $goodsRequest)
    {
        $this->service->approve($goodsRequest, $request->user(), $request->validated());

        return back()->with('success', 'Form Permintaan Barang berhasil disetujui.');
    }

    public function cancel(Request $request, GoodsRequest $goodsRequest)
    {
        $this->authorize('cancel', $goodsRequest);

        $this->service->cancel($goodsRequest, $request->user());

        return back()->with('success', 'Form Permintaan Barang berhasil dibatalkan.');
    }

    public function pdf(Request $request, GoodsRequest $goodsRequest)
    {
        $this->authorize('print', $goodsRequest);

        $goodsRequest->load(['user:id,name', 'items']);

        $this->activityLog->record(
            ActivityLogService::ACTION_PRINT_FPB,
            $goodsRequest,
            "Mencetak FPB {$goodsRequest->fpb_number}.",
            $request->user()->id,
        );

        $totals = $goodsRequest->totals();

        $pdf = Pdf::loadView('pdf.goods-request', [
            'goodsRequest' => $goodsRequest,
            'totals' => $totals,
            'terbilang' => $this->terbilang->terbilang($totals['grand']),
            'company' => [
                'name' => config('company.name'),
                'address' => config('company.address'),
                'phone' => config('company.phone'),
                'email' => config('company.email'),
            ],
        ])->setPaper('a4', 'portrait');

        return $pdf->download("{$goodsRequest->fpb_number}.pdf");
    }

    /**
     * @return \Illuminate\Support\Collection<int, Product>
     */
    private function productOptions()
    {
        return Product::query()
            ->active()
            ->select('id', 'product_code', 'name', 'unit')
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return array_map(
            fn (GoodsRequestStatus $status) => ['value' => $status->value, 'label' => $status->label()],
            GoodsRequestStatus::cases(),
        );
    }
}
