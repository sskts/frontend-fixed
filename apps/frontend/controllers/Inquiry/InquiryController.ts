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
            if (!this.req.session) return this.next(new Error('session is undefined'));
            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.stateReserve(() => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //購入者内容確認へ
                    this.res.redirect(this.router.build('inquiry.confirm', {}));
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
    private stateReserve(cb: Function): void {
        let args : COA.stateReserveInterface.Args = {
            /** 施設コード */
            theater_code: this.req.body.theater_code,
            /** 座席チケット購入番号 */
            reserve_num: this.req.body.reserve_num,
            /** 電話番号 */
            tel_num: this.req.body.tel_num,
        };

        COA.stateReserveInterface.call(args, (err, result)=>{
            if (err) return this.next(new Error(err.message));
            if (!result) return this.next(new Error('result is null'));
            //TODO スクリーンコード
            let performanceId: string =  this.getPerformanceId(
                this.req.body.theater_code, 
                result.date_jouei, 
                result.title_code, 
                result.title_branch_num,
                '0012',
                result.time_begin
            );
            //TODO performance type any
            this.getPerformance(performanceId, (performance: any)=>{
                if (!this.req.session) return this.next(new Error('session is undefined'));
                //予約情報をセッションへ
                this.req.session['inquiry'] = result;
                this.req.session['performance'] = performance;
                cb();
            });
            
        })
        
    }

    /**
     * 照会確認ページ表示
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['inquiry']) {
            this.res.locals['inquiry'] = this.req.session['inquiry'];
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
