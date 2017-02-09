import express = require('express');
let router = express.Router();


import TransactionModule from '../modules/Purchase/TransactionModule';
import OverlapModule from '../modules/Purchase/OverlapModule';
import SeatModule from '../modules/Purchase/SeatModule';
import InputModule from '../modules/Purchase/InputModule';
import TicketModule from '../modules/Purchase/TicketModule';
import ConfirmModule from '../modules/Purchase/ConfirmModule';
import CompleteModule from '../modules/Purchase/CompleteModule';
import MvtkInputModule from '../modules/Purchase/Mvtk/MvtkInputModule';
import MvtkConfirmModule from '../modules/Purchase/Mvtk/MvtkConfirmModule';




//購入(取引開始)
router.get('/:id/transaction', TransactionModule.start);

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

//購入完了
router.get('/complete', CompleteModule.index);


//ムビチケ券入力
router.get('/mvtk', MvtkInputModule.index);

router.post('/mvtk', MvtkInputModule.auth);

//ムビチケ券適用確認
router.get('/mvtk/confirm', MvtkConfirmModule.index);

router.post('/mvtk/confirm', MvtkConfirmModule.submit);






//座席状態取得
router.post('/getScreenStateReserve', SeatModule.getScreenStateReserve);











export default router; 
