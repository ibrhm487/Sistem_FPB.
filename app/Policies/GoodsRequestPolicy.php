<?php

namespace App\Policies;

use App\Enums\GoodsRequestStatus;
use App\Models\GoodsRequest;
use App\Models\User;

class GoodsRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GoodsRequest $goodsRequest): bool
    {
        return $user->isAdmin() || $goodsRequest->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, GoodsRequest $goodsRequest): bool
    {
        if (! $goodsRequest->status->isEditable()) {
            return false;
        }

        return $user->isAdmin() || $goodsRequest->user_id === $user->id;
    }

    public function delete(User $user, GoodsRequest $goodsRequest): bool
    {
        return $goodsRequest->status === GoodsRequestStatus::DRAFT
            && ($user->isAdmin() || $goodsRequest->user_id === $user->id);
    }

    public function submit(User $user, GoodsRequest $goodsRequest): bool
    {
        return $goodsRequest->status === GoodsRequestStatus::DRAFT
            && ($user->isAdmin() || $goodsRequest->user_id === $user->id);
    }

    public function approve(User $user, GoodsRequest $goodsRequest): bool
    {
        return $user->isAdmin() && $goodsRequest->status === GoodsRequestStatus::SUBMITTED;
    }

    public function cancel(User $user, GoodsRequest $goodsRequest): bool
    {
        return in_array($goodsRequest->status, [GoodsRequestStatus::DRAFT, GoodsRequestStatus::SUBMITTED], true)
            && ($user->isAdmin() || $goodsRequest->user_id === $user->id);
    }

    public function print(User $user, GoodsRequest $goodsRequest): bool
    {
        return $this->view($user, $goodsRequest);
    }
}
