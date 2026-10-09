import Badge from '@/Components/UI/Badge';
import { GoodsRequestStatusValue } from '@/types';

const map: Record<
    GoodsRequestStatusValue,
    { label: string; tone: 'gray' | 'blue' | 'green' | 'slate' }
> = {
    DRAFT: { label: 'Draft', tone: 'gray' },
    SUBMITTED: { label: 'Diajukan', tone: 'blue' },
    APPROVED: { label: 'Disetujui', tone: 'green' },
    CANCELLED: { label: 'Dibatalkan', tone: 'slate' },
};

export default function FpbStatusBadge({
    status,
}: {
    status: GoodsRequestStatusValue;
}) {
    const config = map[status] ?? { label: status, tone: 'gray' as const };

    return <Badge tone={config.tone}>{config.label}</Badge>;
}
