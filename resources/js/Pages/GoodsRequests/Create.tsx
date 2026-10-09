import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Product } from '@/types';
import { Head } from '@inertiajs/react';
import FpbForm from './Partials/FpbForm';

interface Defaults {
    branch: string | null;
    subbranch: string | null;
    salesman_name: string | null;
    request_date: string;
}

export default function Create({
    products,
    defaults,
}: {
    products: Product[];
    defaults: Defaults;
}) {
    return (
        <AuthenticatedLayout>
            <Head title="Buat Form Permintaan Barang" />
            <PageHeader
                title="Buat Form Permintaan Barang"
                subtitle="Isi FPB, simpan sebagai draft atau langsung ajukan."
            />
            <FpbForm
                products={products}
                defaults={defaults}
                method="post"
                submitUrl={route('goods-requests.store')}
                cancelUrl={route('goods-requests.index')}
            />
        </AuthenticatedLayout>
    );
}
