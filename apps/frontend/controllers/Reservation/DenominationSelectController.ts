import BaseController from '../BaseController';


export default class DenominationSelectController extends BaseController {
    /**
     * 券種選択
     */
    public index(): void {
        this.res.render('reservation/denominationSelect');
    }

    /**
     * 券種決定
     */
    public denominationSelect(): void {
        this.res.redirect(this.router.build('reservation.denominationSelect', {}));
    }


}
