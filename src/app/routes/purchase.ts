/**
 * ルーティング購入
 */

import * as express from 'express';
import * as complete from '../controllers/purchase/complete.controller';
import * as confirm from '../controllers/purchase/confirm.controller';
import * as input from '../controllers/purchase/input.controller';
import * as mvtkConfirm from '../controllers/purchase/mvtk/mvtk-confirm.controller';
import * as mvtkInput from '../controllers/purchase/mvtk/mvtk-input.controller';
import * as overlap from '../controllers/purchase/overlap.controller';
import * as schedule from '../controllers/purchase/schedule.controller';
import * as seat from '../controllers/purchase/seat.controller';
import * as ticket from '../controllers/purchase/ticket.controller';
import * as transaction from '../controllers/purchase/transaction.controller';
const purchaseRouter = express.Router();
// パフォーマンス一覧
purchaseRouter.get('/performances', schedule.render);
// パフォーマンス一覧
purchaseRouter.get('/performances/getPerformances', schedule.getPerformances);
purchaseRouter.get('/performances/getMovieTheaters', schedule.getMovieTheaters);

//購入(取引開始)
purchaseRouter.get('/transaction', transaction.start);

//仮予約重複
purchaseRouter.get('/:id/overlap', overlap.render);
purchaseRouter.post('/overlap/new', overlap.newReserve);
purchaseRouter.post('/overlap/prev', overlap.prevReserve);

//座席選択
purchaseRouter.get('/seat/:id/', seat.render);
purchaseRouter.post('/seat/:id/', seat.seatSelect);

//券種選択
purchaseRouter.get('/ticket', ticket.render);
purchaseRouter.post('/ticket', ticket.ticketSelect);

//購入者情報入力
purchaseRouter.get('/input', input.render);
purchaseRouter.post('/input', input.purchaserInformationRegistration);

//購入内容確認
purchaseRouter.get('/confirm', confirm.render);
purchaseRouter.post('/confirm', confirm.purchase);
purchaseRouter.get('/getComplete', confirm.getCompleteData);

//ムビチケ着券取り消し
purchaseRouter.post('/mvtk/cancel', confirm.cancelMvtk);

//購入完了
purchaseRouter.get('/complete', complete.render);

//ムビチケ券入力
purchaseRouter.get('/mvtk', mvtkInput.render);
purchaseRouter.post('/mvtk', mvtkInput.auth);

//ムビチケ券適用確認
purchaseRouter.get('/mvtk/confirm', mvtkConfirm.render);
purchaseRouter.post('/mvtk/confirm', mvtkConfirm.submit);

//座席状態取得
purchaseRouter.post('/getScreenStateReserve', seat.getScreenStateReserve);

//券種情報をセションへ保存
purchaseRouter.post('/saveSalesTickets', seat.saveSalesTickets);

// パフォーマンス変更
purchaseRouter.get('/performanceChange', seat.performanceChange);

export default purchaseRouter;
