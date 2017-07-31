/**
 * パフォーマンス一覧
 * @namespace Purchase.PerformancesModule
 */
import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP/sskts-api';
import logger from '../../middlewares/logger';
import { PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Purchase.PerformancesModule');

/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        // TODO GMO取消

        // TODO COA仮予約削除

        // セッション削除
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        delete req.session.auth;

        if (process.env.VIEW_TYPE === undefined) {
            res.locals.movieTheaters = await MP.service.organization.searchMovieTheaters({
                auth: await UtilModule.createAuth(req)
            });
            log(res.locals.movieTheaters);
        }
        res.locals.step = PurchaseModel.PERFORMANCE_STATE;
        res.render('purchase/performances', { layout: 'layouts/purchase/layout' });

    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);

        return;
    }
}

/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getPerformances(req: Request, res: Response): Promise<void> {
    try {
        // 上映イベント検索
        const individualScreeningEvents = await MP.service.event.searchIndividualScreeningEvent({
            auth: await UtilModule.createAuth(req),
            searchConditions: {
                theater: req.body.theater,
                day: moment(req.body.day).format('YYYYMMDD')
            }
        });
        log('上映イベント検索');

        res.json({ error: null, result: individualScreeningEvents });
    } catch (err) {
        res.json({ error: err, result: null });
    }
}
