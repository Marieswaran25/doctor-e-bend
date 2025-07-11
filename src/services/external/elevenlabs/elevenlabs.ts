import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import axios from 'axios';
interface ElevenLabsStatusComponent {
    id: string;
    name: string;
    description: string;
    status_page_id: string;
}

interface ElevenLabsStatusStructureComponentItem {
    component: {
        component_id: string;
        display_uptime: boolean;
        name: string;
        description: string;
        hidden: boolean;
        data_available_since: string;
    };
}

interface ElevenLabsStatusStructure {
    id: string;
    status_page_id: string;
    items: ElevenLabsStatusStructureComponentItem[];
}

interface ElevenLabsStatusResponse {
    id: string;
    name: string;
    subpath: string;
    support_url: string;
    support_label: string;
    public_url: string;
    logo_url: string;
    favicon_url: string;
    components: ElevenLabsStatusComponent[];
    subscriptions_disabled: boolean;
    display_uptime_mode: string;
    allow_search_engine_indexing: boolean;
    affected_components: any[];
    ongoing_incidents: any[];
    scheduled_maintenances: any[];
    structure: ElevenLabsStatusStructure;
    expose_status_summary_api: boolean;
    theme: string;
    date_view: string;
    locale: string;
    page_type: string;
    data_available_since: string;
    page_view_tracking_disabled: boolean;
}

export class ElevenLabsService {
    private api_key: string;
    private elevenLabsClient: ElevenLabsClient;
    constructor({ api_key }: { api_key: string }) {
        this.api_key = api_key;
        this.elevenLabsClient = new ElevenLabsClient({ apiKey: api_key });
    }

    async getElevenLabsStatus(): Promise<{ summary: ElevenLabsStatusResponse }> {
        const url = 'https://status.elevenlabs.io/proxy/status.elevenlabs.io';
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

    async getElevenLabsCredits(): Promise<{ total: number; used: number; remaining: number }> {
        const subscription = await this.elevenLabsClient.user.subscription.get();

        const usage = {
            total: subscription.characterLimit,
            used: subscription.characterCount,
            remaining: subscription.characterLimit - subscription.characterCount,
        };
        return usage;
    }
}
