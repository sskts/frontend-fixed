import BaseController from '../BaseController';
import LoginForm from '../../forms/Inquiry/LoginForm';
import COA = require("@motionpicture/coa-service");

export default class InquiryController extends BaseController {
    /**
     * 照会認証ページ表示
     */
    public login(): void {
        this.res.locals['error'] = null;
        this.res.render('inquiry/login');
    }
    

    /**
     * 照会認証
     */
    public auth(): void {
        LoginForm(this.req, this.res, () => {
            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.stateReserve({
                    /** 施設コード */
                    theater_code: this.req.body.theater_code,
                    /** 座席チケット購入番号 */
                    reserve_num: this.req.body.reserve_num,
                    /** 電話番号 */
                    tel_num: this.req.body.tel_num,
                }, () => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //購入者内容確認へ
                    this.res.redirect(this.router.build('inquiry', {}));
                });

            } else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.render('inquiry/login');
                this.res.render('purchase/enterPurchase');
            }
        });
        
    }

    /**
     * 購入チケット内容抽出
     */
    private stateReserve(args: COA.stateReserveInterface.Args, cb: Function): void {
        COA.stateReserveInterface.call(args).then((result)=>{
            //TODO スクリーンコード未追加
            if (!this.req.session) return this.next(new Error('session is undefined'));
            //予約情報をセッションへ
            this.req.session['inquiry'] = result;
            //TODO
            this.req.session['performance'] = { 
                _id: '001201701128513021010',
                screen: { 
                    _id: '0012',
                    name: { ja: 'シネマ２', en: 'Cinema2' },
                    coa_screen_code: '2' 
                },
                theater: { 
                    _id: '001', 
                    name: { ja: 'コア・シネマ', en: 'CoaCimema' } 
                },
                film: { 
                    _id: '00185130',
                    name: { ja: '君の名は。', en: '' },
                    minutes: 107,
                    coa_title_code: '8513',
                    coa_title_branch_num: '0' 
                },
                day: '20170112',
                time_start: '1010',
                time_end: '1205' 
            };
            cb();
            //TODO performance type any
            // let performanceId: string =  this.getPerformanceId(
            //     this.req.body.theater_code, 
            //     result.date_jouei, 
            //     result.title_code, 
            //     result.title_branch_num,
            //     '2',
            //     result.time_begin
            // );
            // this.getPerformance(performanceId, (performance: any)=>{
            //     if (!this.req.session) return this.next(new Error('session is undefined'));
            //     //予約情報をセッションへ
            //     this.req.session['inquiry'] = result;
            //     this.req.session['performance'] = performance;
            //     cb();
            // });
        }, (err)=>{
            return this.next(new Error(err.message));
        });        
    }

    /**
     * 照会確認ページ表示
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['inquiry']) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
            this.res.locals['performance'] = this.req.session['performance'];
            this.res.render('inquiry/confirm');
        } else {
            if (!this.router) return this.next(new Error('router is undefined'));
            //照会認証ページへ
            this.res.redirect(this.router.build('inquiry.login', {}));
        }


    }

    /**
     * 照会印刷
     */
    public print(): void {
        
        
    }


}
