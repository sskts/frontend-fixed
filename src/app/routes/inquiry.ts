/**
 * ルーティング照会
 */

import * as express from 'express';
import { confirmRender, inquiryAuth, loginRender } from '../controllers/inquiry/inquiry.controller';

const inquiryRouter = express.Router();

//チケット照会ログイン
inquiryRouter.get('/login', loginRender);

//チケット照会ログイン（認証）
inquiryRouter.post('/login', inquiryAuth);

//チケット照会
inquiryRouter.get('/:orderNumber/', confirmRender);

export default inquiryRouter;
