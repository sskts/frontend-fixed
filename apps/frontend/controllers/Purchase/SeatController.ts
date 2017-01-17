import PurchaseController from './PurchaseController';
import SeatForm from '../../forms/Purchase/SeatForm';
import COA = require("@motionpicture/coa-service");


export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {
        if (this.req.query && this.req.query['id']) {
            //パフォーマンス取得
            //TODO performance type any
            this.getPerformance(this.req.query['id'], (performance: any) => {
                if (!this.req.session) return this.next(new Error('session is undefined'));
                this.res.locals['performance'] = performance;
                this.res.locals['step'] = 0;
                this.res.locals['reserveSeats'] = null;
                //console.log(this.req.session['reserveSeats'], this.req.session['performance']._id, this.req.query['id'])
                //仮予約中
                if (this.req.session['reserveSeats']
                    && this.req.session['performance']
                    && this.req.session['performance']._id === this.req.query['id']) {
                    this.res.locals['reserveSeats'] = JSON.stringify(this.req.session['reserveSeats']);
                }
                this.req.session['performance'] = performance;
                this.res.render('purchase/seat');
            });
        } else {
            return this.next(new Error('不適切なアクセスです'));
        }
    }

    /**
     * 座席決定
     */
    public select(): void {

        //バリデーション
        SeatForm(this.req, this.res, () => {
            if (!this.req.session) return this.next(new Error('session is undefined'));

            if (this.req.session['reserveSeats']
                && this.req.session['performance']._id === this.req.query['id']) {
                //予約番号あり(仮予約削除=>仮予約)
                this.deleteTmpReserve({
                    performance: this.req.session['performance'],
                    reserveSeats: this.req.session['reserveSeats']
                }, (result: COA.deleteTmpReserveInterface.Result) => {
                    if (!result) return this.next(new Error('仮予約失敗'));
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    this.reserveSeatsTemporarily({
                        performance: this.req.session['performance'],
                        seats: JSON.parse(this.req.body.seats)
                    }, (result: COA.reserveSeatsTemporarilyInterface.Result) => {
                        if (!this.router) return this.next(new Error('router is undefined'));
                        if (!this.req.session) return this.next(new Error('session is undefined'));
                        //予約情報をセッションへ
                        this.req.session['reserveSeats'] = result;
                        //券種選択へ
                        this.res.redirect(this.router.build('purchase.ticket', {}));
                    });
                });
            } else {
                //予約番号なし(仮予約)
                this.reserveSeatsTemporarily({
                    performance: this.req.session['performance'],
                    seats: JSON.parse(this.req.body.seats)
                }, (result: COA.reserveSeatsTemporarilyInterface.Result) => {
                    if (!this.router) return this.next(new Error('router is undefined'));
                    if (!this.req.session) return this.next(new Error('session is undefined'));
                    //予約情報をセッションへ
                    this.req.session['reserveSeats'] = result;
                    //券種選択へ
                    this.res.redirect(this.router.build('purchase.ticket', {}));
                });
            }


        });
    }

}
