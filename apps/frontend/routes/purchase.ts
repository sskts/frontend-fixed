import express = require('express');
let router = express.Router();


import Transaction = require('../modules/Purchase/TransactionModule');
import Overlap = require('../modules/Purchase/OverlapModule');
import Seat = require('../modules/Purchase/SeatModule');
import Input = require('../modules/Purchase/InputModule');
import Ticket = require('../modules/Purchase/TicketModule');
import Confirm = require('../modules/Purchase/ConfirmModule');
import Complete = require('../modules/Purchase/CompleteModule');
import MvtkInput = require('../modules/Purchase/Mvtk/MvtkInputModule');
import MvtkConfirm = require('../modules/Purchase/Mvtk/MvtkConfirmModule');




//購入(取引開始)
router.get('/:id/transaction', Transaction.Module.start);

//仮予約重複
router.get('/:id/overlap', Overlap.Module.index);

router.post('/overlap/new', Overlap.Module.newReserve);

router.post('/overlap/prev', Overlap.Module.prevReserve);

//座席選択
router.get('/seat/:id/', Seat.Module.index);

router.post('/seat/:id/', Seat.Module.select);

//券種選択
router.get('/ticket', Ticket.Module.index);

router.post('/ticket', Ticket.Module.select);

//購入者情報入力
router.get('/input', Input.Module.index);

router.post('/input', Input.Module.submit);

//購入内容確認
router.get('/confirm', Confirm.Module.index);

router.post('/confirm', Confirm.Module.purchase);

//購入完了
router.get('/complete', Complete.Module.index);


//ムビチケ券入力
router.get('/mvtk', MvtkInput.Module.index);

router.post('/mvtk', MvtkInput.Module.auth);

//ムビチケ券適用確認
router.get('/mvtk/confirm', MvtkConfirm.Module.index);

router.post('/mvtk/confirm', MvtkConfirm.Module.submit);






//座席状態取得
router.post('/getScreenStateReserve', Seat.Module.getScreenStateReserve);











export = router; 
