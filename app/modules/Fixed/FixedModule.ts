/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import inquiryLoginForm from '../../forms/Inquiry/LoginForm';
import logger from '../../middlewares/logger';
import * as PurchaseSession from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Fixed.FixedModule');

/**
 * 券売機TOPページ表示
 * @memberof FixedModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));

        return;
    }
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    // GMO取消
    if (purchaseModel.transactionGMO !== null
        && purchaseModel.authorizationGMO !== null
        && purchaseModel.orderId !== null
        && purchaseModel.transactionMP !== null
        && purchaseModel.theater !== null) {
        const gmoShopId = purchaseModel.theater.attributes.gmo.shop_id;
        const gmoShopPassword = purchaseModel.theater.attributes.gmo.shop_pass;
        // GMOオーソリ取消
        const alterTranIn = {
            shopId: gmoShopId,
            shopPass: gmoShopPassword,
            accessId: purchaseModel.transactionGMO.accessId,
            accessPass: purchaseModel.transactionGMO.accessPass,
            jobCd: GMO.Util.JOB_CD_VOID
        };
        const removeGMOAuthorizationIn = {
            transactionId: purchaseModel.transactionMP.id,
            gmoAuthorizationId: purchaseModel.authorizationGMO.id
        };
        try {
            const alterTranResult = await GMO.CreditService.alterTran(alterTranIn);
            log('GMOオーソリ取消', alterTranResult);
            // GMOオーソリ削除
            await MP.removeGMOAuthorization(removeGMOAuthorizationIn);
            log('MPGMOオーソリ削除');
        } catch (err) {
            logger.error('SSKTS-APP:FixedModule.index', {
                alterTranIn: alterTranIn,
                removeGMOAuthorizationIn: removeGMOAuthorizationIn,
                err: err
            });
        }
    }
    // COA仮予約削除
    if (purchaseModel.reserveSeats !== null
        && purchaseModel.authorizationCOA !== null
        && purchaseModel.reserveSeats !== null
        && purchaseModel.transactionMP !== null
        && purchaseModel.performance !== null
        && purchaseModel.performanceCOA !== null) {
        if (purchaseModel.authorizationCOA === null) throw ErrorUtilModule.ERROR_PROPERTY;
        const delTmpReserveIn = {
            theater_code: purchaseModel.performance.attributes.theater.id,
            date_jouei: purchaseModel.performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: purchaseModel.performance.attributes.time_start,
            tmp_reserve_num: purchaseModel.reserveSeats.tmp_reserve_num
        };
        const removeCOAAuthorizationIn = {
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        };
        try {
            // COA仮予約削除
            await COA.ReserveService.delTmpReserve(delTmpReserveIn);
            log('COA仮予約削除');
            // COAオーソリ削除
            await MP.removeCOAAuthorization(removeCOAAuthorizationIn);
            log('MPCOAオーソリ削除');
        } catch (err) {
            logger.error('SSKTS-APP:FixedModule.index', {
                delTmpReserveIn: delTmpReserveIn,
                removeCOAAuthorizationIn: removeCOAAuthorizationIn,
                err: err
            });
        }
    }

    delete req.session.purchase;
    delete req.session.mvtk;
    delete req.session.complete;
    res.render('index/index');
    log('券売機TOPページ表示');
}

/**
 * 券売機設定ページ表示
 * @memberof FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function setting(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.locals.theaters = await MP.getTheaters();
        res.render('setting/index');
    } catch (err) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message));
    }
}

/**
 * 利用停止ページ表示
 * @memberof FixedModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
export function stop(_: Request, res: Response): void {
    res.render('stop/index');
}

/**
 * 照会情報取得
 * @function getInquiryData
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getInquiryData(req: Request, res: Response): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        inquiryLoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const transactionId = await MP.makeInquiry({
                inquiry_theater: req.body.theater_code, // 施設コード
                inquiry_id: Number(req.body.reserve_num), // 座席チケット購入番号
                inquiry_pass: req.body.tel_num // 電話番号
            });
            if (transactionId === null) throw ErrorUtilModule.ERROR_PROPERTY;
            log('MP取引Id取得', transactionId);
            const stateReserve = await COA.ReserveService.stateReserve({
                theater_code: req.body.theater_code, // 施設コード
                reserve_num: req.body.reserve_num, // 座席チケット購入番号
                tel_num: req.body.tel_num // 電話番号
            });
            log('COA照会情報取得', stateReserve);
            if (stateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const performanceId = UtilModule.getPerformanceId({
                theaterCode: req.body.theater_code,
                day: stateReserve.date_jouei,
                titleCode: stateReserve.title_code,
                titleBranchNum: stateReserve.title_branch_num,
                screenCode: stateReserve.screen_code,
                timeBegin: stateReserve.time_begin
            });
            log('パフォーマンスID取得', performanceId);
            const performance = await MP.getPerformance(performanceId);
            if (performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
            log('MPパフォーマンス取得');
            // 印刷用
            const reservations = stateReserve.list_ticket.map((ticket) => {
                return {
                    reserve_no: req.body.reserve_num,
                    film_name_ja: performance.attributes.film.name.ja,
                    film_name_en: performance.attributes.film.name.en,
                    theater_name: performance.attributes.theater.name.ja,
                    screen_name: performance.attributes.screen.name.ja,
                    performance_day: moment(performance.attributes.day).format('YYYY/MM/DD'),
                    performance_start_time: `${UtilModule.timeFormat(performance.attributes.time_start)}`,
                    seat_code: ticket.seat_num,
                    ticket_name: (ticket.add_glasses > 0)
                        ? `${ticket.ticket_name}${req.__('common.glasses')}`
                        : ticket.ticket_name,
                    ticket_sale_price: ticket.ticket_price,
                    qr_str: ticket.seat_qrcode
                };
            });
            res.json({ result: reservations });

            return;
        }
        res.json({ result: null });
    } catch (err) {
        res.json({ result: null });
    }
}
