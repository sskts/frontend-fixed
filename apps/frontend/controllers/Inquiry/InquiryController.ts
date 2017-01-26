import BaseController from '../BaseController';
import LoginForm from '../../forms/Inquiry/LoginForm';
import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');

export default class InquiryController extends BaseController {
    /**
     * 照会認証ページ表示
     */
    public login(): void {
        this.res.locals['theater_code'] = '';
        this.res.locals['reserve_num'] = '';
        this.res.locals['tel_num'] = '';
        if (process.env.NODE_ENV === 'dev') {
            this.res.locals['theater_code'] = '001';
            this.res.locals['reserve_num'] = '5836';
            this.res.locals['tel_num'] = '0849273550';
        }
        this.res.locals['error'] = null;
        return this.res.render('inquiry/login');
    }
    

    /**
     * 照会認証
     */
    public auth() {
        LoginForm(this.req, this.res, () => {
            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                this.getStateReserve().then(()=>{
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //購入者内容確認へ
                    return this.res.redirect(this.router.build('inquiry', {}));
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
        let stateReserve = await COA.stateReserveInterface.call({
            theater_code: this.req.body.theater_code, /** 施設コード */                    
            reserve_num: this.req.body.reserve_num, /** 座席チケット購入番号 */
            tel_num: this.req.body.tel_num, /** 電話番号 */
        });

        let performanceId = '001201701018513021010';
        //TODO情報不足
        // this.getPerformanceId({
        //     theaterCode: string, 
        //     day: string, 
        //     titleCode: string, 
        //     titleBranchNum: string,
        //     screenCode: string, 
        //     timeBegin: string
        // }) 
        let performance = await MP.getPerformance.call({
            id: performanceId
        });

        if (!this.req.session) throw new Error('session is undefined');
        this.req.session['inquiry'] = {
            stateReserve: stateReserve,
            performance: performance,
            reserve_num: this.req.body.reserve_num
        };
        
    }

    

    /**
     * 照会確認ページ表示
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['inquiry'] 
        && this.req.session['inquiry'].stateReserve
        && this.req.session['inquiry'].performance) {
            this.res.locals['stateReserve'] = this.req.session['inquiry'].stateReserve;
            this.res.locals['performance'] = this.req.session['inquiry'].performance.data;
            this.res.locals['reserve_num'] = this.req.session['inquiry'].reserve_num;
            return this.res.render('inquiry/confirm');
        } else {
            if (!this.router) return this.next(new Error('router is undefined'));
            //照会認証ページへ
            return this.res.redirect(this.router.build('inquiry.login', {}));
        }


    }

    /**
     * 照会印刷
     */
    public print(): void {
        
        
    }


}
