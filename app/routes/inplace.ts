/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as InplaceModule from '../modules/Inplace/InplaceModule';
import * as PerformancesModule from '../modules/Performances/PerformancesModule';

const router = express.Router();

// TOP
router.get('/', InplaceModule.index);
// 設定
router.get('/setting', InplaceModule.setting);
// 利用停止
router.get('/stop', InplaceModule.stop);
// パフォーマンス一覧
router.get('/performances', PerformancesModule.index);
router.post('/performances', PerformancesModule.getPerformances);

export default router;
