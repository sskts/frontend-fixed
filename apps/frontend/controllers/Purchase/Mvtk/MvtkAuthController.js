"use strict";
const MvtkController_1 = require('./MvtkController');
class MvtkAuthController extends MvtkController_1.default {
    /**
     * ムビチケ券認証ページ表示
     */
    index() {
        if (this.checkSession('performance')
            && this.checkSession('purchaseSeats')) {
            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            this.res.render('purchase/mvtk/auth');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * 適用
     */
    submit() {
        this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkAuthController;
