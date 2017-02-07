import BaseController from '../BaseController';
import express = require('express');
import InquirySession = require('../../models/Inquiry/InquiryModel');
import LoginForm from '../../forms/Inquiry/LoginForm';
import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');


export default class InquiryController extends BaseController {
    private inquiryModel: InquirySession.InquiryModel;

    constructor(req: express.Request, res: express.Response, next: express.NextFunction) {
        super(req, res, next);
        this.init();
    }

    /**
     * 初期化
     */
    private init(): void {
        if (!this.req.session) return this.next(this.req.__('common.error.property'));
        this.inquiryModel = new InquirySession.InquiryModel(this.req.session['inquiry']);
    }

    /**
     * 照会認証ページ表示
     */
    public login(): void {
        this.res.locals['theater_code'] = '';
        this.res.locals['reserve_num'] = '';
        this.res.locals['tel_num'] = '';
        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['theater_code'] = '001';
            this.res.locals['reserve_num'] = '11625';
            this.res.locals['tel_num'] = '09040007648';
        }
        this.res.locals['error'] = null;
        return this.res.render('inquiry/login');
    }
    

    /**
     * 照会認証
     */
    public auth() {
        let form = LoginForm(this.req);
        form(this.req, this.res, () => {
            if (!this.req.form) return this.next(this.req.__('common.error.property'));
            if (this.req.form.isValid) {
                this.getStateReserve().then(()=>{
                    if (!this.router) return this.next(this.req.__('common.error.property'));
                    
                    //購入者内容確認へ
                    return this.res.redirect(this.router.build('inquiry', {
                        transactionId: this.inquiryModel.transactionId
                    }));
                }, (err)=>{
                    return this.next(new Error(err.message));
                });

            } else {
                
                this.res.locals['error'] = this.req.form.getErrors();
                return this.res.render('inquiry/login');
            }
        });
        
    }

    /**
     * 照会情報取得
     */
    private async getStateReserve(): Promise<void> {
        this.inquiryModel.transactionId = await MP.makeInquiry.call({
            /** 施設コード */ 
            inquiry_theater: this.req.body.theater_code,   
            /** 座席チケット購入番号 */                 
            inquiry_id: this.req.body.reserve_num, 
            /** 電話番号 */
            inquiry_pass: this.req.body.tel_num, 
        });
        this.logger.debug('MP取引Id取得', this.inquiryModel.transactionId);

        this.inquiryModel.login = this.req.body;

        this.inquiryModel.stateReserve = await COA.stateReserveInterface.call({
            /** 施設コード */ 
            theater_code: this.req.body.theater_code,
            /** 座席チケット購入番号 */                   
            reserve_num: this.req.body.reserve_num, 
            /** 電話番号 */
            tel_num: this.req.body.tel_num, 
        });
        this.logger.debug('COA照会情報取得');

        let performanceId = this.getPerformanceId({
            theaterCode: this.req.body.theater_code, 
            day: this.inquiryModel.stateReserve.date_jouei, 
            titleCode: this.inquiryModel.stateReserve.title_code, 
            titleBranchNum: this.inquiryModel.stateReserve.title_branch_num,
            screenCode: this.inquiryModel.stateReserve.screen_code, 
            timeBegin: this.inquiryModel.stateReserve.time_begin
        });

        this.logger.debug('パフォーマンスID取得', performanceId);
        this.inquiryModel.performance = await MP.getPerformance.call({
            id: performanceId
        });
        this.logger.debug('MPパフォーマンス取得');

        if (!this.req.session) throw this.req.__('common.error.property');
        this.req.session['inquiry'] = this.inquiryModel.formatToSession(); 
        
    }

    

    /**
     * 照会確認ページ表示
     */
    public index(): void {
        if (this.inquiryModel.stateReserve
        && this.inquiryModel.performance
        && this.inquiryModel.login
        && this.inquiryModel.transactionId) {
            this.res.locals['stateReserve'] = this.inquiryModel.stateReserve;
            this.res.locals['performance'] = this.inquiryModel.performance;
            this.res.locals['login'] = this.inquiryModel.login;
            this.res.locals['transactionId'] = this.inquiryModel.transactionId;
            
            return this.res.render('inquiry/index');
        } else {
            if (!this.router) return this.next(this.req.__('common.error.property'));
            //照会認証ページへ
            return this.res.redirect(this.router.build('inquiry.login', {}) + '?transaction_id=' + this.req.params.transactionId);
        }


    }

    


}
