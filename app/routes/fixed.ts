/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as FixedModule from '../modules/Fixed/FixedModule';
import * as PerformancesModule from '../modules/Purchase/PerformancesModule';

const fixedRouter = express.Router();

// TOP
fixedRouter.get('/', PerformancesModule.render);
// 設定
fixedRouter.get('/setting', FixedModule.settingRender);
// 利用停止
fixedRouter.get('/stop', FixedModule.stopRender);
// 照会情報取得
fixedRouter.post('/fixed/getInquiryData', FixedModule.getInquiryData);

export default fixedRouter;
