export type UserRole = 'admin' | 'sales';

export type GoodsRequestStatusValue =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'CANCELLED';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_active?: boolean;
    branch?: string | null;
    subbranch?: string | null;
    email_verified_at?: string | null;
    last_login_at?: string | null;
    goods_requests_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    product_code: string;
    name: string;
    category: string | null;
    description: string | null;
    unit: string;
    price: string | number;
    tax_rate: string | number;
    is_active: boolean;
    goods_request_items_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GoodsRequestItem {
    id?: number;
    goods_request_id?: number;
    product_id: number | null;
    line_number: number;
    product_code: string | null;
    product_name: string;
    unit: string | null;
    qty_ktn: string | number;
    qty_rcg: string | number;
    qty_bks: string | number;
}

export interface GoodsRequest {
    id: number;
    fpb_number: string;
    user_id: number;
    branch: string | null;
    subbranch: string | null;
    salesman_name: string | null;
    request_date: string;
    ryn: string | null;
    vehicle_number: string | null;
    status: GoodsRequestStatusValue;
    notes: string | null;
    approved_by_name: string | null;
    approved_at: string | null;
    checked_by_name: string | null;
    checked_at: string | null;
    requested_by_name: string | null;
    requested_at: string | null;
    submitted_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    items_count?: number;
    user?: Pick<User, 'id' | 'name' | 'email'>;
    items?: GoodsRequestItem[];
}

export interface GoodsRequestTotals {
    ktn: number;
    rcg: number;
    bks: number;
    grand: number;
}

export interface ActivityLog {
    id: number;
    user_id: number | null;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    description: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface Option {
    value: string;
    label: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    app: {
        name: string;
        company: string;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
};
