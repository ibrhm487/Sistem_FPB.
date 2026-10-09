<?php

namespace App\Models;

use App\Enums\GoodsRequestStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'fpb_number',
        'user_id',
        'branch',
        'subbranch',
        'salesman_name',
        'request_date',
        'ryn',
        'vehicle_number',
        'status',
        'notes',
        'approved_by_name',
        'approved_at',
        'checked_by_name',
        'checked_at',
        'requested_by_name',
        'requested_at',
        'submitted_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'request_date' => 'date',
            'status' => GoodsRequestStatus::class,
            'approved_at' => 'datetime',
            'checked_at' => 'datetime',
            'requested_at' => 'datetime',
            'submitted_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<GoodsRequestItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(GoodsRequestItem::class)->orderBy('line_number');
    }

    public function isEditable(): bool
    {
        return $this->status->isEditable();
    }

    /**
     * Sum of a given quantity segment across every line.
     */
    public function totalFor(string $segment): float
    {
        $column = 'qty_' . $segment;

        return (float) $this->items->sum($column);
    }

    /**
     * @return array{ktn: float, rcg: float, bks: float, grand: float}
     */
    public function totals(): array
    {
        $ktn = $this->totalFor('ktn');
        $rcg = $this->totalFor('rcg');
        $bks = $this->totalFor('bks');

        return [
            'ktn' => $ktn,
            'rcg' => $rcg,
            'bks' => $bks,
            'grand' => $ktn + $rcg + $bks,
        ];
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status) ? $query->where('status', $status) : $query;
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('fpb_number', 'like', "%{$term}%")
                ->orWhere('salesman_name', 'like', "%{$term}%")
                ->orWhere('branch', 'like', "%{$term}%")
                ->orWhere('ryn', 'like', "%{$term}%")
                ->orWhereHas('user', fn (Builder $u) => $u->where('name', 'like', "%{$term}%"));
        });
    }
}
