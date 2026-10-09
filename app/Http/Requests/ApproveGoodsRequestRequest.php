<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveGoodsRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('approve', $this->route('goods_request'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'approved_by_name' => ['nullable', 'string', 'max:150'],
            'checked_by_name' => ['nullable', 'string', 'max:150'],
        ];
    }
}
