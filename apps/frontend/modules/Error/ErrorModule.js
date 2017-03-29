/**
 * エラー
 * @namespace ErrorModule
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const UtilModule = require("../Util/UtilModule");
/**
 * Not Found
 * @memberOf ErrorModule
 * @function notFound
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function notFound(req, res, _next) {
    const status = 404;
    if (req.xhr) {
        res.status(status).send({ error: 'Not Found.' });
    }
    else {
        res.status(status).render('error/notFound');
    }
    return;
}
exports.notFound = notFound;
/**
 * エラーページ
 * @memberOf ErrorModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function index(err, req, res, _next) {
    if (process.env.NODE_ENV === 'development')
        console.error('show Error');
    console.error(err.stack);
    if (req.session !== undefined && req.session.purchase !== undefined) {
        const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
        res.locals.prevLink = (purchaseModel.performance !== null)
            ? UtilModule.getTheaterUrl(purchaseModel.performance.attributes.theater.name.en)
            : UtilModule.getPortalUrl();
    }
    else {
        res.locals.prevLink = UtilModule.getPortalUrl();
    }
    if (req.session !== undefined) {
        delete req.session.purchase;
        delete req.session.mvtk;
    }
    const status = 500;
    if (req.xhr) {
        console.error('Something failed.');
        res.status(status).send({ error: 'Something failed.' });
    }
    else {
        console.error(err.message);
        res.locals.message = err.message;
        res.locals.error = err;
        res.status(status).render('error/error');
    }
    return;
}
exports.index = index;
