<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'goods_request_id',
        'product_id',
        'line_number',
        'product_code',
        'product_name',
        'unit',
        'qty_ktn',
        'qty_rcg',
        'qty_bks',
    ];

    protected function casts(): array
    {
        return [
            'line_number' => 'integer',
            'qty_ktn' => 'decimal:2',
            'qty_rcg' => 'decimal:2',
            'qty_bks' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<GoodsRequest, self>
     */
    public function goodsRequest(): BelongsTo
    {
        return $this->belongsTo(GoodsRequest::class);
    }

    /**
     * @return BelongsTo<Product, self>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
