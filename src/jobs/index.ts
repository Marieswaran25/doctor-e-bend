import cron from 'node-cron';

import logger from '../helpers/logger';
import { healthCheckMonitoringJob } from './healthCheck.job';

export function initializeJobs() {
    logger.info('[JOB] Scheduling Active Jobs...');

    logger.info('[JOB] Scheduling Health Check Job for every day at 11.30AM IST and  06:00 PM IST');
    cron.schedule('0 6 * * *', healthCheckMonitoringJob); // Run every day at 11:30 AM IST

    cron.schedule('30 12 * * *', healthCheckMonitoringJob); // Run every day at 06:00 PM IST
    logger.info('[JOB] All Active Jobs Scheduled');
}
