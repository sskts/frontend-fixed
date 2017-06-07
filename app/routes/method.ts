/**
 * ルーティング方法
 */

import * as express from 'express';
import * as MethodModule from '../modules/Method/MethodModule';

const methodRouter = express.Router();

//入場方法説明
// methodRuter.get('/entry', MethodModule.entry);

//発券方法説明
methodRouter.get('/ticketing', MethodModule.ticketing);

export default methodRouter;
