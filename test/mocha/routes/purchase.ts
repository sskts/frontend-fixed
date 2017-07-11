// /**
//  * routesテスト
//  *
//  * @ignore
//  */
// // tslint:disable:no-backbone-get-set-outside-model
// import * as assert from 'assert';
// import * as httpStatus from 'http-status';
// import * as supertest from 'supertest';
// import * as app from '../../../app/app';
// import * as normalDAta from '../data/normalData';

// describe('POST /transaction', () => {
//     it('start id なし', async () => {
//         await supertest(app)
//             .post('/purchase/transaction')
//             .expect(httpStatus.OK);
//     });
// });

// describe('POST /:id/overlap', () => {
//     it('index 適切でないid', async () => {
//         await supertest(app)
//             .post('/purchase/00000000000000000000000/overlap')
//             .expect(httpStatus.NOT_FOUND);
//     });
// });

// describe('POST /overlap/new', () => {
//     it('newReserve 適切でないsession', async () => {
//         await supertest(app)
//             .post('/purchase/overlap/new')
//             .send({
//                 session: {
//                     expired: 9999999999,
//                     transactionMP: null,
//                     reserveSeats: null,
//                     authorizationCOA: null,
//                     performanceCOA: null
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /overlap/prev', () => {
//     it('newReserve 正常', async () => {
//         await supertest(app)
//             .post('/purchase/overlap/prev')
//             .expect(httpStatus.FOUND);
//     });
// });

// describe('GET /seat/:id/', () => {
//     it('index 取引Id なし', async () => {
//         await supertest(app)
//             .get('/purchase/seat/00000000000000000000000')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /seat/:id/', () => {
//     it('select session.purchase なし', async () => {
//         await supertest(app)
//             .post('/purchase/seat/00000000000000000000000')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select 取引Id なし', async () => {
//         await supertest(app)
//             .post('/purchase/seat/00000000000000000000000')
//             .send({
//                 session: {
//                     purchase: {}
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select 取引Id認証失敗', async () => {
//         await supertest(app)
//             .post('/purchase/seat/00000000000000000000000')
//             .send({
//                 session: {
//                     purchase: {
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('GET /ticket', () => {
//     it('index session.purchase なし', async () => {
//         await supertest(app)
//             .get('/purchase/ticket')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.performance なし', async () => {
//         await supertest(app)
//             .get('/purchase/ticket')
//             .query({
//                 session: {
//                     purchase: {
//                         expired: 9999999999,
//                         reserveSeats: normalDAta.reserveSeats,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.transactionMP なし', async () => {
//         await supertest(app)
//             .get('/purchase/ticket')
//             .query({
//                 session: {
//                     purchase: {
//                         expired: 9999999999,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.reserveSeats なし', async () => {
//         await supertest(app)
//             .get('/purchase/ticket')
//             .query({
//                 session: {
//                     purchase: {
//                         expired: 9999999999,
//                         performance: normalDAta.performance,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /ticket/', () => {
//     it('select session.purchase なし', async () => {
//         await supertest(app)
//             .post('/purchase/ticket')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select 取引Id認証失敗', async () => {
//         await supertest(app)
//             .post('/purchase/ticket')
//             .send({
//                 session: {
//                     purchase: {
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         performance: normalDAta.performance,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.transactionMP なし', async () => {
//         await supertest(app)
//             .post('/purchase/ticket')
//             .send({
//                 session: {
//                     purchase: {
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         performance: normalDAta.performance
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.performance なし', async () => {
//         await supertest(app)
//             .post('/purchase/ticket')
//             .send({
//                 session: {
//                     purchase: {
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.reserveSeats なし', async () => {
//         await supertest(app)
//             .post('/purchase/ticket')
//             .send({
//                 session: {
//                     purchase: {
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('GET /input', () => {
//     it('index session.purchase なし', async () => {
//         await supertest(app)
//             .get('/purchase/input')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.performance なし', async () => {
//         await supertest(app)
//             .get('/purchase/input')
//             .query({
//                 session: {
//                     purchase: {
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.transactionMP なし', async () => {
//         await supertest(app)
//             .get('/purchase/input')
//             .query({
//                 session: {
//                     purchase: {
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         performance: normalDAta.performance
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.reserveSeats なし', async () => {
//         await supertest(app)
//             .get('/purchase/input')
//             .query({
//                 session: {
//                     purchase: {
//                         reserveTickets: normalDAta.reserveTickets,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.reserveTickets', async () => {
//         await supertest(app)
//             .get('/purchase/input')
//             .query({
//                 session: {
//                     purchase: {
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /input/', () => {

//     it('select session.purchase なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select 取引Id認証失敗', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.transactionMP なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         performance: normalDAta.performance
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.performance なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.theater なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         performance: normalDAta.performance,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.reserveSeats なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select session.purchase.reserveTickets なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('select 未入力', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         performanceCOA: normalDAta.performanceCOA,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '12345678',
//                 last_name_hira: '',
//                 first_name_hira: '',
//                 mail_addr: '',
//                 mail_confirm: '',
//                 tel_num: ''
//             })
//             .expect(httpStatus.OK);
//     });

//     it('select 数字入力', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         performanceCOA: normalDAta.performanceCOA,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '12345678',
//                 last_name_hira: 11111111111,
//                 first_name_hira: 11111111111,
//                 mail_addr: 11111111111,
//                 mail_confirm: 11111111111,
//                 tel_num: 11111111111
//             })
//             .expect(httpStatus.OK);
//     });

//     it('select アドレス違い', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .send({
//                 session: {
//                     purchase: {
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         performanceCOA: normalDAta.performanceCOA,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '12345678',
//                 last_name_hira: 'てすと',
//                 first_name_hira: 'てすと',
//                 mail_addr: 'test@test.jp',
//                 mail_confirm: 'test2@test.jp',
//                 tel_num: '09012345678'
//             })
//             .expect(httpStatus.OK);
//     });

// });

// describe('GET /confirm', () => {
//     it('index session.purchase なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.performance なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .query({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.transactionMP なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .query({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         performance: normalDAta.performance
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.reserveSeats なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .query({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         reserveTickets: normalDAta.reserveTickets,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.reserveTickets なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .query({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.purchase.input なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .query({
//                 session: {
//                     purchase: {
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: normalDAta.transaction
//                     }
//                 }
//             })
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /confirm/', () => {

//     it('select session.purchase なし', async () => {
//         const response = await supertest(app)
//             .post('/purchase/confirm')
//             .expect(httpStatus.OK);
//         assert(!response.body.result);
//     });

//     it('select 取引Id認証失敗', async () => {
//         const response = await supertest(app)
//             .post('/purchase/confirm')
//             .send({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.OK);
//         assert(!response.body.result);
//     });

//     it('select session.purchase.transactionMP なし', async () => {
//         const response = await supertest(app)
//             .post('/purchase/confirm')
//             .send({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         expired: 9999999999,
//                         performance: normalDAta.performance
//                     }
//                 },
//                 transaction_id: '02345678'
//             })
//             .expect(httpStatus.OK);
//         assert(!response.body.result);
//     });

//     it('select session.purchase.expired なし', async () => {
//         const response = await supertest(app)
//             .post('/purchase/confirm')
//             .send({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '12345678'
//             })
//             .expect(httpStatus.OK);
//         assert(!response.body.result);
//     });

//     it('select 有効期限切れ', async () => {
//         const response = await supertest(app)
//             .post('/purchase/confirm')
//             .send({
//                 session: {
//                     purchase: {
//                         input: normalDAta.input,
//                         theater: normalDAta.theater,
//                         reserveTickets: normalDAta.reserveTickets,
//                         reserveSeats: normalDAta.reserveSeats,
//                         performance: normalDAta.performance,
//                         expired: 9999999999,
//                         transactionMP: {
//                             id: '12345678'
//                         }
//                     }
//                 },
//                 transaction_id: '12345678'
//             })
//             .expect(httpStatus.OK);
//         assert(!response.body.result);
//     });

// });

// describe('GET /complete/', () => {

//     it('index session.complete なし', async () => {
//         await supertest(app)
//             .get('/purchase/complete')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.complete なし', async () => {
//         await supertest(app)
//             .get('/purchase/complete')
//             .expect(httpStatus.BAD_REQUEST);
//     });

// });
