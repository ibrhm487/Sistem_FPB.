import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { GoodsRequest, Product } from '@/types';
import { Head } from '@inertiajs/react';
import FpbForm from './Partials/FpbForm';

export default function Edit({
    goodsRequest,
    products,
}: {
    goodsRequest: GoodsRequest;
    products: Product[];
}) {
    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${goodsRequest.fpb_number}`} />
            <PageHeader
                title="Edit Form Permintaan Barang"
                subtitle={goodsRequest.fpb_number}
            />
            <FpbForm
                products={products}
                goodsRequest={goodsRequest}
                method="put"
                submitUrl={route('goods-requests.update', goodsRequest.id)}
                cancelUrl={route('goods-requests.show', goodsRequest.id)}
            />
        </AuthenticatedLayout>
    );
}
