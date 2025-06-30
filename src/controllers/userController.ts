import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import { hashPassword } from '../helpers/bcrypt';
import { getclientIp } from '../helpers/getClientIp';
import { validateRequest } from '../helpers/validateRequest';
import { UserService } from '../services/userService';
import { BaseController } from './baseController';

interface UserControllerAttributes {
    createNewUser(req: Request, res: Response, next: NextFunction): Promise<any>;
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
                body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
                body('mobileNumber').isMobilePhone('any').withMessage('Invalid mobile number'),
                body('metadata').isObject().withMessage('Metadata must be an object').optional(),
                body('metadata.location').isString().withMessage('Location must be an string').optional(),
                body('metadata.language').isString().withMessage('Language must be an string').optional(),
            ]);

            const { email, password, username, mobileNumber, metadata } = req.body;

            this.logger.info(`Finding user ${email}`);
            const existingUser = await this.userService.getUserByEmail(email);
            if (existingUser) {
                return this.conflict(res, `User ${email} already exists`);
            } else {
                this.logger.info(`Hashing password`);
                const encryptedPassword = await hashPassword(password);

                this.logger.info(`Creating user ${email}`);
                const user = await this.userService.addUser({
                    email,
                    password: encryptedPassword,
                    username,
                    mobileNumber,
                    metadata: { ...metadata, ip: getclientIp(req) },
                });
                this.logger.info(`Created user ${email}`);
                return this.created(res, user);
            }
        } catch (err) {
            next(err);
        }
    }
}
