/**
 * ルーティングスクリーン
 */

import * as express from 'express';
import { getScreenHtml, index } from '../controllers/screen/screen.controller';

const screenRouter = express.Router();

//スクリーン表示
screenRouter.get('', index);

//スクリーンHTML取得
screenRouter.get('/getHtml', getScreenHtml);

export default screenRouter;
