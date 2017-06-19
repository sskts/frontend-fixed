/**
 * 照会
 * @namespace Fixed.FixedModule
 */
import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import inquiryLoginForm from '../../forms/Inquiry/LoginForm';
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
export async function index(_: Request, res: Response): Promise<void> {
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
            let stateReserve = await COA.ReserveService.stateReserve({
                theater_code: req.body.theater_code, // 施設コード
                reserve_num: req.body.reserve_num, // 座席チケット購入番号
                tel_num: req.body.tel_num // 電話番号
            });
            log('COA照会情報取得', stateReserve);

            if (stateReserve === null) {
                // 本予約して照会情報取得
                if (req.session.fixed === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                if (req.session.fixed.updateReserveIn === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
                const updReserve = await COA.ReserveService.updReserve(req.session.fixed.updateReserveIn);
                log('COA本予約', updReserve);
                stateReserve = await COA.ReserveService.stateReserve({
                    theater_code: req.body.theater_code, // 施設コード
                    reserve_num: req.body.reserve_num, // 座席チケット購入番号
                    tel_num: req.body.tel_num // 電話番号
                });
                log('COA照会情報取得', stateReserve);
                if (stateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
            }

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
            delete req.session.fixed;
            res.json({ result: reservations });

            return;
        }
        res.json({ result: null });
    } catch (err) {
        res.json({ result: null });
    }
}
