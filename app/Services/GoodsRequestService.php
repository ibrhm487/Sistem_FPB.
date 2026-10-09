<?php

namespace App\Services;

use App\Enums\GoodsRequestStatus;
use App\Models\GoodsRequest;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GoodsRequestService
{
    public function __construct(
        private readonly GoodsRequestNumberService $numberService,
        private readonly ActivityLogService $activityLog,
    ) {
    }

    /**
     * Create a Form Permintaan Barang. Optionally submit it immediately.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $user, bool $submit = false): GoodsRequest
    {
        return DB::transaction(function () use ($data, $user, $submit) {
            $items = $this->prepareItems($data['items']);

            $goodsRequest = new GoodsRequest([
                'fpb_number' => $this->numberService->generateUnique(),
                'user_id' => $user->id,
                'branch' => $data['branch'] ?? $user->branch,
                'subbranch' => $data['subbranch'] ?? $user->subbranch,
                'salesman_name' => $data['salesman_name'] ?? $user->name,
                'request_date' => $data['request_date'],
                'ryn' => $data['ryn'] ?? null,
                'vehicle_number' => $data['vehicle_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => GoodsRequestStatus::DRAFT,
            ]);

            $goodsRequest->save();
            $goodsRequest->items()->createMany($items);

            $this->activityLog->record(
                ActivityLogService::ACTION_CREATE_FPB,
                $goodsRequest,
                "Membuat FPB {$goodsRequest->fpb_number}.",
                $user->id,
            );

            if ($submit) {
                $this->submit($goodsRequest, $user);
            }

            return $goodsRequest->refresh();
        });
    }

    /**
     * Update an editable Form Permintaan Barang (DRAFT only).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(GoodsRequest $goodsRequest, array $data, User $user): GoodsRequest
    {
        if (! $goodsRequest->status->isEditable()) {
            throw ValidationException::withMessages([
                'status' => 'Form Permintaan Barang ini tidak dapat diubah pada status saat ini.',
            ]);
        }

        return DB::transaction(function () use ($goodsRequest, $data, $user) {
            $items = $this->prepareItems($data['items']);

            $goodsRequest->fill([
                'branch' => $data['branch'] ?? $goodsRequest->branch,
                'subbranch' => $data['subbranch'] ?? $goodsRequest->subbranch,
                'salesman_name' => $data['salesman_name'] ?? $goodsRequest->salesman_name,
                'request_date' => $data['request_date'],
                'ryn' => $data['ryn'] ?? null,
                'vehicle_number' => $data['vehicle_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $goodsRequest->save();

            $goodsRequest->items()->delete();
            $goodsRequest->items()->createMany($items);

            $this->activityLog->record(
                ActivityLogService::ACTION_UPDATE_FPB,
                $goodsRequest,
                "Memperbarui FPB {$goodsRequest->fpb_number}.",
                $user->id,
            );

            return $goodsRequest->refresh();
        });
    }

    public function submit(GoodsRequest $goodsRequest, User $user): GoodsRequest
    {
        return DB::transaction(function () use ($goodsRequest, $user) {
            if ($goodsRequest->items()->count() === 0) {
                throw ValidationException::withMessages([
                    'items' => 'Form Permintaan Barang harus memiliki minimal 1 barang.',
                ]);
            }

            if (! $goodsRequest->status->canTransitionTo(GoodsRequestStatus::SUBMITTED)) {
                throw ValidationException::withMessages([
                    'status' => 'FPB ini tidak dapat diajukan pada status saat ini.',
                ]);
            }

            $goodsRequest->update([
                'status' => GoodsRequestStatus::SUBMITTED,
                'submitted_at' => now(),
                'requested_by_name' => $user->name,
                'requested_at' => now(),
            ]);

            $this->activityLog->record(
                ActivityLogService::ACTION_SUBMIT_FPB,
                $goodsRequest,
                "Mengajukan FPB {$goodsRequest->fpb_number}.",
                $user->id,
            );

            return $goodsRequest->refresh();
        });
    }

    /**
     * Approve a submitted FPB and fill the approval signature blocks.
     */
    public function approve(GoodsRequest $goodsRequest, User $user, array $data = []): GoodsRequest
    {
        return DB::transaction(function () use ($goodsRequest, $user, $data) {
            if (! $goodsRequest->status->canTransitionTo(GoodsRequestStatus::APPROVED)) {
                throw ValidationException::withMessages([
                    'status' => 'FPB ini tidak dapat disetujui pada status saat ini.',
                ]);
            }

            $goodsRequest->update([
                'status' => GoodsRequestStatus::APPROVED,
                'approved_by_name' => $data['approved_by_name'] ?? $goodsRequest->approved_by_name ?? $user->name,
                'approved_at' => now(),
                'checked_by_name' => $data['checked_by_name'] ?? $goodsRequest->checked_by_name,
                'checked_at' => now(),
            ]);

            $this->activityLog->record(
                ActivityLogService::ACTION_APPROVE_FPB,
                $goodsRequest,
                "Menyetujui FPB {$goodsRequest->fpb_number}.",
                $user->id,
            );

            return $goodsRequest->refresh();
        });
    }

    public function cancel(GoodsRequest $goodsRequest, User $user): GoodsRequest
    {
        return DB::transaction(function () use ($goodsRequest, $user) {
            if (! $goodsRequest->status->canTransitionTo(GoodsRequestStatus::CANCELLED)) {
                throw ValidationException::withMessages([
                    'status' => 'FPB ini tidak dapat dibatalkan pada status saat ini.',
                ]);
            }

            $goodsRequest->update([
                'status' => GoodsRequestStatus::CANCELLED,
                'cancelled_at' => now(),
            ]);

            $this->activityLog->record(
                ActivityLogService::ACTION_CANCEL_FPB,
                $goodsRequest,
                "Membatalkan FPB {$goodsRequest->fpb_number}.",
                $user->id,
            );

            return $goodsRequest->refresh();
        });
    }

    /**
     * Resolve product snapshots and build line rows on the backend.
     *
     * Rows without a product are dropped (the form renders 15 blank lines).
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    private function prepareItems(array $items): array
    {
        $rows = collect($items)
            ->filter(fn ($item) => filled($item['product_id'] ?? null))
            ->values();

        if ($rows->isEmpty()) {
            throw ValidationException::withMessages([
                'items' => 'Form Permintaan Barang harus memiliki minimal 1 barang.',
            ]);
        }

        $productIds = $rows->pluck('product_id')->unique()->all();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $prepared = [];

        foreach ($rows as $index => $item) {
            $product = $products->get($item['product_id'] ?? null);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => 'Barang yang dipilih tidak ditemukan.',
                ]);
            }

            if (! $product->is_active) {
                throw ValidationException::withMessages([
                    'items' => "Barang {$product->name} tidak aktif dan tidak dapat diminta.",
                ]);
            }

            $prepared[] = [
                'product_id' => $product->id,
                'line_number' => $index + 1,
                'product_code' => $product->product_code,
                'product_name' => $product->name,
                'unit' => $product->unit,
                'qty_ktn' => (float) ($item['qty_ktn'] ?? 0),
                'qty_rcg' => (float) ($item['qty_rcg'] ?? 0),
                'qty_bks' => (float) ($item['qty_bks'] ?? 0),
            ];
        }

        return $prepared;
    }
}
