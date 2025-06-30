import { Users } from '../entities/users';

export class UserService {
    constructor() {}
    async addUser({ email, password, username, mobileNumber, metadata }: { email: string; password: string; username: string; mobileNumber: string; metadata: Record<string, any> }): Promise<Users> {
        const metadataJson = JSON.stringify(metadata);
        const user = await Users.create({
            email,
            password,
            loginType: 'default',
            emailVerified: false,
            blacklisted: false,
            username,
            mobileNumber,
            metadata: metadataJson,
        }).save();

        return user;
    }

    async getUserByEmail(email: string): Promise<Users | null> {
        const user = await Users.findOne({ where: { email, blacklisted: false } });
        return user;
    }

    async getUserById(id: string): Promise<Users | null> {
        const user = await Users.findOne({ where: { id, blacklisted: false } });
        return user;
    }
}
