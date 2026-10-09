<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public const ACTION_LOGIN = 'LOGIN';
    public const ACTION_LOGOUT = 'LOGOUT';
    public const ACTION_CREATE_PRODUCT = 'CREATE_PRODUCT';
    public const ACTION_UPDATE_PRODUCT = 'UPDATE_PRODUCT';
    public const ACTION_CREATE_USER = 'CREATE_USER';
    public const ACTION_UPDATE_USER = 'UPDATE_USER';
    public const ACTION_CREATE_FPB = 'CREATE_FPB';
    public const ACTION_UPDATE_FPB = 'UPDATE_FPB';
    public const ACTION_SUBMIT_FPB = 'SUBMIT_FPB';
    public const ACTION_APPROVE_FPB = 'APPROVE_FPB';
    public const ACTION_CANCEL_FPB = 'CANCEL_FPB';
    public const ACTION_PRINT_FPB = 'PRINT_FPB';

    public function record(
        string $action,
        ?Model $entity = null,
        ?string $description = null,
        ?int $userId = null,
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'entity_type' => $entity ? $entity::class : null,
            'entity_id' => $entity?->getKey(),
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);
    }
}
