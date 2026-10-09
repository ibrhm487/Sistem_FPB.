<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLog)
    {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->string('search')->toString();
                $q->where(fn ($qq) => $qq->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')->toString()))
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('is_active', $request->string('status')->toString() === 'active');
            })
            ->withCount('goodsRequests')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status', 'per_page']),
            'roles' => [
                ['value' => UserRole::ADMIN->value, 'label' => UserRole::ADMIN->label()],
                ['value' => UserRole::SALES->value, 'label' => UserRole::SALES->label()],
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        $this->activityLog->record(
            ActivityLogService::ACTION_CREATE_USER,
            $user,
            "Menambahkan user {$user->name}.",
        );

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->update($data);

        $this->activityLog->record(
            ActivityLogService::ACTION_UPDATE_USER,
            $user,
            "Memperbarui user {$user->name}.",
        );

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function resetPassword(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user->update(['password' => $validated['password']]);

        $this->activityLog->record(
            ActivityLogService::ACTION_UPDATE_USER,
            $user,
            "Reset password user {$user->name}.",
        );

        return back()->with('success', 'Password user berhasil direset.');
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorize('delete', $user);

        $name = $user->name;
        $user->delete();

        $this->activityLog->record(
            ActivityLogService::ACTION_UPDATE_USER,
            null,
            "Menghapus user {$name}.",
        );

        return back()->with('success', 'User berhasil dihapus.');
    }
}
