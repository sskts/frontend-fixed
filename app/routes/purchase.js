"use strict";
/**
 * ルーティング購入
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const CompleteModule = require("../modules/Purchase/CompleteModule");
const ConfirmModule = require("../modules/Purchase/ConfirmModule");
const InputModule = require("../modules/Purchase/InputModule");
const MvtkConfirmModule = require("../modules/Purchase/Mvtk/MvtkConfirmModule");
const MvtkInputModule = require("../modules/Purchase/Mvtk/MvtkInputModule");
const OverlapModule = require("../modules/Purchase/OverlapModule");
const PerformancesModule = require("../modules/Purchase/PerformancesModule");
const SeatModule = require("../modules/Purchase/SeatModule");
const TicketModule = require("../modules/Purchase/TicketModule");
const TransactionModule = require("../modules/Purchase/TransactionModule");
const purchaseRouter = express.Router();
if (process.env.VIEW_TYPE === 'fixed'
    || (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // パフォーマンス一覧
    purchaseRouter.get('/performances', PerformancesModule.index);
    purchaseRouter.post('/performances', PerformancesModule.getPerformances);
}
//購入(取引開始)
purchaseRouter.post('/transaction', TransactionModule.start);
//仮予約重複
purchaseRouter.get('/:id/overlap', OverlapModule.index);
purchaseRouter.post('/overlap/new', OverlapModule.newReserve);
purchaseRouter.post('/overlap/prev', OverlapModule.prevReserve);
//座席選択
purchaseRouter.get('/seat/:id/', SeatModule.index);
purchaseRouter.post('/seat/:id/', SeatModule.select);
//券種選択
purchaseRouter.get('/ticket', TicketModule.index);
purchaseRouter.post('/ticket', TicketModule.select);
//購入者情報入力
purchaseRouter.get('/input', InputModule.index);
purchaseRouter.post('/input', InputModule.submit);
//購入内容確認
purchaseRouter.get('/confirm', ConfirmModule.index);
purchaseRouter.post('/confirm', ConfirmModule.purchase);
purchaseRouter.get('/getComplete', ConfirmModule.getCompleteData);
//ムビチケ着券取り消し
purchaseRouter.post('/mvtk/cancel', ConfirmModule.cancelMvtk);
//購入完了
purchaseRouter.get('/complete', CompleteModule.index);
//ムビチケ券入力
purchaseRouter.get('/mvtk', MvtkInputModule.index);
purchaseRouter.post('/mvtk', MvtkInputModule.select);
//ムビチケ券適用確認
purchaseRouter.get('/mvtk/confirm', MvtkConfirmModule.index);
purchaseRouter.post('/mvtk/confirm', MvtkConfirmModule.submit);
//座席状態取得
purchaseRouter.post('/getScreenStateReserve', SeatModule.getScreenStateReserve);
//券種情報をセションへ保存
purchaseRouter.post('/saveSalesTickets', SeatModule.saveSalesTickets);
// パフォーマンス変更
purchaseRouter.post('/performanceChange', SeatModule.performanceChange);
exports.default = purchaseRouter;
