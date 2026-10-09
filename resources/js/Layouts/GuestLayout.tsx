import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-10">
            <div className="mb-6 flex flex-col items-center text-center">
                <Link href="/" className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                        FPB
                    </span>
                    <span className="text-left">
                        <span className="block text-lg font-bold leading-tight text-gray-900">
                            Form Permintaan Barang
                        </span>
                        <span className="block text-sm text-gray-500">
                            PT. CIPTA NIAGA SEMESTA
                        </span>
                    </span>
                </Link>
            </div>

            <div className="w-full overflow-hidden bg-white px-6 py-6 shadow-md sm:max-w-md sm:rounded-xl">
                {children}
            </div>

            <p className="mt-6 text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Sistem Form Permintaan Barang. All rights reserved.
            </p>
        </div>
    );
}
