import EmptyState from '@/Components/EmptyState';
import FpbStatusBadge from '@/Components/FpbStatusBadge';
import PageHeader from '@/Components/PageHeader';
import Pagination from '@/Components/Pagination';
import Button from '@/Components/UI/Button';
import { Card } from '@/Components/UI/Card';
import { Input, Select } from '@/Components/UI/Input';
import { TBody, TD, TH, THead, TR, TableWrap } from '@/Components/UI/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { GoodsRequest, Option, PageProps, Paginated, User } from '@/types';
import { formatDate, formatDateTime } from '@/Utils/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, PlusCircle, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface IndexProps {
    requests: Paginated<GoodsRequest>;
    filters: Record<string, string | number | null>;
    statuses: Option[];
    sales: Pick<User, 'id' | 'name'>[];
}

export default function Index({ requests, filters, statuses, sales }: IndexProps) {
    const { auth } = usePage().props as unknown as PageProps;
    const isAdmin = auth.user.role === 'admin';

    const [form, setForm] = useState({
        search: (filters.search as string) ?? '',
        status: (filters.status as string) ?? '',
        user_id: (filters.user_id as string) ?? '',
        date_from: (filters.date_from as string) ?? '',
        date_to: (filters.date_to as string) ?? '',
    });

    const apply = (overrides: Record<string, string> = {}) => {
        const query: Record<string, string> = { ...form, ...overrides };
        Object.keys(query).forEach((key) => {
            if (!query[key]) {
                delete query[key];
            }
        });
        router.get(route('goods-requests.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        apply();
    };

    const reset = () => {
        setForm({ search: '', status: '', user_id: '', date_from: '', date_to: '' });
        router.get(route('goods-requests.index'), {}, { replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Form Permintaan Barang" />
            <PageHeader
                title="Form Permintaan Barang"
                subtitle={
                    isAdmin
                        ? 'Kelola seluruh Form Permintaan Barang (FPB).'
                        : 'Daftar Form Permintaan Barang milik Anda.'
                }
                actions={
                    <Link href={route('goods-requests.create')}>
                        <Button>
                            <PlusCircle className="h-4 w-4" />
                            Buat FPB
                        </Button>
                    </Link>
                }
            />

            <Card>
                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div className="relative lg:col-span-2">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            className="pl-9"
                            placeholder="Cari NO. FPB / salesman / branch / RYN..."
                            value={form.search}
                            onChange={(e) => setForm({ ...form, search: e.target.value })}
                        />
                    </div>
                    <Select
                        value={form.status}
                        onChange={(e) => {
                            setForm({ ...form, status: e.target.value });
                            apply({ status: e.target.value });
                        }}
                    >
                        <option value="">Semua Status</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Select>
                    {isAdmin && (
                        <Select
                            value={form.user_id}
                            onChange={(e) => {
                                setForm({ ...form, user_id: e.target.value });
                                apply({ user_id: e.target.value });
                            }}
                        >
                            <option value="">Semua Sales</option>
                            {sales.map((sale) => (
                                <option key={sale.id} value={sale.id}>
                                    {sale.name}
                                </option>
                            ))}
                        </Select>
                    )}
                    <Input
                        type="date"
                        value={form.date_from}
                        onChange={(e) => setForm({ ...form, date_from: e.target.value })}
                    />
                    <Input
                        type="date"
                        value={form.date_to}
                        onChange={(e) => setForm({ ...form, date_to: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                            Filter
                        </Button>
                        <Button type="button" variant="outline" onClick={reset}>
                            Reset
                        </Button>
                    </div>
                </form>

                {requests.data.length > 0 ? (
                    <>
                        <TableWrap>
                            <THead>
                                <TR>
                                    <TH>NO. FPB</TH>
                                    <TH>Tanggal</TH>
                                    {isAdmin && <TH>Salesman</TH>}
                                    <TH>Branch / Subbranch</TH>
                                    <TH className="text-center">Jml Barang</TH>
                                    <TH>Status</TH>
                                    <TH>Dibuat</TH>
                                    <TH className="text-right">Action</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {requests.data.map((request) => (
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
                                        {isAdmin && (
                                            <TD>{request.salesman_name ?? request.user?.name}</TD>
                                        )}
                                        <TD>
                                            <div className="font-medium text-gray-800">
                                                {request.branch || '-'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {request.subbranch}
                                            </div>
                                        </TD>
                                        <TD className="text-center">
                                            {request.items_count ?? 0}
                                        </TD>
                                        <TD>
                                            <FpbStatusBadge status={request.status} />
                                        </TD>
                                        <TD className="text-xs text-gray-500">
                                            {formatDateTime(request.created_at)}
                                        </TD>
                                        <TD>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route(
                                                        'goods-requests.show',
                                                        request.id,
                                                    )}
                                                >
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {request.status === 'DRAFT' && (
                                                    <Link
                                                        href={route(
                                                            'goods-requests.edit',
                                                            request.id,
                                                        )}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </TableWrap>
                        <Pagination meta={requests} />
                    </>
                ) : (
                    <EmptyState
                        title="Belum ada Form Permintaan Barang"
                        description="Tidak ditemukan FPB yang sesuai dengan filter."
                        action={
                            <Link href={route('goods-requests.create')}>
                                <Button>
                                    <PlusCircle className="h-4 w-4" />
                                    Buat Form Permintaan Barang
                                </Button>
                            </Link>
                        }
                    />
                )}
            </Card>
        </AuthenticatedLayout>
    );
}
