import { Request } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

import { STATUSCODES } from '../types/statusCodes';
import { CustomError } from './customErrors';

export async function validateRequest(req: Request, validations: ValidationChain[]): Promise<void | boolean> {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new CustomError(errors.array()[0].msg, STATUSCODES.BAD_REQUEST);
    }
    return true;
}
