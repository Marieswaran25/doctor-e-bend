import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { DATABASE_URL } from './config';
import { UserRoles } from './entities/userRoles';
import { Users } from './entities/users';

const dbConfigOptions: PostgresConnectionOptions = {
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: false,
    logging: process.env.NODE_ENV === 'local' ? false : true,
    entities: [Users, UserRoles],
    migrations: [`${__dirname}/migrations/*.{js,ts}`],
};

export const dbSource: DataSource = new DataSource({ ...dbConfigOptions });
