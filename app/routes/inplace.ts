/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as InplaceModule from '../modules/Inplace/InplaceModule';

const router = express.Router();

// TOP
router.get('/', InplaceModule.index);
// 設定
router.get('/setting', InplaceModule.setting);
// 利用停止
router.get('/stop', InplaceModule.stop);

export default router;
