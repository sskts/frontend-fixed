"use strict";
const express = require("express");
const router = express.Router();
const CompleteModule_1 = require("../modules/Purchase/CompleteModule");
const ConfirmModule_1 = require("../modules/Purchase/ConfirmModule");
const InputModule_1 = require("../modules/Purchase/InputModule");
const MvtkConfirmModule_1 = require("../modules/Purchase/Mvtk/MvtkConfirmModule");
const MvtkInputModule_1 = require("../modules/Purchase/Mvtk/MvtkInputModule");
const OverlapModule_1 = require("../modules/Purchase/OverlapModule");
const SeatModule_1 = require("../modules/Purchase/SeatModule");
const TicketModule_1 = require("../modules/Purchase/TicketModule");
const TransactionModule_1 = require("../modules/Purchase/TransactionModule");
/**
 * ルーティング購入
 */
//購入(取引開始)
router.get('/:id/transaction', TransactionModule_1.default.start);
//仮予約重複
router.get('/:id/overlap', OverlapModule_1.default.index);
router.post('/overlap/new', OverlapModule_1.default.newReserve);
router.post('/overlap/prev', OverlapModule_1.default.prevReserve);
//座席選択
router.get('/seat/:id/', SeatModule_1.default.index);
router.post('/seat/:id/', SeatModule_1.default.select);
//券種選択
router.get('/ticket', TicketModule_1.default.index);
router.post('/ticket', TicketModule_1.default.select);
//購入者情報入力
router.get('/input', InputModule_1.default.index);
router.post('/input', InputModule_1.default.submit);
//購入内容確認
router.get('/confirm', ConfirmModule_1.default.index);
router.post('/confirm', ConfirmModule_1.default.purchase);
//購入完了
router.get('/complete', CompleteModule_1.default.index);
//ムビチケ券入力
router.get('/mvtk', MvtkInputModule_1.default.index);
router.post('/mvtk', MvtkInputModule_1.default.auth);
//ムビチケ券適用確認
router.get('/mvtk/confirm', MvtkConfirmModule_1.default.index);
router.post('/mvtk/confirm', MvtkConfirmModule_1.default.submit);
//座席状態取得
router.post('/getScreenStateReserve', SeatModule_1.default.getScreenStateReserve);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
