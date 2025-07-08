import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import { hashPassword } from '../helpers/bcrypt';
import { CustomError } from '../helpers/customErrors';
import { getclientIp } from '../helpers/getClientIp';
import { validateRequest } from '../helpers/validateRequest';
import { AuthService } from '../services/authService';
import { DECODED_PAYLOAD, UserService } from '../services/userService';
import { CustomRequest } from '../types/customRequest';
import { STATUSCODES } from '../types/statusCodes';
import { BaseController } from './baseController';

interface UserControllerAttributes {
    createNewUser(req: Request, res: Response, next: NextFunction): Promise<any>;
}

export class UserController extends BaseController implements UserControllerAttributes {
    public static instance: UserController;
    private userService: UserService;
    private authService: AuthService;
    constructor() {
        super();
        this.userService = new UserService();
        this.authService = new AuthService();
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
                    roles: ['user'],
                    loginType: 'default',
                });
                this.logger.info(`Created user ${email}`);
                const [accessToken, refreshToken] = await this.userService.generateToken(user.id, email);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });

                return this.created(res, {
                    accessToken,
                    refreshToken,
                    userId: user.id,
                });
            }
        } catch (err) {
            next(err);
        }
    }

    public async basicLoginAuth(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [body('email').isEmail().withMessage('Invalid email'), body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')]);

            const { email, password } = req.body;

            this.logger.info(`Finding user ${email}`);
            const user = await this.userService.getUserByEmail(email);
            if (!user || !user?.password) {
                return this.notFound(res, `User ${email} not found`);
            }
            if (user.blacklisted) {
                return this.unauthorized(res, `access denied for ${email}`);
            }

            this.logger.info(`Verifying password`);
            const isPasswordValid = await this.userService.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return this.unauthorized(res, 'Invalid email or password');
            }

            const [accessToken, refreshToken] = await this.userService.generateToken(user.id, email);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });

            this.logger.info(`Logging in user ${email}`);

            return this.ok(res, {
                accessToken,
                refreshToken,
                userId: user.id,
            });
        } catch (err) {
            next(err);
        }
    }

    public async loginWithGoogle(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [body('token').isString().withMessage('Invalid token').optional(), body('code').isString().withMessage('Invalid code').optional()]);

            const { token, code } = req.body;

            if (token && code) {
                this.badRequest(res, 'cannot accept both oauth flow - token and code');
            }

            const { email, name, profilePic, emailVerified } = await this.authService.verifyGoogleToken({ token, code });

            this.logger.info(`Finding user ${email}`);
            const user = await this.userService.getUserByEmail(email);
            if (user) {
                this.logger.info(`User ${email} found`);
                const [accessToken, refreshToken] = await this.userService.generateToken(user.id, email);

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });

                return this.ok(res, {
                    accessToken,
                    refreshToken,
                    userId: user.id,
                });
            } else {
                this.logger.info(`Creating user ${email}`);
                const user = await this.userService.addUser({
                    email,
                    password: '',
                    username: name,
                    mobileNumber: '',
                    profilePic,
                    metadata: { ip: getclientIp(req) },
                    loginType: 'google',
                    isEmailVerified: !!emailVerified,
                    roles: ['user'],
                });
                this.logger.info(`Created user ${email}`);
                const [accessToken, refreshToken] = await this.userService.generateToken(user.id, email);

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });

                return this.created(res, {
                    accessToken,
                    refreshToken,
                    userId: user.id,
                });
            }
        } catch (err) {
            next(err);
        }
    }

    public async getMe(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return this.unauthorized(res, 'Unauthorized');
            }
            const { userId } = req.user;
            const user = await this.userService.getUserById(userId);
            if (!user) {
                return this.notFound(res, 'User not found');
            }
            const { password: _, ...rest } = user;

            return this.ok(res, {
                ...rest,
                roles: req.roles,
                metadata: rest.metadata ? JSON.parse(rest.metadata) : {},
            });
        } catch (err) {
            next(err);
        }
    }

    public async rotateRefreshToken(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const xCorrId = req.headers['x-correlation-id'] as string;
            const refreshToken = req.cookies['refreshToken'] || req.body.refreshToken;
            if (!refreshToken) {
                throw new CustomError('Invalid Refresh Token', STATUSCODES.UNAUTHORIZED);
            }
            this.logger.debug(`verifying client refresh token`, xCorrId);
            const decoded: DECODED_PAYLOAD = (await this.userService.verifyJwt(refreshToken, 'refresh')) as unknown as DECODED_PAYLOAD;
            this.logger.debug(`Generating Access token`, xCorrId);
            const [accessToken] = await this.userService.generateToken(decoded.userId, decoded.email);
            res.status(STATUSCODES.OK).json({ accessToken, userId: decoded.userId, refreshToken });
        } catch (error) {
            next(error);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('refreshToken');
            this.noContent(res);
        } catch (error) {
            next(error);
        }
    }
}
