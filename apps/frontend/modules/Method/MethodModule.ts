
import * as express from 'express';

/**
 * 方法
 * @namespace
 */
namespace MethodModule {
    /**
     * 発券方法ページ表示
     * @function
     */
    // tslint:disable-next-line:variable-name
    export function ticketing(_req: express.Request, res: express.Response, _next: express.NextFunction): void {
        return res.render('method/ticketing');
    }

    /**
     * 入場方法説明ページ表示
     * @function
     */
    // tslint:disable-next-line:variable-name
    export function entry(_req: express.Request, res: express.Response, _next: express.NextFunction): void {
        return res.render('method/entry');
    }

    /**
     * ブックマーク方法説明ページ表示
     * @function
     */
    // tslint:disable-next-line:variable-name
    export function bookmark(_req: express.Request, res: express.Response, _next: express.NextFunction): void {
        return res.render('method/bookmark');
    }
}

export default MethodModule;
