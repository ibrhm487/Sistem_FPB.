import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import PageHeader from '@/Components/PageHeader';
import Pagination from '@/Components/Pagination';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card } from '@/Components/UI/Card';
import { Input, Select } from '@/Components/UI/Input';
import { TBody, TD, TH, THead, TR, TableWrap } from '@/Components/UI/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Option, PageProps, Paginated, User } from '@/types';
import { formatDateTime } from '@/Utils/format';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, Search } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

interface IndexProps {
    users: Paginated<User>;
    filters: Record<string, string | number | null>;
    roles: Option[];
}

const emptyForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'sales',
    is_active: true,
    branch: '',
    subbranch: '',
};

export default function Index({ users, filters, roles }: IndexProps) {
    const { auth } = usePage().props as unknown as PageProps;
    const [search, setSearch] = useState((filters.search as string) ?? '');
    const [role, setRole] = useState((filters.role as string) ?? '');
    const [status, setStatus] = useState((filters.status as string) ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [resetting, setResetting] = useState<User | null>(null);

    const form = useForm({ ...emptyForm });
    const resetForm = useForm({ password: '', password_confirmation: '' });

    const openCreate = () => {
        setEditing(null);
        form.setData({ ...emptyForm });
        form.clearErrors();
        setModalOpen(true);
    };

    const openEdit = (user: User) => {
        setEditing(user);
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
            is_active: user.is_active ?? true,
            branch: user.branch ?? '',
            subbranch: user.subbranch ?? '',
        });
        form.clearErrors();
        setModalOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.put(route('users.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        } else {
            form.post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const submitReset = (event: FormEvent) => {
        event.preventDefault();
        if (!resetting) return;
        resetForm.post(route('users.reset-password', resetting.id), {
            preserveScroll: true,
            onSuccess: () => {
                setResetting(null);
                resetForm.reset();
            },
        });
    };

    const applyFilter = (overrides: Record<string, string> = {}) => {
        const query: Record<string, string> = { search, role, status, ...overrides };
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });
        router.get(route('users.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Users" />
            <PageHeader
                title="Users / Sales"
                subtitle="Kelola akun Admin dan Sales."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah User
                    </Button>
                }
            />

            <Card>
                <form
                    className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row"
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilter();
                    }}
                >
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            className="pl-9"
                            placeholder="Cari nama / email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        className="sm:w-44"
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            applyFilter({ role: e.target.value });
                        }}
                    >
                        <option value="">Semua Role</option>
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </Select>
                    <Select
                        className="sm:w-44"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilter({ status: e.target.value });
                        }}
                    >
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </Select>
                    <Button type="submit">Cari</Button>
                </form>

                {users.data.length > 0 ? (
                    <>
                        <TableWrap>
                            <THead>
                                <TR>
                                    <TH>Nama</TH>
                                    <TH>Email</TH>
                                    <TH>Role</TH>
                                    <TH>Branch</TH>
                                    <TH className="text-center">FPB</TH>
                                    <TH>Last Login</TH>
                                    <TH>Status</TH>
                                    <TH className="text-right">Action</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {users.data.map((user) => (
                                    <TR key={user.id}>
                                        <TD className="font-medium">{user.name}</TD>
                                        <TD>{user.email}</TD>
                                        <TD className="capitalize">{user.role}</TD>
                                        <TD className="text-xs text-gray-500">
                                            {user.branch
                                                ? `${user.branch}${user.subbranch ? ` / ${user.subbranch}` : ''}`
                                                : '-'}
                                        </TD>
                                        <TD className="text-center">
                                            {user.goods_requests_count ?? 0}
                                        </TD>
                                        <TD className="text-xs text-gray-500">
                                            {formatDateTime(user.last_login_at)}
                                        </TD>
                                        <TD>
                                            {user.is_active ? (
                                                <Badge tone="green">Aktif</Badge>
                                            ) : (
                                                <Badge tone="red">Nonaktif</Badge>
                                            )}
                                        </TD>
                                        <TD>
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setResetting(user);
                                                        resetForm.reset();
                                                    }}
                                                    title="Reset password"
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(user)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </TableWrap>
                        <Pagination meta={users} />
                    </>
                ) : (
                    <EmptyState
                        title="Belum ada user"
                        description="Tambahkan akun Sales atau Admin."
                        action={
                            <Button onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Tambah User
                            </Button>
                        }
                    />
                )}
            </Card>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        {editing ? 'Edit User' : 'Tambah User'}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Nama" required error={form.errors.name}>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                            />
                        </Field>
                        <Field label="Email" required error={form.errors.email}>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                            />
                        </Field>
                        <Field
                            label={editing ? 'Password (kosongkan bila tidak diubah)' : 'Password'}
                            required={!editing}
                            error={form.errors.password}
                        >
                            <Input
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                            />
                        </Field>
                        <Field label="Konfirmasi Password">
                            <Input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) =>
                                    form.setData('password_confirmation', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Role" required error={form.errors.role}>
                            <Select
                                value={form.data.role}
                                onChange={(e) => form.setData('role', e.target.value)}
                            >
                                {roles.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Branch" error={form.errors.branch}>
                            <Input
                                value={form.data.branch}
                                onChange={(e) => form.setData('branch', e.target.value)}
                            />
                        </Field>
                        <Field label="Subbranch" error={form.errors.subbranch}>
                            <Input
                                value={form.data.subbranch}
                                onChange={(e) => form.setData('subbranch', e.target.value)}
                            />
                        </Field>
                        <Field label="Status">
                            <Select
                                value={form.data.is_active ? '1' : '0'}
                                disabled={editing?.id === auth.user.id}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.value === '1')
                                }
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </Select>
                        </Field>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" loading={form.processing}>
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal show={!!resetting} onClose={() => setResetting(null)}>
                <form onSubmit={submitReset} className="p-6">
                    <h2 className="mb-1 text-lg font-semibold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mb-4 text-sm text-gray-500">
                        Set password baru untuk {resetting?.name}.
                    </p>
                    <div className="space-y-4">
                        <Field label="Password Baru" required error={resetForm.errors.password}>
                            <Input
                                type="password"
                                value={resetForm.data.password}
                                onChange={(e) =>
                                    resetForm.setData('password', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Konfirmasi Password">
                            <Input
                                type="password"
                                value={resetForm.data.password_confirmation}
                                onChange={(e) =>
                                    resetForm.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setResetting(null)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" loading={resetForm.processing}>
                            Reset Password
                        </Button>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}

function Field({
    label,
    children,
    required,
    error,
}: {
    label: string;
    children: ReactNode;
    required?: boolean;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
