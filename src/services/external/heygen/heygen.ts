import axios from 'axios';
interface HeygenStatusComponent {
    id: string;
    name: string;
    description: string;
    status_page_id: string;
}

interface HeygenStatusStructureComponentItem {
    component: {
        component_id: string;
        display_uptime: boolean;
        name: string;
        description: string;
        hidden: boolean;
        data_available_since: string;
    };
}

interface HeygenStatusStructure {
    id: string;
    status_page_id: string;
    items: HeygenStatusStructureComponentItem[];
}

interface HeygenStatusResponse {
    id: string;
    name: string;
    subpath: string;
    support_url: string;
    support_label: string;
    public_url: string;
    logo_url: string;
    favicon_url: string;
    components: HeygenStatusComponent[];
    subscriptions_disabled: boolean;
    display_uptime_mode: string;
    allow_search_engine_indexing: boolean;
    affected_components: any[];
    ongoing_incidents: any[];
    scheduled_maintenances: any[];
    structure: HeygenStatusStructure;
    expose_status_summary_api: boolean;
    theme: string;
    date_view: string;
    locale: string;
    page_type: string;
    data_available_since: string;
    page_view_tracking_disabled: boolean;
}

interface HeygenQuotaResponse {
    error: null;
    data: {
        remaining_quota: number;
        details: {
            api: number;
            avatar_iv_free_credit: number;
        };
    };
}

export class HeygenService {
    private api_key: string;
    constructor({ api_key }: { api_key: string }) {
        this.api_key = api_key;
    }

    async getHeygenStatus(): Promise<{ summary: HeygenStatusResponse }> {
        const url = 'https://status.heygen.com/proxy/status.heygen.com';
        return new Promise((resolve, reject) => {
            axios
                .get(url)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    async getHeygenCredits(): Promise<HeygenQuotaResponse> {
        const url = 'https://api.heygen.com/v2/user/remaining_quota';
        return new Promise((resolve, reject) => {
            axios
                .get(url, {
                    headers: {
                        'X-Api-Key': this.api_key,
                    },
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}
