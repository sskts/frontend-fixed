"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function supertestSession(req, _res, next) {
    if (req.body.session === undefined && req.query.session === undefined) {
        next();
        return;
    }
    const session = (req.method === 'POST') ? req.body.session : req.query.session;
    Object.keys(session).forEach((key) => {
        if (req.method === 'POST') {
            req.session[key] = session[key];
        }
        else {
            req.session[key] = session[key];
        }
    });
    next();
    return;
}
exports.supertestSession = supertestSession;
