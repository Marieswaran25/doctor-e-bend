import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

import { Environment } from './components/environment';

const allowedEnvironments = ['local', 'testing'] as const;

export const singletonEnvInitializer = Environment.initialize({
    loadEnvVariables(env: string) {
        if (Array.isArray(allowedEnvironments) && allowedEnvironments.includes(env)) {
            const resolvedPath = path.resolve(`./env/${env}.env`);
            if (!fs.existsSync(resolvedPath)) {
                return false;
            }
            config({ path: resolvedPath });
            return true;
        }
        return false;
    },
});

export const APPLICATION_NAME = 'task-bend';

export const CONFIG = Object.freeze({
    database: {
        host: process.env.MASTER_DB_HOST,
        database: process.env.MASTER_DB_DATABASE,
        username: process.env.MASTER_DB_USER,
        password: process.env.MASTER_DB_PASSWORD,
        port: process.env.MASTER_DB_PORT,
    },
    server: {
        port: process.env.PORT,
    },
});

export const VERSION1 = '/api/v1';
