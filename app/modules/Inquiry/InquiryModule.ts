/**
 * 照会
 * @namespace InquiryModule
 */

import * as COA from '@motionpicture/coa-service';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as MP from '../../../libs/MP';
import LoginForm from '../../forms/Inquiry/LoginForm';
import * as InquirySession from '../../models/Inquiry/InquiryModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as UtilModule from '../Util/UtilModule';
const log = debug('SSKTS:InquiryModule');

/**
 * 照会認証ページ表示
 * @memberOf InquiryModule
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:variable-name
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.query.theater === undefined) {
        const status = 404;
        res.status(status).render('error/notFound');
        return;
    }
    try {
        res.locals.portalTheaterSite = await getPortalTheaterSite(req.query.theater);
        res.locals.theaterCode = (req.query.theater !== undefined) ? req.query.theater : '';
        res.locals.reserveNum = (req.query.reserve !== undefined) ? req.query.reserve : '';
        res.locals.telNum = '';
        res.locals.error = null;
        res.render('inquiry/login');
        return;
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}

/**
 * 劇場URL取得
 * @memberOf InquiryModule
 * @function getPortalTheaterSite
 * @param {string} id
 * @returns {Promise<string>}
 */
async function getPortalTheaterSite(id: string): Promise<string> {
    const theater = await MP.getTheater(id);
    const website = theater.attributes.websites.find((value) => value.group === 'PORTAL');
    if (website === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
    return website.url;
}

/**
 * 照会認証
 * @memberOf InquiryModule
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ERROR_PROPERTY;
        const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
        LoginForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            inquiryModel.transactionId = await MP.makeInquiry({
                inquiry_theater: req.body.theater_code, // 施設コード
                inquiry_id: Number(req.body.reserve_num), // 座席チケット購入番号
                inquiry_pass: req.body.tel_num // 電話番号
            });
            if (inquiryModel.transactionId === null) {
                res.locals.portalTheaterSite = await getPortalTheaterSite(req.query.theater);
                res.locals.theaterCode = req.body.theater_code;
                res.locals.reserveNum = req.body.reserve_num;
                res.locals.telNum = req.body.tel_num;
                res.locals.error = getInquiryError(req);
                res.render('inquiry/login');
                return;
            }
            log('MP取引Id取得', inquiryModel.transactionId);
            inquiryModel.login = req.body;
            inquiryModel.stateReserve = await COA.ReserveService.stateReserve({
                theater_code: req.body.theater_code, // 施設コード
                reserve_num: req.body.reserve_num, // 座席チケット購入番号
                tel_num: req.body.tel_num // 電話番号
            });
            log('COA照会情報取得', inquiryModel.stateReserve);
            if (inquiryModel.stateReserve === null) throw ErrorUtilModule.ERROR_PROPERTY;
            const performanceId = UtilModule.getPerformanceId({
                theaterCode: req.body.theater_code,
                day: inquiryModel.stateReserve.date_jouei,
                titleCode: inquiryModel.stateReserve.title_code,
                titleBranchNum: inquiryModel.stateReserve.title_branch_num,
                screenCode: inquiryModel.stateReserve.screen_code,
                timeBegin: inquiryModel.stateReserve.time_begin
            });
            log('パフォーマンスID取得', performanceId);
            inquiryModel.performance = await MP.getPerformance(performanceId);
            log('MPパフォーマンス取得');
            req.session.inquiry = inquiryModel.toSession();
            //購入者内容確認へ
            res.redirect(`/inquiry/${inquiryModel.transactionId}/?theater=${req.body.theater_code}`);
            return;
        } else {
            res.locals.portalTheaterSite = await getPortalTheaterSite(req.query.theater);
            res.locals.theaterCode = req.body.theater_code;
            res.locals.reserveNum = req.body.reserve_num;
            res.locals.telNum = req.body.tel_num;
            res.locals.error = validationResult.mapped();
            res.render('inquiry/login');
            return;
        }
    } catch (err) {
        const error = (err instanceof Error)
            ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
            : new ErrorUtilModule.CustomError(err, undefined);
        next(error);
        return;
    }
}

/**
 * 照会エラー取得
 * @memberOf InquiryModule
 * @function getGMOError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(req: Request) {
    return {
        theater_code: {
            parm: 'theater_code', msg: `${req.__('common.theater_code')}${req.__('common.validation.inquiry')}`, value: ''
        },
        reserve_num: {
            parm: 'reserve_num', msg: `${req.__('common.purchase_number')}${req.__('common.validation.inquiry')}`, value: ''
        },
        tel_num: {
            parm: 'tel_num', msg: `${req.__('common.tel_num')}${req.__('common.validation.inquiry')}`, value: ''
        }
    };
}

/**
 * 照会確認ページ表示
 * @memberOf InquiryModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
export function index(req: Request, res: Response, next: NextFunction): void {
    if (req.session === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    if (req.query.theater === undefined) {
        next(new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_PROPERTY, undefined));
        return;
    }
    const inquiryModel = new InquirySession.InquiryModel(req.session.inquiry);
    if (inquiryModel.stateReserve !== null
        && inquiryModel.performance !== null
        && inquiryModel.login !== null
        && inquiryModel.transactionId !== null) {
        res.locals.theaterCode = inquiryModel.performance.attributes.theater.id;
        res.locals.stateReserve = inquiryModel.stateReserve;
        res.locals.performance = inquiryModel.performance;
        res.locals.login = inquiryModel.login;
        res.locals.transactionId = inquiryModel.transactionId;
        // 印刷用
        const reservations = inquiryModel.stateReserve.list_ticket.map((ticket) => {
            return {
                reserve_no: (<InquirySession.ILogin>inquiryModel.login).reserve_num,
                film_name_ja: (<MP.IPerformance>inquiryModel.performance).attributes.film.name.ja,
                film_name_en: (<MP.IPerformance>inquiryModel.performance).attributes.film.name.en,
                theater_name: (<MP.IPerformance>inquiryModel.performance).attributes.theater.name.ja,
                screen_name: (<MP.IPerformance>inquiryModel.performance).attributes.screen.name.ja,
                performance_day: moment((<MP.IPerformance>inquiryModel.performance).attributes.day).format('YYYY/MM/DD'),
                performance_start_time: UtilModule.timeFormat((<MP.IPerformance>inquiryModel.performance).attributes.time_start) + '～',
                seat_code: ticket.seat_num,
                ticket_name: (ticket.add_glasses > 0)
                    ? `${ticket.ticket_name}${req.__('common.glasses')}`
                    : ticket.ticket_name,
                ticket_sale_price: `￥${ticket.ticket_price}`,
                qr_str: ticket.seat_qrcode
            };
        });
        res.locals.reservations = JSON.stringify(reservations);
        delete req.session.inquiry;
        res.render('inquiry/index');
        return;
    } else {
        //照会認証ページへ
        res.redirect(`/inquiry/login?theater=${req.query.theater}&transactionId=${req.params.transactionId}`);
        return;
    }
}
