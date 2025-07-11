import { randomUUID, UUID } from 'crypto';
import os from 'os';

interface HealthCheckResult {
    /**
     * Indicates whether the service status is acceptable or not.
     *
     *  - "ok": healthy
     *  - "error": unhealthy
     *  - "warn": healthy, with some concerns.
     */
    status: 'ok' | 'error' | 'warn';
    /**
     * An object that provides detailed health statuses of additional downstream systems and endpoints which can affect the
     * overall health of the main API.
     */
    checks: {
        [keyof: string]: {
            status: 'ok' | 'error' | 'warn';
            componentType?: string;
            observedValue?: any;
            observedUnit?: string;
            time: string;
        }[];
    };
    mode?: 'production' | 'development';
    serviceId: UUID;
    applicationName: string;
}
/**
 * Response schema according as of this draft:
 *
 * https://github.com/inadarei/rfc-healthcheck/blob/master/draft-inadarei-api-health-check-06.txt
 */
export async function fetchHealthcheck({ environment, db, applicationName }: { applicationName: string; environment: string; db: () => Promise<boolean> }): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    // Create the base result
    const checks: HealthCheckResult['checks'] = {
        uptime: [
            {
                componentType: 'system',
                observedValue: os.uptime(),
                observedUnit: 's',
                status: 'ok',
                time: timestamp,
            },
        ],
    };
    try {
        // Check the database connection
        const isDbAvailable = await db();

        checks['pg:connected'] = [
            {
                status: isDbAvailable ? 'ok' : 'error',
                componentType: 'datastore',
                time: timestamp,
            },
        ];
    } catch (error) {
        checks['pg:connected'] = [
            {
                status: 'error',
                componentType: 'datastore',
                time: timestamp,
            },
        ];
    }

    return {
        applicationName,
        serviceId: randomUUID(),
        mode: environment === 'prod' ? 'production' : 'development',
        status: Object.values(checks)
            .reduce((previousValue, checks) => previousValue.concat(checks), [])
            .reduce<'ok' | 'warn' | 'error'>((previousValue, check) => {
                // If an error was already encountered, stick with it
                if (previousValue === 'error') {
                    return previousValue;
                }
                // If an error is found, return it
                if (check.status === 'error') {
                    return check.status;
                }
                // If a warning was already encountered, stick with it
                if (previousValue === 'warn') {
                    return previousValue;
                }
                // If a warning is found, return it
                if (check.status === 'warn') {
                    return check.status;
                }
                return 'ok';
            }, 'ok'),
        checks: checks,
    };
}
