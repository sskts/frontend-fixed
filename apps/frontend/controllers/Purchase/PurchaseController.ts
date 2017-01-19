import BaseController from '../BaseController';
import COA = require("@motionpicture/coa-service");
/**
 * TODO any type
 */
export default class PurchaseController extends BaseController {

    /**
     * セッション削除
     */
    protected deleteSession(): void {
        if (!this.req.session) return;
        delete this.req.session['purchaseInfo']
        // delete this.req.session['performance']
        delete this.req.session['reserveSeats']
        delete this.req.session['reserveTickets']
        delete this.req.session['updateReserve']
        delete this.req.session['gmoTokenObject'];
    }

    /**
     * スクリーン状態取得
     */
    public getScreenStateReserve(): void {
        COA.getStateReserveSeatInterface.call(this.req.body).then((result)=>{
            this.res.json({
                err: null,
                result: result
            });
        }, (err)=>{
            this.res.json({
                err: err,
                result: null
            });
        });
    }

    

    /**
     * 金額取得
     */
    protected getPrice(args: any): number {
        let reserveSeats = args.reserveSeats;
        let reserveTickets = args.reserveTickets;
        let price = 0;
        for (let seat of reserveSeats.list_tmp_reserve) {
            let ticket = reserveTickets[seat['seat_num']];
            price += ticket.sale_price;
        }
        return price;
    }
}