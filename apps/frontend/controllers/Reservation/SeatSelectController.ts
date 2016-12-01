import BaseController from '../BaseController';


export default class SeatSelectController extends BaseController {
    /**
     * 座席選択
     */
    public index(): void {
        this.res.render('reservation/seatSelect');
    }

    /**
     * 座席決定
     */
    public seatSelect(): void {
        this.res.redirect(this.router.build('reservation.denominationSelect', {}));
    }


}
