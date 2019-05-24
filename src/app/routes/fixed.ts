/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as fixed from '../controllers/fixed/fixed.controller';
import * as schedule from '../controllers/purchase/schedule.controller';

const fixedRouter = express.Router();

// TOP
fixedRouter.get('/', schedule.render);
// 設定
fixedRouter.get('/setting', fixed.settingRender);
// 利用停止
fixedRouter.get('/stop', fixed.stopRender);
// 照会情報取得
fixedRouter.post('/fixed/getInquiryData', fixed.getInquiryData);

export default fixedRouter;
