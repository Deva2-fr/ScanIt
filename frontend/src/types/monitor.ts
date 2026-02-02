export interface Monitor {
    id: number;
    user_id: number;
    url: string;
    frequency: 'daily' | 'weekly';
    is_active: boolean;
    last_score?: number;
    threshold: number;
    created_at: string;
    last_checked_at?: string;
}

export interface MonitorCreate {
    url: string;
    frequency: 'daily' | 'weekly';
    threshold: number;
}
