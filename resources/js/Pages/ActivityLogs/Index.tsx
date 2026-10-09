import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import Pagination from '@/Components/Pagination';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card } from '@/Components/UI/Card';
import { Input, Select } from '@/Components/UI/Input';
import { TBody, TD, TH, THead, TR, TableWrap } from '@/Components/UI/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ActivityLog, Paginated, PageProps } from '@/types';
import { formatDateTime } from '@/Utils/format';
import { Head, router, usePage } from '@inertiajs/react';
import { Filter, History, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface IndexProps {
    logs: Paginated<ActivityLog>;
    filters: Record<string, string | number | null>;
    actions: string[];
}

const toneByAction = (action: string) => {
    if (action.startsWith('CREATE')) return 'green' as const;
    if (action.startsWith('UPDATE')) return 'blue' as const;
    if (action.startsWith('REJECT') || action.startsWith('CANCEL')) return 'red' as const;
    if (action.startsWith('EXPORT') || action.startsWith('PRINT')) return 'indigo' as const;
    if (action === 'LOGIN' || action === 'LOGOUT') return 'gray' as const;
    return 'amber' as const;
};

const entityLabel = (log: ActivityLog): string => {
    if (!log.entity_type) return '-';
    const short = log.entity_type.split('\\').pop() ?? log.entity_type;
    return log.entity_id ? `${short} #${log.entity_id}` : short;
};

export default function Index({ logs, filters, actions }: IndexProps) {
    const { auth } = usePage<PageProps>().props;
    const [form, setForm] = useState({
        search: (filters.search as string) ?? '',
        action: (filters.action as string) ?? '',
        date_from: (filters.date_from as string) ?? '',
        date_to: (filters.date_to as string) ?? '',
    });

    const query = (overrides: Record<string, string> = {}) => {
        const merged: Record<string, string> = { ...form, ...overrides };
        const clean: Record<string, string> = {};
        Object.entries(merged).forEach(([key, value]) => {
            if (value) clean[key] = value;
        });
        return clean;
    };

    const applyFilter = (event?: FormEvent) => {
        event?.preventDefault();
        router.get(route('activity-logs.index'), query(), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const reset = () => {
        setForm({ search: '', action: '', date_from: '', date_to: '' });
        router.get(route('activity-logs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Activity Log" />
            <PageHeader
                title="Activity Log"
                subtitle="Riwayat aktivitas pengguna dan perubahan data."
            />

            <Card>
                <form
                    onSubmit={applyFilter}
                    className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <div className="lg:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Pencarian
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Cari aktivitas / deskripsi..."
                                value={form.search}
                                onChange={(e) =>
                                    setForm({ ...form, search: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Action
                        </label>
                        <Select
                            value={form.action}
                            onChange={(e) =>
                                setForm({ ...form, action: e.target.value })
                            }
                        >
                            <option value="">Semua Action</option>
                            {actions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Dari Tanggal
                        </label>
                        <Input
                            type="date"
                            value={form.date_from}
                            onChange={(e) =>
                                setForm({ ...form, date_from: e.target.value })
                            }
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                Sampai
                            </label>
                            <Input
                                type="date"
                                value={form.date_to}
                                onChange={(e) =>
                                    setForm({ ...form, date_to: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
                        <Button type="submit">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button type="button" variant="outline" onClick={reset}>
                            Reset
                        </Button>
                    </div>
                </form>

                {logs.data.length > 0 ? (
                    <>
                        <TableWrap>
                            <THead>
                                <TR>
                                    <TH>Waktu</TH>
                                    <TH>User</TH>
                                    <TH>Action</TH>
                                    <TH>Entitas</TH>
                                    <TH>Deskripsi</TH>
                                    <TH>IP Address</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {logs.data.map((log) => (
                                    <TR key={log.id}>
                                        <TD className="whitespace-nowrap text-xs text-gray-500">
                                            {formatDateTime(log.created_at)}
                                        </TD>
                                        <TD className="font-medium">
                                            {log.user?.name ?? (
                                                <span className="text-gray-400">
                                                    {log.user_id ?? 'System'}
                                                </span>
                                            )}
                                        </TD>
                                        <TD>
                                            <Badge tone={toneByAction(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </TD>
                                        <TD className="text-xs text-gray-500">
                                            {entityLabel(log)}
                                        </TD>
                                        <TD className="max-w-md text-gray-600">
                                            {log.description ?? '-'}
                                        </TD>
                                        <TD className="text-xs text-gray-400">
                                            {log.ip_address ?? '-'}
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </TableWrap>
                        <Pagination meta={logs} />
                    </>
                ) : (
                    <EmptyState
                        title="Belum ada aktivitas"
                        description="Aktivitas pengguna akan tampil di sini."
                        icon={<History className="h-6 w-6" />}
                    />
                )}
            </Card>

            <p className="mt-3 text-xs text-gray-400">
                Login sebagai {auth.user.name}.
            </p>
        </AuthenticatedLayout>
    );
}
