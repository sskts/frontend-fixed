/**
 * ルーティングスクリーン
 */

import * as express from 'express';
import * as ScreenModule from '../modules/Screen/ScreenModule';

const screenRouter = express.Router();

//スクリーン表示
screenRouter.get('', ScreenModule.index);

//スクリーンHTML取得
screenRouter.get('/getHtml', ScreenModule.getScreenHtml);

export default screenRouter;
