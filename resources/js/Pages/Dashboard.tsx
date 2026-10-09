import { BarChart, DonutChart, RankList } from '@/Components/Charts';
import EmptyState from '@/Components/EmptyState';
import FpbStatusBadge from '@/Components/FpbStatusBadge';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import Button from '@/Components/UI/Button';
import { Card, CardBody, CardHeader } from '@/Components/UI/Card';
import { TBody, TD, TH, THead, TR, TableWrap } from '@/Components/UI/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { GoodsRequest, GoodsRequestStatusValue } from '@/types';
import { formatDate, formatMonth } from '@/Utils/format';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    FileText,
    Package,
    PlusCircle,
    RefreshCw,
    Send,
    XCircle,
} from 'lucide-react';

interface MonthlyPoint {
    month: string;
    count: number;
}

interface DashboardProps {
    role: 'admin' | 'sales';
    stats: Record<string, number>;
    statusDistribution: Record<string, number>;
    monthly: MonthlyPoint[];
    recentRequests: GoodsRequest[];
    bySales?: { name: string; count: number }[];
    topProducts?: { name: string; qty: number }[];
    masterCounts?: { products: number };
}

const statusMeta: Record<
    GoodsRequestStatusValue,
    { label: string; color: string }
> = {
    DRAFT: { label: 'Draft', color: '#6b7280' },
    SUBMITTED: { label: 'Diajukan', color: '#2563eb' },
    APPROVED: { label: 'Disetujui', color: '#10b981' },
    CANCELLED: { label: 'Dibatalkan', color: '#94a3b8' },
};

export default function Dashboard({
    role,
    stats,
    statusDistribution,
    monthly,
    recentRequests,
    bySales = [],
    topProducts = [],
    masterCounts,
}: DashboardProps) {
    const isAdmin = role === 'admin';

    const donutData = (Object.keys(statusMeta) as GoodsRequestStatusValue[])
        .map((status) => ({
            label: statusMeta[status].label,
            value: Number(statusDistribution[status] ?? 0),
            color: statusMeta[status].color,
        }))
        .filter((item) => item.value > 0);

    const monthlyData = monthly.map((point) => ({
        label: formatMonth(point.month),
        value: Number(point.count),
    }));

    const cards = isAdmin
        ? [
              {
                  label: 'Total FPB',
                  value: stats.total_fpb,
                  icon: <ClipboardList className="h-5 w-5" />,
                  tone: 'blue' as const,
              },
              {
                  label: 'Draft',
                  value: stats.draft,
                  icon: <FileText className="h-5 w-5" />,
                  tone: 'gray' as const,
              },
              {
                  label: 'Menunggu Review',
                  value: stats.waiting_review,
                  icon: <Send className="h-5 w-5" />,
                  tone: 'amber' as const,
              },
              {
                  label: 'Disetujui',
                  value: stats.approved,
                  icon: <CheckCircle2 className="h-5 w-5" />,
                  tone: 'green' as const,
              },
              {
                  label: 'Dibatalkan',
                  value: stats.cancelled,
                  icon: <XCircle className="h-5 w-5" />,
                  tone: 'red' as const,
              },
              {
                  label: 'Total Produk',
                  value: masterCounts?.products ?? 0,
                  icon: <Package className="h-5 w-5" />,
                  tone: 'indigo' as const,
              },
          ]
        : [
              {
                  label: 'Total FPB Saya',
                  value: stats.total_fpb,
                  icon: <ClipboardList className="h-5 w-5" />,
                  tone: 'blue' as const,
              },
              {
                  label: 'Draft',
                  value: stats.draft,
                  icon: <FileText className="h-5 w-5" />,
                  tone: 'gray' as const,
              },
              {
                  label: 'Diajukan',
                  value: stats.submitted,
                  icon: <Send className="h-5 w-5" />,
                  tone: 'amber' as const,
              },
              {
                  label: 'Disetujui',
                  value: stats.approved,
                  icon: <CheckCircle2 className="h-5 w-5" />,
                  tone: 'green' as const,
              },
              {
                  label: 'Dibatalkan',
                  value: stats.cancelled,
                  icon: <XCircle className="h-5 w-5" />,
                  tone: 'red' as const,
              },
          ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <PageHeader
                title={isAdmin ? 'Dashboard Admin' : 'Dashboard Sales'}
                subtitle={
                    isAdmin
                        ? 'Ringkasan seluruh Form Permintaan Barang di sistem.'
                        : 'Ringkasan Form Permintaan Barang milik Anda.'
                }
                actions={
                    <>
                        <Link href={route('goods-requests.create')}>
                            <Button>
                                <PlusCircle className="h-4 w-4" />
                                Buat FPB
                            </Button>
                        </Link>
                        {isAdmin && (
                            <Link
                                href={route('goods-requests.index', {
                                    status: 'SUBMITTED',
                                })}
                            >
                                <Button variant="outline">
                                    <RefreshCw className="h-4 w-4" />
                                    FPB Menunggu Review
                                </Button>
                            </Link>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader
                        title="FPB per Bulan"
                        description="Jumlah FPB 12 bulan terakhir"
                    />
                    <CardBody>
                        <BarChart data={monthlyData} />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader
                        title="Status FPB"
                        description="Distribusi berdasarkan status"
                    />
                    <CardBody>
                        {donutData.length > 0 ? (
                            <DonutChart data={donutData} />
                        ) : (
                            <EmptyState title="Belum ada data status" />
                        )}
                    </CardBody>
                </Card>
            </div>

            {isAdmin && (
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader title="FPB berdasarkan Sales" />
                        <CardBody>
                            <RankList
                                data={bySales.map((item) => ({
                                    label: item.name,
                                    value: Number(item.count),
                                    hint: `${item.count} FPB`,
                                }))}
                            />
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader title="Produk Terbanyak Diminta" />
                        <CardBody>
                            <RankList
                                data={topProducts.map((item) => ({
                                    label: item.name,
                                    value: Number(item.qty),
                                    hint: `${item.qty} unit`,
                                }))}
                            />
                        </CardBody>
                    </Card>
                </div>
            )}

            <Card className="mt-6">
                <CardHeader
                    title="Form Permintaan Barang Terbaru"
                    action={
                        <Link href={route('goods-requests.index')}>
                            <Button variant="outline" size="sm">
                                Lihat Semua
                            </Button>
                        </Link>
                    }
                />
                {recentRequests.length > 0 ? (
                    <TableWrap>
                        <THead>
                            <TR>
                                <TH>No. FPB</TH>
                                <TH>Tanggal</TH>
                                {isAdmin && <TH>Sales</TH>}
                                <TH>Cabang</TH>
                                <TH className="text-center">Item</TH>
                                <TH>Status</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {recentRequests.map((request) => (
                                <TR key={request.id}>
                                    <TD>
                                        <Link
                                            href={route(
                                                'goods-requests.show',
                                                request.id,
                                            )}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {request.fpb_number}
                                        </Link>
                                    </TD>
                                    <TD>{formatDate(request.request_date)}</TD>
                                    {isAdmin && <TD>{request.user?.name}</TD>}
                                    <TD>
                                        {request.branch
                                            ? `${request.branch}${request.subbranch ? ` / ${request.subbranch}` : ''}`
                                            : '-'}
                                    </TD>
                                    <TD className="text-center">
                                        {request.items_count ?? 0}
                                    </TD>
                                    <TD>
                                        <FpbStatusBadge
                                            status={request.status}
                                        />
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </TableWrap>
                ) : (
                    <EmptyState
                        title="Belum ada Form Permintaan Barang"
                        description="Mulai dengan membuat FPB pertama Anda."
                        action={
                            <Link href={route('goods-requests.create')}>
                                <Button>
                                    <PlusCircle className="h-4 w-4" />
                                    Buat FPB
                                </Button>
                            </Link>
                        }
                    />
                )}
            </Card>
        </AuthenticatedLayout>
    );
}
