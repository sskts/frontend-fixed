/**
 * ルーティング券売機
 */

import * as express from 'express';
import * as FixedModule from '../modules/Fixed/FixedModule';

const fixedRouter = express.Router();

// TOP
fixedRouter.get('/', FixedModule.index);
// 設定
fixedRouter.get('/setting', FixedModule.setting);
// 利用停止
fixedRouter.get('/stop', FixedModule.stop);
// 照会情報取得
fixedRouter.post('/fixed/getInquiryData', FixedModule.getInquiryData);

export default fixedRouter;
