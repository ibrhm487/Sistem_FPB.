<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActiveUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_users_cannot_authenticate(): void
    {
        $user = User::factory()->inactive()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_active_users_can_authenticate_and_last_login_is_recorded(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertNotNull($user->refresh()->last_login_at);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => ActivityLogService::ACTION_LOGIN,
        ]);
    }

    public function test_logout_is_recorded_in_activity_log(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => ActivityLogService::ACTION_LOGOUT,
        ]);
    }

    public function test_activity_log_records_entity_context(): void
    {
        $user = User::factory()->create();

        $log = app(ActivityLogService::class)->record('TEST_ACTION', $user, 'Pesan uji.', $user->id);

        $this->assertInstanceOf(ActivityLog::class, $log);
        $this->assertSame(User::class, $log->entity_type);
        $this->assertSame($user->id, $log->entity_id);
    }
}
