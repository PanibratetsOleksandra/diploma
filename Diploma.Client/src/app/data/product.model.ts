export enum ProductSize {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL'
}

export interface ProductPhoto {
    id: number;
    url: string;
    isMain: boolean;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    materials: string;
    price: number;
    availableSizes: ProductSize[];
    photos: ProductPhoto[];
}