import { Database } from './components/database';
import { Server, ServerConfig } from './components/server';
import { APPLICATION_NAME, CONFIG, singletonEnvInitializer, VERSION1 } from './config';
import { dbSource } from './dbConfig';
import logger from './helpers/logger';
import { initializeJobs } from './jobs';
import { globalErrorHandler } from './middlewares/error';
import { log } from './middlewares/log';
import specs from './openapi';
import V1Routes from './routes/v1_routes';

const initializeDatabase = Database.initialize(dbSource);
const connectDatabase = initializeDatabase.connect.bind(initializeDatabase);
const closeDatabase = initializeDatabase.close.bind(initializeDatabase);

const serverOptions: ServerConfig = {
    APPLICATION_NAME,
    logger: logger,
    defaultPort: Number(CONFIG.server.port) || 2000,
    middlewares: {
        cors: {
            origin: ['http://localhost:3000', 'https://doctor-e.vercel.app/', 'https://doctor-e.vercel.app', 'http://localhost:5000'],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true,
            allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token',
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 100 requests per windowMs
        },
        helmet: true,
        bodyParser: {
            limit: '10mb',
        },
        cookieParser: true,
        additional: [log],
    },
    routeConfig: [
        {
            prefix: VERSION1,
            route: V1Routes(),
        },
    ],
    errorHandler: globalErrorHandler,
    openAPI: {
        path: '/api-docs',
        specs,
    },
    terminusOptions: {
        onSignal: async () => {
            logger.info(`[Server]: cleanup started`);
            await closeDatabase();
        },
        onShutdown: async () => {
            logger.info(`[Server]: cleanup finished, server shutdown`);
        },
        healthChecks: {
            '/healthcheck': async () => {
                return 'OK';
            },
        },
    },
};

const initializeApp = async () => {
    try {
        if (singletonEnvInitializer.isLoaded) {
            logger.info(`[Environment]: ${singletonEnvInitializer.currentEnvironment?.toLocaleUpperCase()}`);

            if (!initializeDatabase.isConnected) {
                await connectDatabase();
            } else {
                logger.info('[Database]: Already connected');
            }
            const initializeServer = Server.initialize(serverOptions);
            const startServer = initializeServer.start.bind(initializeServer);
            startServer();
            initializeJobs();
        }
    } catch (error: any) {
        console.error(error);
        logger.error(`[Initialization Error]: Failed to initialize - ${JSON.stringify(error)}`);
    }
};

initializeApp();
