import jwt from 'jsonwebtoken';

import { JWT_KEYS } from '../config';
import { Roles, UserRoles } from '../entities/userRoles';
import { Users } from '../entities/users';
import { comparePassword } from '../helpers/bcrypt';

export type DECODED_PAYLOAD = {
    userId: string;
    email: string;
    roles: Roles[];
    [key: string]: any;
};
export class UserService {
    constructor() {}
    async addUser({
        email,
        password = '',
        username,
        mobileNumber,
        metadata,
        roles,
        isEmailVerified = false,
        loginType = 'default',
        profilePic = '',
    }: {
        email: string;
        password: string;
        username: string;
        mobileNumber: string;
        metadata: Record<string, any>;
        loginType: 'default' | 'google' | 'admin';
        roles: Roles[];
        profilePic?: string;
        isEmailVerified?: boolean;
    }): Promise<Users> {
        let metadataJson = '';
        if (metadata) {
            metadataJson = JSON.stringify(metadata);
        }

        const user = await Users.create({
            email,
            password,
            loginType,
            emailVerified: isEmailVerified,
            blacklisted: false,
            username,
            mobileNumber,
            metadata: metadataJson,
            profileUrl: profilePic,
        }).save();

        roles.map(async role =>
            UserRoles.create({
                role: role,
                userId: user,
            }).save(),
        );

        return user;
    }

    async createRoles(roles: Roles[], userId: string): Promise<UserRoles[]> {
        const roleSaved = roles.map(role =>
            UserRoles.create({
                role,
                userId: { id: userId },
            }).save(),
        );

        return Promise.all(roleSaved);
    }

    async getUserByEmail<T extends boolean>(email: string, includeRoles?: T): Promise<T extends true ? (Users & { userRoles: UserRoles[] }) | null : Users | null> {
        const user = await Users.findOne({ where: { email, blacklisted: false }, relations: includeRoles ? ['userRoles'] : [] });
        return user;
    }

    async getUserById(id: string): Promise<Users | null> {
        const user = await Users.findOne({ where: { id, blacklisted: false } });
        return user;
    }
    async signJwt(payload: DECODED_PAYLOAD, type: 'access' | 'refresh', expiration: `${number}${'d' | 'h' | 'm' | 's'}`): Promise<string> {
        const SECRET = JWT_KEYS[type];
        return new Promise((resolve, reject) => {
            jwt.sign(payload, SECRET, { expiresIn: expiration || '1d', algorithm: 'HS256' }, (err, token) => {
                if (err || !token) {
                    console.error(err);
                    return reject(err);
                }
                resolve(token);
            });
        });
    }

    async verifyJwt(token: string, type: 'access' | 'refresh'): Promise<any> {
        const SECRET = JWT_KEYS[type];
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    }
    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return await comparePassword(password, hashedPassword);
    }

    async generateToken(id: string, email: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signJwt(
                {
                    userId: id,
                    email,
                    roles: ['user'],
                },
                'access',
                '20m',
            ),
            this.signJwt(
                {
                    userId: id,
                    email,
                    roles: ['user'],
                },
                'refresh',
                '1d',
            ),
        ]);
        return [accessToken, refreshToken];
    }
}
