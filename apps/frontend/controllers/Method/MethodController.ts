import BaseController from '../BaseController';


export default class MethodController extends BaseController {
    
    /**
     * 発券方法ページ表示
     */
    public ticketing(): void {
        return this.res.render('method/ticketing');
    }

    /**
     * 入場方法説明ページ表示
     */
    public entry(): void {
        return this.res.render('method/entry');
    }

    /**
     * ブックマーク方法説明ページ表示
     */
    public bookmark(): void {
        return this.res.render('method/bookmark');
    }

}
