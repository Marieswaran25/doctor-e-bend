import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

import { CONFIG } from './config';
import { Users } from './entities/users';

const dbConfigOptions: MysqlConnectionOptions = {
    type: 'mysql',
    host: CONFIG.database.host,
    database: CONFIG.database.database,
    username: CONFIG.database.username,
    password: CONFIG.database.password,
    port: Number(CONFIG.database.port) || 3306,
    synchronize: false,
    logging: process.env.NODE_ENV === 'local' ? false : true,
    entities: [Users],
    migrations: [`${__dirname}/migrations/*.{js,ts}`],
    connectTimeout: 20000, // 20 seconds
};

export const dbSource: DataSource = new DataSource({ ...dbConfigOptions });
