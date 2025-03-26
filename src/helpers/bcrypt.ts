import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string, saltRounds: number = SALT_ROUNDS): Promise<string> => bcrypt.hash(password, saltRounds);

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => bcrypt.compare(password, hashedPassword);
