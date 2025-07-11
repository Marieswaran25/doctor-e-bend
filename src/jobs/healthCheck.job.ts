import { Database } from '../components/database';
import { APPLICATION_NAME, singletonEnvInitializer } from '../config';
import { dbSource } from '../dbConfig';
import { fetchHealthcheck } from '../helpers/healthCheck';
import { lineSeparator } from '../helpers/lineSeparator';
import logger from '../helpers/logger';
import { slackWebhook } from '../services/external/slackWebhook';
import { OperationalService } from '../services/operationalService';

export const healthCheckMonitoringJob = async () => {
    try {
        logger.info('[JOB] Running Health Check Job...');
        const initializeDatabase = Database.initialize(dbSource);
        const externalServices = new OperationalService();
        const isDbAvailable = initializeDatabase.isDbAvailable.bind(initializeDatabase);
        const [result, externalresult] = await Promise.all([
            fetchHealthcheck({
                applicationName: APPLICATION_NAME,
                db: isDbAvailable,
                environment: singletonEnvInitializer.currentEnvironment!,
            }),
            externalServices.serviceStatus({ expose_credits: true }),
        ]);

        slackWebhook.send({
            msg: lineSeparator({
                internal: result,
                external: externalresult,
            }),
            fallBackMsg: `${APPLICATION_NAME} Health Check`,
            title: 'Doctor-E Health Check',
            color: result.status === 'ok' && externalresult.status === 'operational' ? '#22bb33' : '#bb2124',
            appEnv: singletonEnvInitializer.currentEnvironment!,
        });
        logger.info('[JOB] Health Check Job Completed');
    } catch (error) {
        logger.error(`[JOB] Health Check Job Failed - ${JSON.stringify(error)}`);
    }
};
