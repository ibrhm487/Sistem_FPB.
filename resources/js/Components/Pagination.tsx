import { Paginated } from '@/types';
import { Link } from '@inertiajs/react';

export default function Pagination<T>({ meta }: { meta: Paginated<T> }) {
    if (meta.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
            <p className="text-sm text-gray-500">
                Menampilkan <span className="font-medium">{meta.from ?? 0}</span>-
                <span className="font-medium">{meta.to ?? 0}</span> dari{' '}
                <span className="font-medium">{meta.total}</span> data
            </p>
            <div className="flex flex-wrap items-center gap-1">
                {meta.links.map((link, index) => {
                    const label = link.label
                        .replace('&laquo;', '«')
                        .replace('&raquo;', '»')
                        .replace('Previous', '«')
                        .replace('Next', '»');

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-300"
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={
                                'rounded-md border px-3 py-1.5 text-sm transition ' +
                                (link.active
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')
                            }
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
