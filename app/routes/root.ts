/**
 * ルーティングRoot
 */

import * as express from 'express';
import * as ScreenModule from '../modules/Screen/ScreenModule';
const rootRouter = express.Router();

if (process.env.VIEW_TYPE === undefined
&& (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // index
    rootRouter.get('/', (_, res) => { res.redirect('/purchase/performances'); });
    // 再起動
    rootRouter.get('/500', () => { process.exit(1); });
    // スクリーンテスト
    rootRouter.get('/screen', ScreenModule.index);
    rootRouter.post('/screen', ScreenModule.getScreenStateReserve);
}

export default rootRouter;
