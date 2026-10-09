<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GoodsRequestNumberService
{
    /**
     * Generate the next FPB number in the format FPB-YYYYMM-XXXX.
     *
     * Must be called inside a database transaction for concurrency safety.
     */
    public function generate(?Carbon $date = null): string
    {
        $date = $date ?? now();
        $prefix = 'FPB-' . $date->format('Ym') . '-';

        $lastNumber = DB::table('goods_requests')
            ->where('fpb_number', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('fpb_number')
            ->value('fpb_number');

        $sequence = 1;

        if ($lastNumber) {
            $sequence = (int) substr($lastNumber, strlen($prefix)) + 1;
        }

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    public function generateUnique(?Carbon $date = null, int $maxAttempts = 5): string
    {
        $attempt = 0;

        do {
            $number = $this->generate($date);
            $exists = DB::table('goods_requests')->where('fpb_number', $number)->exists();
            $attempt++;
        } while ($exists && $attempt < $maxAttempts);

        return $number;
    }
}
