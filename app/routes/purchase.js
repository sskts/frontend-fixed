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
const SeatModule = require("../modules/Purchase/SeatModule");
const TicketModule = require("../modules/Purchase/TicketModule");
const TransactionModule = require("../modules/Purchase/TransactionModule");
const router = express.Router();
//購入(取引開始)
router.post('/transaction', TransactionModule.start);
//仮予約重複
router.get('/:id/overlap', OverlapModule.index);
router.post('/overlap/new', OverlapModule.newReserve);
router.post('/overlap/prev', OverlapModule.prevReserve);
//座席選択
router.get('/seat/:id/', SeatModule.index);
router.post('/seat/:id/', SeatModule.select);
//券種選択
router.get('/ticket', TicketModule.index);
router.post('/ticket', TicketModule.select);
//購入者情報入力
router.get('/input', InputModule.index);
router.post('/input', InputModule.submit);
//購入内容確認
router.get('/confirm', ConfirmModule.index);
router.post('/confirm', ConfirmModule.purchase);
router.get('/getComplete', ConfirmModule.getCompleteData);
//ムビチケ着券取り消し
router.post('/mvtk/cancel', ConfirmModule.cancelMvtk);
//購入完了
router.get('/complete', CompleteModule.index);
//ムビチケ券入力
router.get('/mvtk', MvtkInputModule.index);
router.post('/mvtk', MvtkInputModule.select);
//ムビチケ券適用確認
router.get('/mvtk/confirm', MvtkConfirmModule.index);
router.post('/mvtk/confirm', MvtkConfirmModule.submit);
//座席状態取得
router.post('/getScreenStateReserve', SeatModule.getScreenStateReserve);
exports.default = router;
