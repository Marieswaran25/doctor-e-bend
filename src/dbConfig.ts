import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { DATABASE_URL } from './config';
import { Conversations } from './entities/conversations';
import { Sessions } from './entities/sessions';
import { UserRoles } from './entities/userRoles';
import { Users } from './entities/users';

const dbConfigOptions: PostgresConnectionOptions = {
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: false,
    logging: process.env.NODE_ENV === 'testing' ? false : true,
    entities: [Users, UserRoles, Sessions, Conversations],
    migrations: [`${__dirname}/migrations/*.{js,ts}`],
};

export const dbSource: DataSource = new DataSource({ ...dbConfigOptions });
