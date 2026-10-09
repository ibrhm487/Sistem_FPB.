<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \App\Models\User::class);

        $logs = ActivityLog::query()
            ->with('user:id,name,email')
            ->search($request->string('search')->toString())
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')->toString()))
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('created_at', '<=', $request->date('date_to')))
            ->latest('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action', 'date_from', 'date_to', 'per_page']),
            'actions' => ActivityLog::query()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
