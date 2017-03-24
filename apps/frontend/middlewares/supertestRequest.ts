import * as express from 'express';

/**
 * @namespace middlewares.SupertestRequest
 */

/**
 * supertestでセッション変更
 * @memberOf middlewares.SupertestRequest
 * @function supertestSession
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
export function supertestSession(req: express.Request, _res: express.Response, next: express.NextFunction) {
    if (!req.body.session && !req.query.session) return next();
    const session = (req.method === 'post') ? req.body.session : req.query.session;
    Object.keys(session).forEach((key: string) => {
        if (!req.session) return;
        if (req.method === 'post') {
            req.session[key] = session[key];
        } else {
            req.session[key] = session[key];
        }
    });
    return next();
}
