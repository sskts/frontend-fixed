import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { FORBIDDEN } from 'http-status';
import * as requestIp from 'request-ip';

const debug = createDebug('sskts-frontend:middlewares:ipFilter');

/**
 * IP制限ミドルウェア
 */
export default (req: Request, res: Response, next: NextFunction) => {
    const clientIp = requestIp.getClientIp(req);
    debug('clientIp is', clientIp);

    // IP制限拒否の場合
    if (clientIp !== '124.155.113.9') {
        res.status(FORBIDDEN).type('text').send('Forbidden ' + clientIp + ' x-forwarded-for:' + req.headers['x-forwarded-for']);
        return;
    }

    next();
};
