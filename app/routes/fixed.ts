/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as FixedModule from '../modules/Fixed/FixedModule';
import * as PerformancesModule from '../modules/Purchase/PerformancesModule';

const fixedRouter = express.Router();

// TOP
fixedRouter.get('/', PerformancesModule.index);
fixedRouter.post('/', PerformancesModule.getPerformances);
// 設定
fixedRouter.get('/setting', FixedModule.setting);
// 利用停止
fixedRouter.get('/stop', FixedModule.stop);
// 照会情報取得
fixedRouter.post('/fixed/getInquiryData', FixedModule.getInquiryData);

export default fixedRouter;
