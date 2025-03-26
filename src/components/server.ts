import { createTerminus } from '@godaddy/terminus';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, { Express, NextFunction, Request, Response, Router } from 'express';
import { Options as RateLimitOptions, rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import http from 'http';

import { CustomError } from '../helpers/customErrors';
import { Logger } from '../helpers/logger';

type TerminusOptions = {
    onSignal: () => Promise<void>;
    onShutdown: () => Promise<void>;
    healthChecks: { '/healthcheck': () => Promise<any> };
};

type MiddlewareConfig = {
    helmet: boolean;
    rateLimit?: Partial<RateLimitOptions>;
    bodyParser?: {
        limit: `${number}mb`;
    };
    cookieParser: boolean;
    cors?: CorsOptions;
    additional?: Array<(req: Request, res: Response, next: NextFunction) => void>; // User-defined middlewares
};

type RouteConfig = {
    prefix: `/api/${string}`;
    route: Router;
};

export type ServerConfig = {
    APPLICATION_NAME: string;
    logger: Logger;
    defaultPort: number;
    errorHandler?: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
    terminusOptions?: TerminusOptions;
    middlewares: MiddlewareConfig;
    routeConfig: RouteConfig[];
};

interface IServer {
    start(): void;
}

export class Server implements IServer {
    private static instance: Server;
    private logger: Logger;
    public readonly port: string | number;
    private app: Express;
    private server: http.Server;

    constructor(serverConfig: ServerConfig) {
        this.port = serverConfig.defaultPort;

        this.app = express();
        this.server = http.createServer(this.app);

        this.logger = serverConfig.logger;

        // Initialize Middlewares
        this.configureMiddlewares(serverConfig.middlewares);

        // Initialize Routes
        this.initializeRoutes(serverConfig.routeConfig);

        // Error Handler (if provided)
        this.enableHandleError(serverConfig.errorHandler);

        // Setup Terminus for graceful shutdown
        this.setupTerminus(serverConfig.terminusOptions);

        this.setupServerLifecycleEvents();
    }

    public static initialize(serverConfig: ServerConfig) {
        if (!Server.instance) {
            Server.instance = new Server(serverConfig);
        }
        return Server.instance;
    }

    // Middleware configuration
    private configureMiddlewares(middlewareConfig?: MiddlewareConfig) {
        this.app.use(cors(middlewareConfig?.cors ?? {}));
        this.logger.info(`[CORS]: CORS enabled`);

        if (middlewareConfig?.helmet) {
            this.logger.info(`[Helmet]: Helmet enabled`);
            this.app.use(helmet());
        }

        if (middlewareConfig?.rateLimit) {
            this.logger.info(`[Rate Limit]: Rate-limiter enabled with options: ${JSON.stringify(middlewareConfig.rateLimit)}`);
            const limiter = rateLimit({
                windowMs: middlewareConfig.rateLimit.windowMs || 15 * 60 * 1000,
                max: middlewareConfig.rateLimit.max || 100,
                ...middlewareConfig.rateLimit,
            });
            this.app.use(limiter);
        }

        if (middlewareConfig?.cookieParser) {
            this.logger.info(`[Cookie Parser]: Cookie parser enabled`);
            this.app.use(cookieParser());
        }

        if (middlewareConfig?.bodyParser) {
            this.logger.info(`[Body Parser]: Body parser enabled`);
            this.app.use(express.json({ limit: middlewareConfig.bodyParser.limit }));
            this.app.use(express.urlencoded({ extended: true, limit: middlewareConfig.bodyParser.limit }));
        }

        if (Array.isArray(middlewareConfig?.additional)) {
            this.logger.info(`[Middleware]: Additional middlewares enabled`);
            middlewareConfig.additional.forEach(middleware => this.app.use(middleware));
        }
    }

    // Error handler
    private enableHandleError(errorHandler?: (err: CustomError, req: Request, res: Response, next: NextFunction) => void) {
        if (errorHandler) {
            this.app.use(errorHandler);
        }
    }

    private initializeRoutes(routeConfig?: RouteConfig[]) {
        if (Array.isArray(routeConfig)) {
            routeConfig.forEach(route => {
                this.app.use(route.prefix, route.route);
            });
        }
    }

    // Setup graceful shutdown using Terminus (Godaddy)
    private setupTerminus(terminusOptions?: TerminusOptions) {
        const { onSignal, onShutdown, healthChecks } = { ...terminusOptions };

        createTerminus(this.server, {
            timeout: 10000,
            signals: ['SIGTERM', 'SIGINT'],
            healthChecks: {
                verbatim: true,
                ...healthChecks,
                __unsafeExposeStackTraces: true,
            },
            logger: (msg: string, err: { message: string }) => {
                if (err) {
                    this.logger.error(`[Server]: ${err.message}`);
                } else {
                    this.logger.info(`[Server]: ${msg}`);
                }
            },
            onSignal,
            onShutdown,
            sendFailuresDuringShutdown: true,
        });
    }

    // Start server
    public start() {
        this.server.listen(this.port, () => {
            this.logger.info(`[Server]: Running on port ${this.port}`);
        });
    }

    // Setup lifecycle events
    private setupServerLifecycleEvents() {
        this.server.on('close', () => {
            this.logger.info('[Server]: Server is closing.');
        });
    }
}
