/**
 * ルーティング方法
 */

import * as express from 'express';
import { ticketing } from '../controllers/method/method.controller';

const methodRouter = express.Router();

//入場方法説明
// methodRuter.get('/entry', MethodModule.entry);

//発券方法説明
methodRouter.get('/ticketing', ticketing);

export default methodRouter;
