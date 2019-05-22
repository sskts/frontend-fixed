"use strict";
/**
 * ルーティング購入
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const complete = require("../controllers/purchase/complete.controller");
const confirm = require("../controllers/purchase/confirm.controller");
const input = require("../controllers/purchase/input.controller");
const mvtkConfirm = require("../controllers/purchase/mvtk/mvtk-confirm.controller");
const mvtkInput = require("../controllers/purchase/mvtk/mvtk-input.controller");
const overlap = require("../controllers/purchase/overlap.controller");
const schedule = require("../controllers/purchase/schedule.controller");
const seat = require("../controllers/purchase/seat.controller");
const ticket = require("../controllers/purchase/ticket.controller");
const transaction = require("../controllers/purchase/transaction.controller");
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
exports.default = purchaseRouter;
