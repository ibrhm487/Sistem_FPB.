import FlashMessages from '@/Components/FlashMessages';
import Dropdown from '@/Components/Dropdown';
import { cn } from '@/Utils/format';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ClipboardList,
    History,
    LayoutDashboard,
    Menu,
    Package,
    PlusCircle,
    Users,
    X,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    active: string;
    roles: ('admin' | 'sales')[];
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, app, flash } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user.role === 'admin';
    const [mobileOpen, setMobileOpen] = useState(false);

    const iconClass = 'h-5 w-5';
    const sections: NavSection[] = [
        {
            items: [
                {
                    label: 'Dashboard',
                    href: route('dashboard'),
                    active: 'dashboard',
                    icon: <LayoutDashboard className={iconClass} />,
                    roles: ['admin', 'sales'],
                },
            ],
        },
        {
            title: 'Permintaan Barang',
            items: [
                {
                    label: 'Semua FPB',
                    href: route('goods-requests.index'),
                    active: 'goods-requests.index',
                    icon: <ClipboardList className={iconClass} />,
                    roles: ['admin', 'sales'],
                },
                {
                    label: 'Buat FPB',
                    href: route('goods-requests.create'),
                    active: 'goods-requests.create',
                    icon: <PlusCircle className={iconClass} />,
                    roles: ['admin', 'sales'],
                },
            ],
        },
        {
            title: 'Master Data',
            items: [
                {
                    label: 'Products',
                    href: route('products.index'),
                    active: 'products.*',
                    icon: <Package className={iconClass} />,
                    roles: ['admin'],
                },
                {
                    label: 'Users',
                    href: route('users.index'),
                    active: 'users.*',
                    icon: <Users className={iconClass} />,
                    roles: ['admin'],
                },
            ],
        },
        {
            title: 'Laporan',
            items: [
                {
                    label: 'Activity Log',
                    href: route('activity-logs.index'),
                    active: 'activity-logs.*',
                    icon: <History className={iconClass} />,
                    roles: ['admin'],
                },
            ],
        },
    ];

    const visibleSections = sections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => item.roles.includes(user.role)),
        }))
        .filter((section) => section.items.length > 0);

    const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {visibleSections.map((section, index) => (
                <div key={index}>
                    {section.title && (
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {section.title}
                        </p>
                    )}
                    <ul className="space-y-1">
                        {section.items.map((item) => {
                            const isActive = route().current(item.active);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <FlashMessages />

            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
                <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                        FPB
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight text-gray-900">
                            {app.name}
                        </p>
                        <p className="text-xs text-gray-400">{app.company}</p>
                    </div>
                </div>
                <NavLinks />
                <div className="border-t border-gray-100 p-3">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-xs text-gray-500">Masuk sebagai</p>
                        <p className="truncate text-sm font-medium text-gray-800">
                            {user.name}
                        </p>
                        <p className="text-xs capitalize text-blue-600">
                            {user.role}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-gray-900/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
                        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
                            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">
                                    FPB
                                </span>
                                {app.name}
                            </span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <NavLinks onNavigate={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="text-sm font-medium text-gray-500">
                            {app.company}
                        </div>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </span>
                                <span className="hidden sm:inline">{user.name}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                {header && (
                    <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
                        {header}
                    </div>
                )}

                <main className="p-4 sm:p-6">
                    {flash?.error && null}
                    {children}
                </main>
            </div>
        </div>
    );
}
