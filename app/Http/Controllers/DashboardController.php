<?php

namespace App\Http\Controllers;

use App\Enums\GoodsRequestStatus;
use App\Models\GoodsRequest;
use App\Models\GoodsRequestItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return $user->isAdmin()
            ? $this->adminDashboard($request)
            : $this->salesDashboard($request);
    }

    private function adminDashboard(Request $request): Response
    {
        $statusCounts = GoodsRequest::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $stats = [
            'total_fpb' => GoodsRequest::count(),
            'draft' => (int) ($statusCounts[GoodsRequestStatus::DRAFT->value] ?? 0),
            'waiting_review' => (int) ($statusCounts[GoodsRequestStatus::SUBMITTED->value] ?? 0),
            'approved' => (int) ($statusCounts[GoodsRequestStatus::APPROVED->value] ?? 0),
            'cancelled' => (int) ($statusCounts[GoodsRequestStatus::CANCELLED->value] ?? 0),
        ];

        $monthly = GoodsRequest::query()
            ->selectRaw($this->monthExpression().' as month')
            ->selectRaw('COUNT(*) as count')
            ->where('request_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $bySales = GoodsRequest::query()
            ->select('users.name', DB::raw('COUNT(goods_requests.id) as count'))
            ->join('users', 'users.id', '=', 'goods_requests.user_id')
            ->groupBy('users.name')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $topProducts = GoodsRequestItem::query()
            ->select(
                'product_name as name',
                DB::raw('COALESCE(SUM(qty_ktn + qty_rcg + qty_bks), 0) as qty'),
            )
            ->groupBy('product_name')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'role' => 'admin',
            'stats' => $stats,
            'statusDistribution' => $statusCounts,
            'monthly' => $monthly,
            'bySales' => $bySales,
            'topProducts' => $topProducts,
            'recentRequests' => $this->recentRequests(),
            'masterCounts' => [
                'products' => Product::count(),
            ],
        ]);
    }

    private function salesDashboard(Request $request): Response
    {
        $userId = $request->user()->id;

        $statusCounts = GoodsRequest::query()
            ->where('user_id', $userId)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $stats = [
            'total_fpb' => GoodsRequest::where('user_id', $userId)->count(),
            'draft' => (int) ($statusCounts[GoodsRequestStatus::DRAFT->value] ?? 0),
            'submitted' => (int) ($statusCounts[GoodsRequestStatus::SUBMITTED->value] ?? 0),
            'approved' => (int) ($statusCounts[GoodsRequestStatus::APPROVED->value] ?? 0),
            'cancelled' => (int) ($statusCounts[GoodsRequestStatus::CANCELLED->value] ?? 0),
        ];

        $monthly = GoodsRequest::query()
            ->where('user_id', $userId)
            ->selectRaw($this->monthExpression().' as month')
            ->selectRaw('COUNT(*) as count')
            ->where('request_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Dashboard', [
            'role' => 'sales',
            'stats' => $stats,
            'statusDistribution' => $statusCounts,
            'monthly' => $monthly,
            'recentRequests' => $this->recentRequests($userId),
        ]);
    }

    private function monthExpression(): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? "TO_CHAR(request_date, 'YYYY-MM')"
            : (DB::connection()->getDriverName() === 'sqlite'
                ? "strftime('%Y-%m', request_date)"
                : "DATE_FORMAT(request_date, '%Y-%m')");
    }

    /**
     * @return \Illuminate\Support\Collection<int, GoodsRequest>
     */
    private function recentRequests(?int $userId = null)
    {
        return GoodsRequest::query()
            ->with(['user:id,name'])
            ->withCount('items')
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->latest('created_at')
            ->limit(8)
            ->get();
    }
}
