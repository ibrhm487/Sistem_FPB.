<?php

namespace Tests\Feature;

use App\Models\GoodsRequest;
use App\Models\Product;
use App\Models\User;
use App\Services\GoodsRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GoodsRequestAccessTest extends TestCase
{
    use RefreshDatabase;

    private function makeFpb(User $owner): GoodsRequest
    {
        $product = Product::factory()->create();

        return app(GoodsRequestService::class)->create([
            'request_date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $product->id,
                    'qty_ktn' => 1,
                    'qty_rcg' => 0,
                    'qty_bks' => 0,
                ],
            ],
        ], $owner, false);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('goods-requests.index'))
            ->assertRedirect(route('login'));
    }

    public function test_sales_cannot_view_another_sales_fpb(): void
    {
        $owner = User::factory()->sales()->create();
        $other = User::factory()->sales()->create();
        $request = $this->makeFpb($owner);

        $this->actingAs($other)
            ->get(route('goods-requests.show', $request))
            ->assertForbidden();
    }

    public function test_sales_index_only_lists_their_own_fpb(): void
    {
        $owner = User::factory()->sales()->create();
        $other = User::factory()->sales()->create();

        $this->makeFpb($owner);
        $this->makeFpb($owner);
        $this->makeFpb($other);

        $this->actingAs($owner)
            ->get(route('goods-requests.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('GoodsRequests/Index')
                ->has('requests.data', 2));
    }

    public function test_admin_can_view_any_fpb(): void
    {
        $owner = User::factory()->sales()->create();
        $admin = User::factory()->admin()->create();
        $request = $this->makeFpb($owner);

        $this->actingAs($admin)
            ->get(route('goods-requests.show', $request))
            ->assertOk();
    }

    public function test_sales_cannot_edit_a_fpb_owned_by_another_sales(): void
    {
        $owner = User::factory()->sales()->create();
        $other = User::factory()->sales()->create();
        $request = $this->makeFpb($owner);

        $this->actingAs($other)
            ->get(route('goods-requests.edit', $request))
            ->assertForbidden();
    }

    public function test_sales_cannot_print_another_sales_fpb(): void
    {
        $owner = User::factory()->sales()->create();
        $other = User::factory()->sales()->create();
        $request = $this->makeFpb($owner);

        $this->actingAs($other)
            ->get(route('goods-requests.pdf', $request))
            ->assertForbidden();
    }
}
