export interface SpamFilter {
    id: string,
    name: string;
    mail: string;
    created: string;
    reason: string;
    type: string;
    ip: string;
    expires: string;
}

export interface SpamFilterListItem extends SpamFilter {
    actionButton: string;
}