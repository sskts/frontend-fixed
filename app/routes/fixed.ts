/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as FixedModule from '../modules/Fixed/FixedModule';

const router = express.Router();

// TOP
router.get('/', FixedModule.index);
// 設定
router.get('/setting', FixedModule.setting);
// 利用停止
router.get('/stop', FixedModule.stop);

export default router;
