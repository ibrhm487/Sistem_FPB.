<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_cannot_access_product_master_data(): void
    {
        $sales = User::factory()->sales()->create();

        $this->actingAs($sales)->get(route('products.index'))->assertForbidden();
    }

    public function test_sales_cannot_access_user_management(): void
    {
        $sales = User::factory()->sales()->create();

        $this->actingAs($sales)->get(route('users.index'))->assertForbidden();
    }

    public function test_sales_cannot_access_activity_log(): void
    {
        $sales = User::factory()->sales()->create();

        $this->actingAs($sales)->get(route('activity-logs.index'))->assertForbidden();
    }

    public function test_admin_can_access_master_data(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('products.index'))->assertOk();
        $this->actingAs($admin)->get(route('users.index'))->assertOk();
        $this->actingAs($admin)->get(route('activity-logs.index'))->assertOk();
    }

    public function test_sales_can_access_dashboard_and_create_fpb_page(): void
    {
        $sales = User::factory()->sales()->create();

        $this->actingAs($sales)->get(route('dashboard'))->assertOk();
        $this->actingAs($sales)->get(route('goods-requests.create'))->assertOk();
    }

    public function test_admin_can_create_a_product(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('products.store'), [
            'product_code' => 'PRD-TEST',
            'name' => 'Produk Uji',
            'category' => 'Biskuit & Kue',
            'unit' => 'pcs',
            'price' => 25000,
            'tax_rate' => 11,
            'is_active' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('products', [
            'product_code' => 'PRD-TEST',
            'category' => 'Biskuit & Kue',
        ]);
    }
}
