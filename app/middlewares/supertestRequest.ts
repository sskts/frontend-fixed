import * as express from 'express';

/**
 * @namespace middlewares.SupertestRequest
 */

/**
 * supertestでセッション変更
 * @memberof middlewares.SupertestRequest
 * @function supertestSession
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function supertestSession(req: express.Request, _: express.Response, next: express.NextFunction): void {
    if (req.body.session === undefined && req.query.session === undefined) {
        next();

        return;
    }
    const session = (req.method === 'POST') ? req.body.session : req.query.session;
    Object.keys(session).forEach((key: string) => {
        (<Express.Session>req.session)[key] = session[key];
    });
    next();

    return;
}
