import { NextFunction, Request, Response } from 'express';
import { body, query } from 'express-validator';

import { Users } from '../entities/users';
import { hashPassword } from '../helpers/bcrypt';
import { validateRequest } from '../helpers/validateRequest';
import { UserService } from '../services/userService';
import { BaseController } from './baseController';

interface UserControllerAttributes {
    createNewUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class UserController extends BaseController implements UserControllerAttributes {
    public static instance: UserController;
    private userService: UserService;
    constructor() {
        super();
        this.userService = new UserService();
    }

    public static initialize() {
        if (!UserController.instance) {
            UserController.instance = new UserController();
        }
        return UserController.instance;
    }
    public async createNewUser(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [
                body('email').isEmail().withMessage('Invalid email'),
                body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
                body('firstName').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
                body('lastName').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
                body('mobileNumber').isMobilePhone('any').withMessage('Invalid mobile number'),
                body('metadata').isObject({ strict: true }).withMessage('Metadata must be an object'),
                body('metadata.age').isInt().withMessage('Age must be a number').optional(),
                body('metadata.country').isString().withMessage('Country must be a string').optional(),
                body('metadata.city').isString().withMessage('City must be a string').optional(),
                body('metadata.state').isString().withMessage('State must be a string').optional(),
                body('metadata.zipCode').isString().withMessage('Zip code must be a string').optional(),
                body('metadata.address').isString().withMessage('Address must be a string').optional(),
                body('metadata.gender').isString().withMessage('Gender must be a string').optional(),
            ]);

            const { email, password, firstName, lastName, mobileNumber, metadata } = req.body;

            this.logger.info(`Finding user ${email}`);
            const existingUser = await this.userService.getUserByEmail(email);
            if (existingUser) {
                this.conflict(res, `User ${email} already exists`);
            } else {
                this.logger.info(`Hashing password`);
                const encryptedPassword = await hashPassword(password);

                this.logger.info(`Creating user ${email}`);
                const user = await this.userService.addUser({
                    email,
                    password: encryptedPassword,
                    firstName,
                    lastName,
                    mobileNumber,
                    metadata,
                });
                this.logger.info(`Created user ${email}`);
                this.created(res, user);
            }
        } catch (err) {
            next(err);
        }
    }

    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [query('sortBy').isIn(['ASC', 'DESC']).withMessage('sortBy must be ASC or DESC').optional()]);
            const { sortBy = 'ASC' } = req.query;

            this.logger.info('Getting all users');
            const users = await this.userService.getAllUsers({ sortBy: sortBy as 'ASC' | 'DESC' });

            this.logger.info(`Found ${users.length} users`);
            const userDetails: Partial<Users>[] = users.map((u: Users) => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                mobileNumber: u.mobileNumber,
                createdAt: u.createdAt,
                metadata: u.metadata ? JSON.parse(u.metadata) : null,
            }));

            this.ok(res, { users: userDetails });
        } catch (err) {
            next(err);
        }
    }
}
