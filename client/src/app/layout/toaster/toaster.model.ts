export type ToasterType = 'success' | 'error' | 'warning' | 'info';
export type ToasterState = 'entering' | 'visible' | 'leaving';

export interface ToasterMessage {
    id: string;
    message: string;
    type: ToasterType;
    duration?: number; // milliseconds, default 5000
    autoClose?: boolean; // default true
    state?: ToasterState; // for animations
}

export interface ToasterConfig {
    message: string;
    type: ToasterType;
    duration?: number;
    autoClose?: boolean;
}
