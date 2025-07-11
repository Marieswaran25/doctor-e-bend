import { ELEVENLABS_API_KEY, HEYGEN_API_KEY } from '../config';
import { ElevenLabsService } from './external/elevenlabs/elevenlabs';
import { HeygenService } from './external/heygen/heygen';

export class OperationalService {
    private heygenService: HeygenService;
    private elevenLabsService: ElevenLabsService;
    constructor() {
        this.heygenService = new HeygenService({
            api_key: HEYGEN_API_KEY,
        });
        this.elevenLabsService = new ElevenLabsService({ api_key: ELEVENLABS_API_KEY });
    }

    async serviceStatus({ expose_credits = true }: { expose_credits?: boolean }) {
        const [heygenStatus, heygenCredits, elevenLabsStatus, elevenLabsCredits] = await Promise.all([
            this.heygenService.getHeygenStatus(),
            this.heygenService.getHeygenCredits(),
            this.elevenLabsService.getElevenLabsStatus(),
            this.elevenLabsService.getElevenLabsCredits(),
        ]);

        const heygenAffectedComponents = heygenStatus.summary.affected_components;

        const elevenLabsAffectedComponents = elevenLabsStatus.summary.affected_components;

        let isHeyenAvailable = heygenAffectedComponents.length === 0;

        let isElevenLabsAvailable = elevenLabsAffectedComponents.length === 0;

        if (heygenAffectedComponents.length > 0) {
            isHeyenAvailable = heygenAffectedComponents?.filter(component => component?.name === 'https://api.heygen.com').length === 0;
        }

        if (elevenLabsAffectedComponents.length > 0) {
            isElevenLabsAvailable = elevenLabsAffectedComponents?.filter(component => component?.name === 'https://api.elevenlabs.io').length === 0;
        }

        const availableCredits = heygenCredits.data.remaining_quota / 60;

        const heygen = {
            status: isHeyenAvailable ? 'operational' : 'unavailable',
            ...(expose_credits && { total: 670, used: (670 - availableCredits).toFixed(2), remaining: availableCredits }),
            affectedComponents: heygenAffectedComponents,
        };
        const elevenlabs = {
            status: elevenLabsAffectedComponents.length === 0 ? 'operational' : 'unavailable',
            ...(expose_credits && { ...elevenLabsCredits }),
            affectedComponents: elevenLabsAffectedComponents,
        };

        const overAllStatus = isHeyenAvailable && isElevenLabsAvailable ? 'operational' : 'unavailable';

        const response = {
            status: overAllStatus,
            heygen,
            elevenlabs,
        } as const;

        return response;
    }
}
