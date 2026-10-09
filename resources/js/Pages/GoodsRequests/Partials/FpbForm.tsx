import Button from '@/Components/UI/Button';
import { Card, CardBody, CardHeader } from '@/Components/UI/Card';
import { Input, Select, Textarea } from '@/Components/UI/Input';
import { GoodsRequest, Product } from '@/types';
import { terbilang } from '@/Utils/terbilang';
import { useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

const ROW_COUNT = 15;

interface FormItem {
    product_id: string;
    product_code: string;
    product_name: string;
    unit: string;
    qty_ktn: number;
    qty_rcg: number;
    qty_bks: number;
}

interface FormShape {
    request_date: string;
    branch: string;
    subbranch: string;
    salesman_name: string;
    ryn: string;
    vehicle_number: string;
    notes: string;
    action: string;
    items: FormItem[];
}

interface Defaults {
    branch: string | null;
    subbranch: string | null;
    salesman_name: string | null;
    request_date: string;
}

const emptyItem: FormItem = {
    product_id: '',
    product_code: '',
    product_name: '',
    unit: '',
    qty_ktn: 0,
    qty_rcg: 0,
    qty_bks: 0,
};

function buildRows(request?: GoodsRequest): FormItem[] {
    const rows: FormItem[] = Array.from({ length: ROW_COUNT }, () => ({ ...emptyItem }));

    request?.items?.forEach((item, index) => {
        if (index >= ROW_COUNT) {
            return;
        }
        rows[index] = {
            product_id: String(item.product_id ?? ''),
            product_code: item.product_code ?? '',
            product_name: item.product_name,
            unit: item.unit ?? '',
            qty_ktn: Number(item.qty_ktn),
            qty_rcg: Number(item.qty_rcg),
            qty_bks: Number(item.qty_bks),
        };
    });

    return rows;
}

export default function FpbForm({
    products,
    goodsRequest,
    defaults,
    method,
    submitUrl,
    cancelUrl,
}: {
    products: Product[];
    goodsRequest?: GoodsRequest;
    defaults?: Defaults;
    method: 'post' | 'put';
    submitUrl: string;
    cancelUrl: string;
}) {
    const form = useForm<FormShape>({
        request_date:
            goodsRequest?.request_date?.substring(0, 10) ??
            defaults?.request_date ??
            new Date().toISOString().substring(0, 10),
        branch: goodsRequest?.branch ?? defaults?.branch ?? '',
        subbranch: goodsRequest?.subbranch ?? defaults?.subbranch ?? '',
        salesman_name: goodsRequest?.salesman_name ?? defaults?.salesman_name ?? '',
        ryn: goodsRequest?.ryn ?? '',
        vehicle_number: goodsRequest?.vehicle_number ?? '',
        notes: goodsRequest?.notes ?? '',
        action: 'save_draft',
        items: buildRows(goodsRequest),
    });

    const totals = useMemo(() => {
        return form.data.items.reduce(
            (acc, item) => ({
                ktn: acc.ktn + Number(item.qty_ktn || 0),
                rcg: acc.rcg + Number(item.qty_rcg || 0),
                bks: acc.bks + Number(item.qty_bks || 0),
            }),
            { ktn: 0, rcg: 0, bks: 0 },
        );
    }, [form.data.items]);

    const grandTotal = totals.ktn + totals.rcg + totals.bks;

    const setItem = (index: number, changes: Partial<FormItem>) => {
        form.setData(
            'items',
            form.data.items.map((item, i) =>
                i === index ? { ...item, ...changes } : item,
            ),
        );
    };

    const onProductChange = (index: number, productId: string) => {
        const product = products.find((p) => String(p.id) === productId);
        if (!product) {
            setItem(index, {
                product_id: '',
                product_code: '',
                product_name: '',
                unit: '',
            });
            return;
        }
        setItem(index, {
            product_id: String(product.id),
            product_code: product.product_code,
            product_name: product.name,
            unit: product.unit,
        });
    };

    const submit = (action: 'save_draft' | 'submit') => {
        form.transform((data) => ({ ...data, action }));
        form[method](submitUrl, { preserveScroll: true });
    };

    const onSubmitForm = (event: FormEvent) => {
        event.preventDefault();
        submit('save_draft');
    };

    const inputError = (key: string) =>
        (form.errors as Record<string, string | undefined>)[key];

    return (
        <form onSubmit={onSubmitForm} className="space-y-6">
            <Card>
                <CardHeader
                    title="Informasi Form Permintaan Barang"
                    description="Data salesman dan cabang diambil dari master user."
                />
                <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            NO. FPB
                        </label>
                        <Input value={goodsRequest?.fpb_number ?? 'Otomatis'} disabled readOnly />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            TANGGAL <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="date"
                            value={form.data.request_date}
                            onChange={(e) => form.setData('request_date', e.target.value)}
                        />
                        {inputError('request_date') && (
                            <p className="mt-1 text-xs text-red-600">
                                {inputError('request_date')}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            NAMA SALESMAN
                        </label>
                        <Input
                            value={form.data.salesman_name}
                            onChange={(e) => form.setData('salesman_name', e.target.value)}
                        />
                        {inputError('salesman_name') && (
                            <p className="mt-1 text-xs text-red-600">
                                {inputError('salesman_name')}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            BRANCH
                        </label>
                        <Input
                            value={form.data.branch}
                            onChange={(e) => form.setData('branch', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            SUBBRANCH
                        </label>
                        <Input
                            value={form.data.subbranch}
                            onChange={(e) => form.setData('subbranch', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            RYN
                        </label>
                        <Input
                            value={form.data.ryn}
                            onChange={(e) => form.setData('ryn', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            NO. POL
                        </label>
                        <Input
                            value={form.data.vehicle_number}
                            onChange={(e) => form.setData('vehicle_number', e.target.value)}
                        />
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader
                    title="Daftar Barang"
                    description="Tersedia 15 baris. Kolom DIMINTA dibagi menjadi KTN, RCG, dan BKS."
                />
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th rowSpan={2} className="px-3 py-2 text-center">
                                    NO.
                                </th>
                                <th rowSpan={2} className="min-w-[240px] px-3 py-2">
                                    NAMA BARANG
                                </th>
                                <th rowSpan={2} className="px-3 py-2">
                                    SATUAN
                                </th>
                                <th colSpan={3} className="px-3 py-2 text-center">
                                    DIMINTA
                                </th>
                            </tr>
                            <tr>
                                <th className="px-3 py-2 text-center">KTN</th>
                                <th className="px-3 py-2 text-center">RCG</th>
                                <th className="px-3 py-2 text-center">BKS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {form.data.items.map((item, index) => (
                                <tr key={index} className="align-top">
                                    <td className="px-3 py-2 text-center text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Select
                                            value={item.product_id}
                                            onChange={(e) =>
                                                onProductChange(index, e.target.value)
                                            }
                                        >
                                            <option value="">-- Pilih Barang --</option>
                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.product_code} — {product.name}
                                                </option>
                                            ))}
                                        </Select>
                                        {inputError(`items.${index}.product_id`) && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {inputError(`items.${index}.product_id`)}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">
                                        {item.unit || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className="w-20 text-right"
                                            value={item.qty_ktn}
                                            onChange={(e) =>
                                                setItem(index, {
                                                    qty_ktn: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className="w-20 text-right"
                                            value={item.qty_rcg}
                                            onChange={(e) =>
                                                setItem(index, {
                                                    qty_rcg: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className="w-20 text-right"
                                            value={item.qty_bks}
                                            onChange={(e) =>
                                                setItem(index, {
                                                    qty_bks: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 font-semibold text-gray-800">
                                <td colSpan={3} className="px-3 py-2 text-right">
                                    TOTAL
                                </td>
                                <td className="px-3 py-2 text-right">{totals.ktn}</td>
                                <td className="px-3 py-2 text-right">{totals.rcg}</td>
                                <td className="px-3 py-2 text-right">{totals.bks}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {inputError('items') && (
                    <p className="px-5 py-2 text-xs text-red-600">{inputError('items')}</p>
                )}
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader title="Catatan" />
                    <CardBody>
                        <Textarea
                            rows={3}
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Catatan tambahan (opsional)"
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Ringkasan" />
                    <CardBody className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total KTN</span>
                            <span className="font-medium">{totals.ktn}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total RCG</span>
                            <span className="font-medium">{totals.rcg}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total BKS</span>
                            <span className="font-medium">{totals.bks}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                            <span className="font-semibold text-gray-700">
                                Total Keseluruhan
                            </span>
                            <span className="font-bold text-blue-700">{grandTotal}</span>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-xs italic text-gray-500">
                            Terbilang: {terbilang(grandTotal)}
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <a href={cancelUrl}>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                        Batal
                    </Button>
                </a>
                <Button
                    type="button"
                    variant="secondary"
                    loading={form.processing}
                    onClick={() => submit('save_draft')}
                >
                    Save Draft
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    loading={form.processing}
                    onClick={() => submit('submit')}
                >
                    Ajukan FPB
                </Button>
            </div>
        </form>
    );
}
