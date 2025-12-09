
export interface SpamFilter {
    id: string,
    name: string;
    mail: string;
    timestamp: string;
    reason: string;
    type: string;
}

export interface SpamFilterListItem extends SpamFilter {
    actionButton: string;
}