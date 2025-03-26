import { DataSource } from 'typeorm';

import logger, { Logger } from '../helpers/logger';

export interface IDatabase {
    db: DataSource;
    isConnected: boolean;
    connect(): Promise<void>;
    close(): Promise<void>;
}

export class Database implements IDatabase {
    public db: DataSource;
    private _isConnected: boolean;
    public static instance: Database;
    private logger: Logger;

    private constructor(dbSource: DataSource) {
        this.db = dbSource;
        this._isConnected = dbSource.isInitialized;
        this.logger = logger;
    }

    public static initialize(dbSource: DataSource) {
        if (!Database.instance) {
            Database.instance = new Database(dbSource);
        }
        return Database.instance;
    }

    public get isConnected(): boolean {
        return this._isConnected;
    }

    public async connect(): Promise<void> {
        if (!this._isConnected) {
            try {
                await this.db.initialize();
                this._isConnected = this.db.isInitialized;
                this.logger.info(`[Database]: Database connection established`);
            } catch (err) {
                this.logger.error(`[Database]: Error while connecting to database ${JSON.stringify(err)}`);
                throw err;
            }
        } else {
            this.logger.info(`[Database]: Already connected`);
        }
    }

    public async close(): Promise<void> {
        if (this._isConnected) {
            await this.db.destroy();
            this._isConnected = false;
            this.logger.info(`[Database]: Database connection closed`);
        }
    }
    public async isDbAvailable(): Promise<boolean> {
        try {
            if (!this.db.isInitialized) {
                return false;
            }
            await this.db.query('SELECT 1');
            return true;
        } catch (err) {
            this.logger.error(`[Database]: Error while connecting to database ${JSON.stringify(err)}`);
            return false;
        }
    }

    public getEntityManager() {
        return this.db.manager;
    }
}
