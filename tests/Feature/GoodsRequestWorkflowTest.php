<?php

namespace Tests\Feature;

use App\Enums\GoodsRequestStatus;
use App\Models\GoodsRequest;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoodsRequestWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $sales;

    private User $admin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sales = User::factory()->sales()->create([
            'name' => 'Andi Sales',
            'branch' => 'KTN',
            'subbranch' => 'Ketapang',
        ]);
        $this->admin = User::factory()->admin()->create();
        $this->product = Product::factory()->create(['name' => 'Produk Uji']);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'request_date' => now()->toDateString(),
            'action' => 'save_draft',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'qty_ktn' => 2,
                    'qty_rcg' => 1,
                    'qty_bks' => 0,
                ],
            ],
        ], $overrides);
    }

    public function test_sales_can_create_a_draft_fpb_with_header_snapshot(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload())
            ->assertRedirect();

        $request = GoodsRequest::firstOrFail();

        $this->assertSame(GoodsRequestStatus::DRAFT, $request->status);
        $this->assertSame($this->sales->id, $request->user_id);
        $this->assertSame('KTN', $request->branch);
        $this->assertSame('Ketapang', $request->subbranch);
        $this->assertSame('Andi Sales', $request->salesman_name);
        $this->assertMatchesRegularExpression('/^FPB-\d{6}-\d{4}$/', $request->fpb_number);
        $this->assertCount(1, $request->items);
        $this->assertSame('Produk Uji', $request->items->first()->product_name);
    }

    public function test_sales_can_create_and_submit_in_one_step(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload(['action' => 'submit']));

        $request = GoodsRequest::firstOrFail();

        $this->assertSame(GoodsRequestStatus::SUBMITTED, $request->status);
        $this->assertNotNull($request->submitted_at);
        $this->assertSame('Andi Sales', $request->requested_by_name);
        $this->assertNotNull($request->requested_at);
    }

    public function test_sales_can_submit_a_draft_fpb(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload());

        $request = GoodsRequest::firstOrFail();

        $this->actingAs($this->sales)
            ->post(route('goods-requests.submit', $request))
            ->assertRedirect();

        $this->assertSame(GoodsRequestStatus::SUBMITTED, $request->refresh()->status);
    }

    public function test_admin_can_approve_a_submitted_fpb(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload(['action' => 'submit']));

        $request = GoodsRequest::firstOrFail();

        $this->actingAs($this->admin)
            ->post(route('goods-requests.approve', $request), [
                'approved_by_name' => 'BSM KTN',
                'checked_by_name' => 'SK KTN',
            ])
            ->assertRedirect();

        $request->refresh();
        $this->assertSame(GoodsRequestStatus::APPROVED, $request->status);
        $this->assertSame('BSM KTN', $request->approved_by_name);
        $this->assertSame('SK KTN', $request->checked_by_name);
        $this->assertNotNull($request->approved_at);
    }

    public function test_sales_cannot_approve_an_fpb(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload(['action' => 'submit']));

        $request = GoodsRequest::firstOrFail();

        $this->actingAs($this->sales)
            ->post(route('goods-requests.approve', $request))
            ->assertForbidden();

        $this->assertSame(GoodsRequestStatus::SUBMITTED, $request->refresh()->status);
    }

    public function test_fpb_requires_at_least_one_product(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload([
                'items' => [
                    ['product_id' => null, 'qty_ktn' => 0, 'qty_rcg' => 0, 'qty_bks' => 0],
                ],
            ]))
            ->assertSessionHasErrors('items');

        $this->assertDatabaseCount('goods_requests', 0);
    }

    public function test_sales_can_update_a_draft_fpb(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload());

        $request = GoodsRequest::firstOrFail();

        $this->actingAs($this->sales)
            ->put(route('goods-requests.update', $request), $this->payload([
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty_ktn' => 9,
                        'qty_rcg' => 3,
                        'qty_bks' => 1,
                    ],
                ],
            ]))
            ->assertRedirect();

        $item = $request->refresh()->items()->firstOrFail();
        $this->assertSame(9.0, (float) $item->qty_ktn);
        $this->assertSame(1.0, (float) $item->qty_bks);
    }

    public function test_totals_are_summed_per_segment_without_merging(): void
    {
        $this->actingAs($this->sales)->post(route('goods-requests.store'), $this->payload([
            'items' => [
                ['product_id' => $this->product->id, 'qty_ktn' => 2, 'qty_rcg' => 1, 'qty_bks' => 0],
                ['product_id' => $this->product->id, 'qty_ktn' => 3, 'qty_rcg' => 4, 'qty_bks' => 5],
            ],
        ]));

        $request = GoodsRequest::firstOrFail()->load('items');
        $totals = $request->totals();

        $this->assertSame(5.0, $totals['ktn']);
        $this->assertSame(5.0, $totals['rcg']);
        $this->assertSame(5.0, $totals['bks']);
        $this->assertSame(15.0, $totals['grand']);
    }

    public function test_sales_can_cancel_a_submitted_fpb(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload(['action' => 'submit']));

        $request = GoodsRequest::firstOrFail();

        $this->actingAs($this->sales)
            ->post(route('goods-requests.cancel', $request))
            ->assertRedirect();

        $this->assertSame(GoodsRequestStatus::CANCELLED, $request->refresh()->status);
    }

    public function test_admin_can_download_fpb_pdf(): void
    {
        $this->actingAs($this->sales)
            ->post(route('goods-requests.store'), $this->payload(['action' => 'submit']));

        $request = GoodsRequest::firstOrFail();

        $response = $this->actingAs($this->admin)
            ->get(route('goods-requests.pdf', $request));

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('content-type'));
    }
}
