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
    if (!req.body.session) return next();
    const session = req.body.session;
    Object.keys(session).forEach((key: string) => {
        req.body.session[key] = session[key];
    });
}
