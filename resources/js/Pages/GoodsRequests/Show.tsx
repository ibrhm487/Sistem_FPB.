import FpbStatusBadge from '@/Components/FpbStatusBadge';
import Modal from '@/Components/Modal';
import PageHeader from '@/Components/PageHeader';
import Button from '@/Components/UI/Button';
import { Card, CardBody, CardHeader } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { GoodsRequest, GoodsRequestTotals } from '@/types';
import { formatDate } from '@/Utils/format';
import { terbilang } from '@/Utils/terbilang';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Pencil, Printer, Send, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ShowProps {
    goodsRequest: GoodsRequest;
    totals: GoodsRequestTotals;
    can: {
        update: boolean;
        submit: boolean;
        approve: boolean;
        cancel: boolean;
    };
}

const ROW_COUNT = 15;

function formatQty(value: string | number | null | undefined): string {
    const number = Number(value ?? 0);
    if (!Number.isFinite(number)) {
        return '';
    }
    return Number.isInteger(number) ? String(number) : number.toString();
}

export default function Show({ goodsRequest, totals, can }: ShowProps) {
    const [approveOpen, setApproveOpen] = useState(false);
    const approveForm = useForm({
        approved_by_name: goodsRequest.approved_by_name ?? '',
        checked_by_name: goodsRequest.checked_by_name ?? '',
    });

    const items = goodsRequest.items ?? [];

    const submitFpb = () => {
        if (!confirm('Ajukan FPB ini untuk disetujui?')) {
            return;
        }
        router.post(route('goods-requests.submit', goodsRequest.id));
    };

    const cancelFpb = () => {
        if (!confirm('Batalkan FPB ini?')) {
            return;
        }
        router.post(route('goods-requests.cancel', goodsRequest.id));
    };

    const submitApprove = (event: FormEvent) => {
        event.preventDefault();
        approveForm.post(route('goods-requests.approve', goodsRequest.id), {
            preserveScroll: true,
            onSuccess: () => setApproveOpen(false),
        });
    };

    const openPdf = () => {
        window.open(route('goods-requests.pdf', goodsRequest.id), '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title={goodsRequest.fpb_number} />
            <PageHeader
                title={goodsRequest.fpb_number}
                subtitle={
                    <span className="flex items-center gap-2">
                        <FpbStatusBadge status={goodsRequest.status} />
                        <span>Tanggal {formatDate(goodsRequest.request_date)}</span>
                    </span>
                }
                actions={
                    <>
                        <Link href={route('goods-requests.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        {can.update && (
                            <Link href={route('goods-requests.edit', goodsRequest.id)}>
                                <Button variant="secondary">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can.submit && (
                            <Button variant="primary" onClick={submitFpb}>
                                <Send className="h-4 w-4" />
                                Ajukan
                            </Button>
                        )}
                        {can.approve && (
                            <Button variant="success" onClick={() => setApproveOpen(true)}>
                                <CheckCircle2 className="h-4 w-4" />
                                Setujui
                            </Button>
                        )}
                        {can.cancel && (
                            <Button variant="danger" onClick={cancelFpb}>
                                <XCircle className="h-4 w-4" />
                                Batalkan
                            </Button>
                        )}
                        <Button variant="outline" onClick={openPdf}>
                            <Printer className="h-4 w-4" />
                            Cetak PDF
                        </Button>
                    </>
                }
            />

            <Card className="mx-auto max-w-4xl">
                <CardBody className="space-y-5">
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-gray-900">
                            FORM PERMINTAAN BARANG
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                        <InfoRow
                            label="BRANCH / SUBBRANCH"
                            value={[goodsRequest.branch, goodsRequest.subbranch]
                                .filter(Boolean)
                                .join(' / ')}
                        />
                        <InfoRow
                            label="NAMA SALESMAN"
                            value={goodsRequest.salesman_name ?? goodsRequest.user?.name}
                        />
                        <InfoRow
                            label="TANGGAL"
                            value={formatDate(goodsRequest.request_date)}
                        />
                        <InfoRow label="NO. FPB" value={goodsRequest.fpb_number} />
                        <InfoRow label="RYN" value={goodsRequest.ryn} />
                        <InfoRow label="NO. POL" value={goodsRequest.vehicle_number} />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                                    <th className="border border-gray-300 px-2 py-2 text-center">
                                        NO.
                                    </th>
                                    <th className="border border-gray-300 px-2 py-2 text-left">
                                        NAMA BARANG
                                    </th>
                                    <th className="border border-gray-300 px-2 py-2">
                                        SATUAN
                                    </th>
                                    <th colSpan={3} className="border border-gray-300 px-2 py-2">
                                        DIMINTA
                                    </th>
                                </tr>
                                <tr className="bg-gray-50 text-xs text-gray-500">
                                    <th className="border border-gray-300 px-2 py-1" />
                                    <th className="border border-gray-300 px-2 py-1" />
                                    <th className="border border-gray-300 px-2 py-1" />
                                    <th className="border border-gray-300 px-2 py-1">KTN</th>
                                    <th className="border border-gray-300 px-2 py-1">RCG</th>
                                    <th className="border border-gray-300 px-2 py-1">BKS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: ROW_COUNT }).map((_, index) => {
                                    const item = items[index];
                                    return (
                                        <tr key={index}>
                                            <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1.5">
                                                {item ? (
                                                    <>
                                                        <div className="text-gray-800">
                                                            {item.product_name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {item.product_code}
                                                        </div>
                                                    </>
                                                ) : (
                                                    '\u00A0'
                                                )}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1.5 text-center">
                                                {item?.unit ?? ''}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1.5 text-right">
                                                {item ? formatQty(item.qty_ktn) : ''}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1.5 text-right">
                                                {item ? formatQty(item.qty_rcg) : ''}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1.5 text-right">
                                                {item ? formatQty(item.qty_bks) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-gray-50 font-semibold text-gray-800">
                                    <td
                                        colSpan={3}
                                        className="border border-gray-300 px-2 py-2 text-right"
                                    >
                                        TOTAL
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-right">
                                        {totals.ktn}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-right">
                                        {totals.rcg}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-right">
                                        {totals.bks}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-sm">
                        <span className="font-medium text-gray-700">TERBILANG : </span>
                        <span className="italic text-gray-600">
                            {terbilang(totals.grand)}
                        </span>
                    </p>

                    <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
                        <SignatureBlock
                            role="DISETUJUI OLEH"
                            subrole="BSM / ASM / LOG SPV / AOS"
                            name={goodsRequest.approved_by_name}
                            date={goodsRequest.approved_at}
                        />
                        <SignatureBlock
                            role="DIPERIKSA OLEH"
                            subrole="ASS / SK"
                            name={goodsRequest.checked_by_name}
                            date={goodsRequest.checked_at}
                        />
                        <SignatureBlock
                            role="DIMINTA OLEH"
                            subrole="DUTA NIAGA"
                            name={
                                goodsRequest.requested_by_name ??
                                goodsRequest.salesman_name
                            }
                            date={goodsRequest.requested_at}
                        />
                    </div>

                    {goodsRequest.notes && (
                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            <span className="font-medium">Catatan: </span>
                            {goodsRequest.notes}
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal show={approveOpen} onClose={() => setApproveOpen(false)}>
                <form onSubmit={submitApprove} className="p-6">
                    <h2 className="mb-1 text-lg font-semibold text-gray-900">
                        Setujui FPB
                    </h2>
                    <p className="mb-4 text-sm text-gray-500">
                        Isi nama pejabat pada blok pengesahan (opsional).
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Disetujui Oleh (BSM / ASM / LOG SPV / AOS)
                            </label>
                            <Input
                                value={approveForm.data.approved_by_name}
                                onChange={(e) =>
                                    approveForm.setData(
                                        'approved_by_name',
                                        e.target.value,
                                    )
                                }
                                placeholder="Nama pejabat"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Diperiksa Oleh (ASS / SK)
                            </label>
                            <Input
                                value={approveForm.data.checked_by_name}
                                onChange={(e) =>
                                    approveForm.setData(
                                        'checked_by_name',
                                        e.target.value,
                                    )
                                }
                                placeholder="Nama pemeriksa"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setApproveOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" loading={approveForm.processing}>
                            Setujui
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex gap-2">
            <span className="w-48 shrink-0 text-gray-500">{label}</span>
            <span className="text-gray-400">:</span>
            <span className="font-medium text-gray-800">{value || '-'}</span>
        </div>
    );
}

function SignatureBlock({
    role,
    subrole,
    name,
    date,
}: {
    role: string;
    subrole: string;
    name?: string | null;
    date?: string | null;
}) {
    return (
        <div className="text-center text-sm">
            <div className="font-semibold text-gray-800">{role}</div>
            <div className="text-xs text-gray-500">{subrole}</div>
            <div className="h-16" />
            <div className="border-t border-gray-400 pt-2">
                <div>NAMA : {name || '................'}</div>
                <div>TGL&nbsp;&nbsp;&nbsp;: {date ? formatDate(date) : '................'}</div>
            </div>
        </div>
    );
}
