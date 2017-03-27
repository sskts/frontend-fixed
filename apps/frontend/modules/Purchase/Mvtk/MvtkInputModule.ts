/**
 * ムビチケ入力
 * @namespace Purchase.Mvtk.MvtkInputModule
 */

import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as debug from 'debug';
import * as express from 'express';
import * as moment from 'moment';
import MvtkInputForm from '../../../forms/Purchase/Mvtk/MvtkInputForm';
import * as PurchaseSession from '../../../models/Purchase/PurchaseModel';
import * as MvtkUtilModule from '../../Purchase/Mvtk/MvtkUtilModule';
import * as ErrorUtilModule from '../../Util/ErrorUtilModule';
import * as UtilModule from '../../Util/UtilModule';
const debugLog = debug('SSKTS ');

/**
 * ムビチケ券入力ページ表示
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function index
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!req.session) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
    if (!req.session.purchase) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_EXPIRE));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
    if (!purchaseModel.reserveSeats) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));

    // ムビチケセッション削除
    delete (<any>req.session).mvtk;

    // 購入者情報入力表示
    res.locals.mvtkInfo = (process.env.NODE_ENV === 'development')
        ? [{ code: '3400999842', password: '7648' }]
        : [{ code: '', password: '' }];
    res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
    res.locals.transactionId = purchaseModel.transactionMP.id;
    res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
    res.locals.error = null;
    return res.render('purchase/mvtk/input');
}

/**
 * 券種選択
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function select
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
export async function select(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    if (!req.session) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
    if (!req.session.purchase) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_EXPIRE));
    const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
    if (!purchaseModel.transactionMP) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));

    //取引id確認
    if (req.body.transaction_id !== purchaseModel.transactionMP.id) {
        return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_ACCESS));
    }

    MvtkInputForm(req);
    try {
        const validationResult = await req.getValidationResult();
        if (!validationResult.isEmpty()) {
            if (!purchaseModel.reserveSeats) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
            if (!purchaseModel.transactionMP) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
            //購入者情報入力表示
            res.locals.error = validationResult.mapped();
            res.locals.mvtkInfo = JSON.parse(req.body.mvtk);
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            return res.render('purchase/mvtk/input');
        }
        const authResult = await auth(req, purchaseModel);
        if (authResult) {
            return res.redirect('/purchase/mvtk/confirm');
        } else {
            // 認証エラー有効券無し
            if (!purchaseModel.transactionMP) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
            if (!purchaseModel.reserveSeats) return next(ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY));
            //購入者情報入力表示
            res.locals.error = null;
            res.locals.mvtkInfo = mvtkValidation(req);
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            res.locals.reserveSeatLength = purchaseModel.reserveSeats.list_tmp_reserve.length;
            return res.render('purchase/mvtk/input');
        }
    } catch (err) {
        return next(ErrorUtilModule.getError(req, err));
    }
}

/**
 * ムビチケ検証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function mvtkValidation
 * @param {express.Request} req
 * @returns {}
 */
function mvtkValidation(req: express.Request): InputInfo[] {
    const inputInfo: InputInfo[] = JSON.parse(req.body.mvtk);
    return inputInfo.map((input) => {
        const ticket = (<any>req.session).mvtk.find((value: InputInfo) => {
            return (input.code === value.code);
        });
        return {
            code: input.code,
            password: (ticket) ? input.password : '',
            error: (ticket) ? null : req.__('common.validation.mvtk')
        };
    });
}

/**
 * 認証
 * @memberOf Purchase.Mvtk.MvtkInputModule
 * @function auth
 * @param {express.Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<boolean>}
 */
export async function auth(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<boolean> {
    if (!req.session) throw ErrorUtilModule.ERROR_PROPERTY;
    if (!purchaseModel.performance) throw ErrorUtilModule.ERROR_PROPERTY;
    if (!purchaseModel.performanceCOA) throw ErrorUtilModule.ERROR_PROPERTY;

    const mvtkService = MVTK.createPurchaseNumberAuthService();
    const inputInfo: InputInfo[] = JSON.parse(req.body.mvtk);

    const result = await mvtkService.purchaseNumberAuth({
        kgygishCd: MvtkUtilModule.COMPANY_CODE, //興行会社コード
        jhshbtsCd: MVTK.PurchaseNumberAuthUtilities.INFORMATION_TYPE_CODE_VALID, //情報種別コード
        knyknrNoInfoIn: inputInfo.map((value) => {
            return {
                KNYKNR_NO: value.code, //購入管理番号
                PIN_CD: value.password // PINコード
            };
        }),
        skhnCd: MvtkUtilModule.getfilmCode(
            purchaseModel.performanceCOA.titleCode,
            purchaseModel.performanceCOA.titleBranchNum), // 作品コード
        stCd: MvtkUtilModule.getSiteCode(purchaseModel.performance.attributes.theater.id), // サイトコード
        jeiYmd: moment(purchaseModel.performance.attributes.day).format('YYYY/MM/DD') //上映年月日
    });

    debugLog('ムビチケ認証', result);
    let isSuccess = true;
    const mvtkList: PurchaseSession.Mvtk[] = [];
    for (const purchaseNumberAuthResult of result) {
        if (purchaseNumberAuthResult.ykknInfo.length === 0) isSuccess = false;
        for (const info of purchaseNumberAuthResult.ykknInfo) {
            const input = inputInfo.find((value) => {
                return (value.code === purchaseNumberAuthResult.knyknrNo);
            });
            if (!input) continue;

            // ムビチケチケットコード取得
            const ticket = await COA.MasterService.mvtkTicketcode({
                theater_code: purchaseModel.performance.attributes.theater.id,
                kbn_denshiken: purchaseNumberAuthResult.dnshKmTyp,
                kbn_maeuriken: purchaseNumberAuthResult.znkkkytsknGkjknTyp,
                kbn_kensyu: info.ykknshTyp,
                sales_price: Number(info.knshknhmbiUnip),
                app_price: Number(info.kijUnip),
                kbn_eisyahousiki: info.eishhshkTyp,
                title_code: purchaseModel.performanceCOA.titleCode,
                title_branch_num: purchaseModel.performanceCOA.titleBranchNum
            });

            mvtkList.push({
                code: purchaseNumberAuthResult.knyknrNo,
                password: UtilModule.bace64Encode(input.password),
                ykknInfo: info,
                ticket: ticket
            });
        }
    }

    req.session.mvtk = mvtkList;
    return isSuccess;
}

/**
 * 入力情報
 * InputInfo
 */
interface InputInfo {
    /**
     * 購入管理番号
     */
    code: string;
    /**
     * PINコード
     */
    password: string;
    /**
     * エラー
     */
    error: string | null;
}
