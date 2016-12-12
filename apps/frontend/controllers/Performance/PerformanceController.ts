import BaseController from '../BaseController';


export default class PerformanceController extends BaseController {

    /**
     * 購入者情報入力完了
     */
    public index(): void {
        this.res.render('performance');
    }

}
