/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP/sskts-api';
import inquiryLoginForm from '../../forms/Inquiry/LoginForm';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:Fixed.FixedModule');

/**
 * 券売機TOPページ表示
 * @memberof Fixed.FixedModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(_: Request, res: Response): Promise<void> {
    res.locals.ticketingSite = process.env.TICKETING_SITE_URL;
    res.render('index/index');
    log('券売機TOPページ表示');
}

/**
 * 券売機設定ページ表示
 * @memberof Fixed.FixedModule
 * @function setting
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function setting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.locals.theaters = await MP.services.theater.getTheaters({
            auth: await UtilModule.createAuth(req)
        });
        res.render('setting/index');
    } catch (err) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message));
    }
}

/**
 * 利用停止ページ表示
 * @memberof Fixed.FixedModule
 * @function stop
 * @param {Response} res
 * @returns {void}
 */
export function stop(_: Request, res: Response): void {
    res.render('stop/index');
}

/**
 * 照会情報取得
 * @memberof Fixed.FixedModule
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
            const transactionId = await MP.services.transaction.makeInquiry({
                auth: await UtilModule.createAuth(req),
                inquiryTheater: req.body.theaterCode, // 施設コード
                inquiryId: Number(req.body.reserveNum), // 座席チケット購入番号
                inquiryPass: req.body.telNum // 電話番号
            });
            // const transactionId = await MP.services.transaction.findByInquiryKey({
            //     theaterCode: req.body.theaterCode, // 施設コード
            //     reserveNum: Number(req.body.reserveNum), // 座席チケット購入番号
            //     tel: req.body.telNum // 電話番号
            // });
            if (transactionId === null) throw ErrorUtilModule.ERROR_PROPERTY;
            log('MP取引Id取得', transactionId);
            let stateReserve = await COA.services.reserve.stateReserve({
                theaterCode: req.body.theaterCode, // 施設コード
                reserveNum: req.body.reserveNum, // 座席チケット購入番号
                telNum: req.body.telNum // 電話番号
            });
            log('COA照会情報取得', stateReserve);

            if (stateReserve === null) {
                // 本予約して照会情報取得
                if (req.session.fixed === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                if (req.session.fixed.updateReserveIn === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                const updReserve = await COA.services.reserve.updReserve(req.session.fixed.updateReserveIn);
                log('COA本予約', updReserve);
                stateReserve = await COA.services.reserve.stateReserve({
                    theaterCode: req.body.theaterCode, // 施設コード
                    reserveNum: req.body.reserveNum, // 座席チケット購入番号
                    telNum: req.body.telNum // 電話番号
                });
                log('COA照会情報取得', stateReserve);
                if (stateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
            }

            const performanceId = UtilModule.getPerformanceId({
                theaterCode: req.body.theaterCode,
                day: stateReserve.dateJouei,
                titleCode: stateReserve.titleCode,
                titleBranchNum: stateReserve.titleBranchNum,
                screenCode: stateReserve.screenCode,
                timeBegin: stateReserve.timeBegin
            });
            log('パフォーマンスID取得', performanceId);
            const performance = await MP.services.performance.getPerformance({
                auth: await UtilModule.createAuth(req),
                performanceId: performanceId
            });
            if (performance === null) throw ErrorUtilModule.ERROR_PROPERTY;
            log('MPパフォーマンス取得');
            // 印刷用
            const reservations = stateReserve.listTicket.map((ticket) => {
                return {
                    reserveNo: req.body.reserveNum,
                    filmNameJa: performance.attributes.film.name.ja,
                    filmNameEn: performance.attributes.film.name.en,
                    theaterName: performance.attributes.theater.name.ja,
                    screenName: performance.attributes.screen.name.ja,
                    performanceDay: moment(performance.attributes.day).format('YYYY/MM/DD'),
                    performanceStartTime: `${UtilModule.timeFormat(performance.attributes.timeStart)}`,
                    seatCode: ticket.seatNum,
                    ticketName: (ticket.addGlasses > 0)
                        ? `${ticket.ticketName}${req.__('common.glasses')}`
                        : ticket.ticketName,
                    ticketSalePrice: ticket.ticketPrice,
                    qrStr: ticket.seatQrcode
                };
            });
            delete req.session.fixed;
            res.json({ result: reservations });

            return;
        }
        res.json({ result: null });
    } catch (err) {
        res.json({ result: null });
    }
}
