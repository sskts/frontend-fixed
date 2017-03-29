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
export function supertestSession(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    if (req.body.session === undefined && req.query.session === undefined) {
        next();
        return;
    }
    const session = (req.method === 'POST') ? req.body.session : req.query.session;
    Object.keys(session).forEach((key: string) => {
        if (req.method === 'POST') {
            (<any>req.session)[key] = session[key];
        } else {
            (<any>req.session)[key] = session[key];
        }
    });
    next();
    return;
}
