import BaseController from '../BaseController';


export default class MethodController extends BaseController {
    
    /**
     * 発券方法ページ表示
     */
    public ticketing(): void {
        this.res.render('method/ticketing');
    }

}
