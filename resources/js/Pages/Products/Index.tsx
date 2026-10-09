import ConfirmDialog from '@/Components/ConfirmDialog';
import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import PageHeader from '@/Components/PageHeader';
import Pagination from '@/Components/Pagination';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card } from '@/Components/UI/Card';
import { Input, Select, Textarea } from '@/Components/UI/Input';
import { TBody, TD, TH, THead, TR, TableWrap } from '@/Components/UI/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Paginated, Product } from '@/types';
import { formatCurrency } from '@/Utils/format';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

interface IndexProps {
    products: Paginated<Product>;
    categories: string[];
    filters: Record<string, string | number | null>;
}

const emptyForm = {
    product_code: '',
    name: '',
    category: '',
    description: '',
    unit: 'pcs',
    price: 0,
    tax_rate: 11,
    is_active: true,
};

export default function Index({ products, categories, filters }: IndexProps) {
    const [search, setSearch] = useState((filters.search as string) ?? '');
    const [status, setStatus] = useState((filters.status as string) ?? '');
    const [category, setCategory] = useState(
        (filters.category as string) ?? '',
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState<Product | null>(null);

    const form = useForm({ ...emptyForm });

    const openCreate = () => {
        setEditing(null);
        form.setData({ ...emptyForm });
        form.clearErrors();
        setModalOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditing(product);
        form.setData({
            product_code: product.product_code,
            name: product.name,
            category: product.category ?? '',
            description: product.description ?? '',
            unit: product.unit,
            price: Number(product.price),
            tax_rate: Number(product.tax_rate),
            is_active: product.is_active,
        });
        form.clearErrors();
        setModalOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.put(route('products.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        } else {
            form.post(route('products.store'), {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const applyFilter = (overrides: Record<string, string> = {}) => {
        const query: Record<string, string> = {
            search,
            category,
            status,
            ...overrides,
        };
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });
        router.get(route('products.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Products" />
            <PageHeader
                title="Products"
                subtitle="Kelola data produk."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Produk
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
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        className="sm:w-52"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            applyFilter({ category: e.target.value });
                        }}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
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

                {products.data.length > 0 ? (
                    <>
                        <TableWrap>
                            <THead>
                                <TR>
                                    <TH>Kode</TH>
                                    <TH>Nama Produk</TH>
                                    <TH>Kategori</TH>
                                    <TH>Unit</TH>
                                    <TH className="text-right">Harga</TH>
                                    <TH className="text-right">Tax %</TH>
                                    <TH className="text-center">Diminta</TH>
                                    <TH>Status</TH>
                                    <TH className="text-right">Action</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {products.data.map((product) => (
                                    <TR key={product.id}>
                                        <TD className="font-medium">{product.product_code}</TD>
                                        <TD>
                                            <div>{product.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {product.description}
                                            </div>
                                        </TD>
                                        <TD>{product.category ?? '-'}</TD>
                                        <TD>{product.unit}</TD>
                                        <TD className="text-right">
                                            {formatCurrency(product.price)}
                                        </TD>
                                        <TD className="text-right">
                                            {Number(product.tax_rate)}%
                                        </TD>
                                        <TD className="text-center">
                                            {product.goods_request_items_count ?? 0}
                                        </TD>
                                        <TD>
                                            {product.is_active ? (
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
                                                    onClick={() => openEdit(product)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleting(product)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </TableWrap>
                        <Pagination meta={products} />
                    </>
                ) : (
                    <EmptyState
                        title="Belum ada produk"
                        description="Tambahkan produk untuk digunakan pada Form Permintaan Barang."
                        action={
                            <Button onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Tambah Produk
                            </Button>
                        }
                    />
                )}
            </Card>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        {editing ? 'Edit Produk' : 'Tambah Produk'}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Product Code" error={form.errors.product_code}>
                            <Input
                                value={form.data.product_code}
                                onChange={(e) => form.setData('product_code', e.target.value)}
                                placeholder="Otomatis jika kosong"
                            />
                        </Field>
                        <Field label="Nama" required error={form.errors.name}>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                            />
                        </Field>
                        <Field label="Kategori" error={form.errors.category}>
                            <Input
                                value={form.data.category}
                                onChange={(e) =>
                                    form.setData('category', e.target.value)
                                }
                                placeholder="Contoh: Biskuit & Kue"
                            />
                        </Field>
                        <Field label="Unit" required error={form.errors.unit}>
                            <Input
                                value={form.data.unit}
                                onChange={(e) => form.setData('unit', e.target.value)}
                            />
                        </Field>
                        <Field label="Harga" required error={form.errors.price}>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.data.price}
                                onChange={(e) =>
                                    form.setData('price', Number(e.target.value))
                                }
                            />
                        </Field>
                        <Field label="Tax Rate (%)" required error={form.errors.tax_rate}>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={form.data.tax_rate}
                                onChange={(e) =>
                                    form.setData('tax_rate', Number(e.target.value))
                                }
                            />
                        </Field>
                        <Field label="Status">
                            <Select
                                value={form.data.is_active ? '1' : '0'}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.value === '1')
                                }
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </Select>
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Description" error={form.errors.description}>
                                <Textarea
                                    rows={2}
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData('description', e.target.value)
                                    }
                                />
                            </Field>
                        </div>
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

            <ConfirmDialog
                show={!!deleting}
                title="Hapus Produk"
                message={`Hapus produk ${deleting?.name}? Produk yang sudah dipakai pada FPB tidak dapat dihapus.`}
                confirmLabel="Hapus"
                variant="danger"
                onClose={() => setDeleting(null)}
                onConfirm={() => {
                    if (!deleting) return;
                    router.delete(route('products.destroy', deleting.id), {
                        preserveScroll: true,
                        onFinish: () => setDeleting(null),
                    });
                }}
            />
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
