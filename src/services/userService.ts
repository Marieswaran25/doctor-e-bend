import { Users } from '../entities/users';

export class UserService {
    constructor() {}
    async addUser({
        email,
        password,
        firstName,
        lastName,
        mobileNumber,
        metadata,
    }: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        mobileNumber: string;
        metadata: Record<string, any>;
    }): Promise<Users> {
        const metadataJson = JSON.stringify(metadata);
        const user = await Users.create({
            email,
            password,
            firstName,
            lastName,
            mobileNumber,
            metadata: metadataJson,
        }).save();

        return user;
    }

    async getUserByEmail(email: string): Promise<Users | null> {
        const user = await Users.findOne({ where: { email, blacklisted: 0 } });
        return user;
    }

    async getAllUsers({ sortBy }: { sortBy?: 'ASC' | 'DESC' }): Promise<Users[]> {
        const users = await Users.find({ where: { blacklisted: 0 }, order: { createdAt: sortBy || 'ASC' } });
        return users;
    }

    async getUserById(id: string): Promise<Users | null> {
        const user = await Users.findOne({ where: { id, blacklisted: 0 } });
        return user;
    }
}
