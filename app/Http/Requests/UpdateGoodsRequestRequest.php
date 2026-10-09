<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGoodsRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('goods_request'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'request_date' => ['required', 'date'],
            'branch' => ['nullable', 'string', 'max:100'],
            'subbranch' => ['nullable', 'string', 'max:100'],
            'salesman_name' => ['nullable', 'string', 'max:150'],
            'ryn' => ['nullable', 'string', 'max:100'],
            'vehicle_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'action' => ['nullable', 'in:save_draft,submit'],
            'items' => ['required', 'array'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.qty_ktn' => ['nullable', 'numeric', 'min:0'],
            'items.*.qty_rcg' => ['nullable', 'numeric', 'min:0'],
            'items.*.qty_bks' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $items = collect($this->input('items', []))
                ->filter(fn ($item) => filled($item['product_id'] ?? null));

            if ($items->isEmpty()) {
                $validator->errors()->add('items', 'Form Permintaan Barang harus memiliki minimal 1 barang.');
            }

            $hasQuantity = $items->contains(fn ($item) => (float) ($item['qty_ktn'] ?? 0) > 0
                || (float) ($item['qty_rcg'] ?? 0) > 0
                || (float) ($item['qty_bks'] ?? 0) > 0);

            if ($items->isNotEmpty() && ! $hasQuantity) {
                $validator->errors()->add('items', 'Setiap barang harus memiliki minimal satu jumlah (KTN/RCG/BKS).');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Form Permintaan Barang harus memiliki minimal 1 barang.',
            'items.*.product_id.exists' => 'Barang yang dipilih tidak valid.',
            'items.*.qty_ktn.min' => 'Jumlah KTN tidak boleh negatif.',
            'items.*.qty_rcg.min' => 'Jumlah RCG tidak boleh negatif.',
            'items.*.qty_bks.min' => 'Jumlah BKS tidak boleh negatif.',
        ];
    }
}
