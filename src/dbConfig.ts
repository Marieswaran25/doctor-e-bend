import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { DATABASE_URL } from './config';

const dbConfigOptions: PostgresConnectionOptions = {
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: false,
    logging: process.env.NODE_ENV === 'local' ? false : true,
    entities: [],
    migrations: [`${__dirname}/migrations/*.{js,ts}`],
};

export const dbSource: DataSource = new DataSource({ ...dbConfigOptions });
