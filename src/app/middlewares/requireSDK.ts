import { loadService } from '@cinerino/sdk';

import type { NextFunction, Request, Response } from 'express';

export async function requireSDK(
    req: Request,
    __: Response,
    next: NextFunction
) {
    try {
        req.cinerino = {
            service: await loadService(),
        };
        next();
    } catch (error) {
        next(error);
    }
}
