/**
 * ルーティングRoot
 */

import * as express from 'express';
import * as PerformancesModule from '../modules/Performances/PerformancesModule';
import * as ScreenModule from '../modules/Screen/ScreenModule';
const router = express.Router();

if (process.env.VIEW_TYPE === undefined
&& (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // index
    router.get('/', (_, res) => { res.redirect('/performances'); });
    // 再起動
    router.get('/500', () => { process.exit(1); });
    // スクリーンテスト
    router.get('/screen', ScreenModule.index);
    router.post('/screen', ScreenModule.getScreenStateReserve);

    // パフォーマンス一覧
    router.get('/performances', PerformancesModule.index);
    router.post('/performances', PerformancesModule.getPerformances);
}

export default router;
