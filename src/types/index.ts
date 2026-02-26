export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    category: string;
    image_url?: string;
    main_image?: string;
    is_featured_home: boolean;
    active: boolean;
    stock?: number;
    kit_items?: KitItem[];
}

export interface KitItem {
    id: string;
    kit_id: string;
    product_id: string;
    quantity: number;
    product?: Product;
}

export interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    total_price: number;
    status: 'pendiente' | 'en proceso' | 'completado' | 'cancelado';
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
}

export interface SiteSettings {
    [key: string]: string;
}

export interface NavItem {
    id: string;
    label: string;
    link: string;
    order: number;
    active: boolean;
}

export interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    badge_text?: string;
    trust_text?: string;
    trust_images?: any;
    button_1_text: string;
    button_1_link: string;
    button_2_text?: string;
    button_2_link?: string;
    image_url?: string;
    active: boolean;
    order: number;
}

export interface HomeSection {
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    description: string;
    link: string;
    category: 'soluciones' | 'extras' | 'categories' | 'stats';
    order: number;
    active: boolean;
    bg_color?: string;
}

export interface FeatureFlags {
    [key: string]: boolean;
}
