/**
 * ルーティング方法
 */

import * as express from 'express';
import * as MethodModule from '../modules/Method/MethodModule';

const router = express.Router();

//入場方法説明
// router.get('/entry', MethodModule.entry);

//発券方法説明
router.get('/ticketing', MethodModule.ticketing);

export default router;
