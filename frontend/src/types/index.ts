export interface PaginatedResponse {
    items: number[];
    hasMore: boolean;
    total: number;
}

export type ListType = 'available' | 'selected';

export interface ActionButtonProps {
    onClick: () => void;
    label: string;
    variant?: 'blue' | 'green' | 'red';
}
