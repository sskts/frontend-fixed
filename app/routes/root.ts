/**
 * ルーティングRoot
 */

import * as express from 'express';
import * as SignInModule from '../modules/Auth/SignInModule';
import * as ScreenModule from '../modules/Screen/ScreenModule';
import * as UtilModule from '../modules/Util/UtilModule';
const rootRouter = express.Router();

if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed) {
    rootRouter.get('/signIn', SignInModule.index);
}

if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed
    && (process.env.NODE_ENV === UtilModule.ENV.Development || process.env.NODE_ENV === UtilModule.ENV.Test)) {
    // index
    rootRouter.get('/', (_, res) => { res.redirect('/purchase/performances'); });
    // 再起動
    rootRouter.get('/500', () => { process.exit(1); });
    // スクリーンテスト
    rootRouter.get('/screen', ScreenModule.index);
    rootRouter.post('/screen', ScreenModule.getScreenStateReserve);
}

export default rootRouter;
