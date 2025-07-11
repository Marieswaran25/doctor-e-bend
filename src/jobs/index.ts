import cron from 'node-cron';

import logger from '../helpers/logger';
import { healthCheckMonitoringJob } from './healthCheck.job';

export function initializeJobs() {
    logger.info('[JOB] Scheduling Active Jobs...');

    logger.info('[JOB] Scheduling Health Check Job for every day at 06:00 PM IST');
    cron.schedule('0 18 * * *', healthCheckMonitoringJob, { timezone: 'Asia/Kolkata' }); // Run every day at 10:00 AM IST

    logger.info('[JOB] All Active Jobs Scheduled');
}
