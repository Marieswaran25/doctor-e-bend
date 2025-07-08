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

export const APPLICATION_NAME = 'doctor-e-bend';

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

export const DATABASE_URL = process.env.DATABASE_URL;

export const JWT_KEYS: Readonly<Record<'access' | 'refresh', string>> = Object.freeze({
    access: process.env.ACCESS_TOKEN_SECRET!,
    refresh: process.env.REFRESH_TOKEN_SECRET!,
});

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_SECRET_ID = process.env.GOOGLE_SECRET_ID!;
