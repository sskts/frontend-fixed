"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routesテスト
 *
 * @ignore
 */
// tslint:disable:no-backbone-get-set-outside-model
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../../../apps/frontend/app");
const normalDAta = require("../data/normalData");
describe('POST /transaction', () => {
    it('start id なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/transaction')
            .expect(httpStatus.OK);
    }));
});
describe('POST /:id/overlap', () => {
    it('index 適切でないid', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/00000000000000000000000/overlap')
            .expect(httpStatus.NOT_FOUND);
    }));
});
describe('POST /overlap/new', () => {
    it('newReserve 適切でないsession', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/overlap/new')
            .send({
            session: {
                transactionMP: null,
                reserveSeats: null,
                authorizationCOA: null,
                performanceCOA: null
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('POST /overlap/prev', () => {
    it('newReserve 正常', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/overlap/prev')
            .expect(httpStatus.FOUND);
    }));
});
describe('GET /seat/:id/', () => {
    it('index 取引Id なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/seat/00000000000000000000000')
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('POST /seat/:id/', () => {
    it('select session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/seat/00000000000000000000000')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select 取引Id なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/seat/00000000000000000000000')
            .send({
            session: {
                purchase: {}
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select 取引Id認証失敗', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/seat/00000000000000000000000')
            .send({
            session: {
                purchase: {
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('GET /ticket', () => {
    it('index session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/ticket')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.performance なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/ticket')
            .query({
            session: {
                purchase: {
                    reserveSeats: normalDAta.reserveSeats,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.transactionMP なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/ticket')
            .query({
            session: {
                purchase: {
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.reserveSeats なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/ticket')
            .query({
            session: {
                purchase: {
                    performance: normalDAta.performance,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('POST /ticket/', () => {
    it('select session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/ticket')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select 取引Id認証失敗', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/ticket')
            .send({
            session: {
                purchase: {
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.transactionMP なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/ticket')
            .send({
            session: {
                purchase: {
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.performance なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/ticket')
            .send({
            session: {
                purchase: {
                    reserveSeats: normalDAta.reserveSeats,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.reserveSeats なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/ticket')
            .send({
            session: {
                purchase: {
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('GET /input', () => {
    it('index session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/input')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.performance なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/input')
            .query({
            session: {
                purchase: {
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.transactionMP なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/input')
            .query({
            session: {
                purchase: {
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.reserveSeats なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/input')
            .query({
            session: {
                purchase: {
                    reserveTickets: normalDAta.reserveTickets,
                    performance: normalDAta.performance,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.reserveTickets', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/input')
            .query({
            session: {
                purchase: {
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('POST /input/', () => {
    it('select session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select 取引Id認証失敗', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.transactionMP なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.performance なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.theater なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    performance: normalDAta.performance,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.reserveSeats なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select session.purchase.reserveTickets なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('select 未入力', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '12345678',
            last_name_hira: '',
            first_name_hira: '',
            mail_addr: '',
            mail_confirm: '',
            tel_num: ''
        })
            .expect(httpStatus.OK);
    }));
    it('select 数字入力', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '12345678',
            last_name_hira: 11111111111,
            first_name_hira: 11111111111,
            mail_addr: 11111111111,
            mail_confirm: 11111111111,
            tel_num: 11111111111
        })
            .expect(httpStatus.OK);
    }));
    it('select アドレス違い', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/input')
            .send({
            session: {
                purchase: {
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '12345678',
            last_name_hira: 'てすと',
            first_name_hira: 'てすと',
            mail_addr: 'test@test.jp',
            mail_confirm: 'test2@test.jp',
            tel_num: '09012345678'
        })
            .expect(httpStatus.OK);
    }));
});
describe('GET /confirm', () => {
    it('index session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/confirm')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.performance なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/confirm')
            .query({
            session: {
                purchase: {
                    input: normalDAta.input,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.transactionMP なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/confirm')
            .query({
            session: {
                purchase: {
                    input: normalDAta.input,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.reserveSeats なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/confirm')
            .query({
            session: {
                purchase: {
                    input: normalDAta.input,
                    reserveTickets: normalDAta.reserveTickets,
                    performance: normalDAta.performance,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.reserveTickets なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/confirm')
            .query({
            session: {
                purchase: {
                    input: normalDAta.input,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.purchase.input なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/confirm')
            .query({
            session: {
                purchase: {
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: normalDAta.transaction
                }
            }
        })
            .expect(httpStatus.BAD_REQUEST);
    }));
});
describe('POST /confirm/', () => {
    it('select session.purchase なし', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield supertest(app)
            .post('/purchase/confirm')
            .expect(httpStatus.OK);
        assert(!response.body.result);
    }));
    it('select 取引Id認証失敗', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield supertest(app)
            .post('/purchase/confirm')
            .send({
            session: {
                purchase: {
                    input: normalDAta.input,
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.OK);
        assert(!response.body.result);
    }));
    it('select session.purchase.transactionMP なし', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield supertest(app)
            .post('/purchase/confirm')
            .send({
            session: {
                purchase: {
                    input: normalDAta.input,
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    expired: 1490782702,
                    performance: normalDAta.performance
                }
            },
            transaction_id: '02345678'
        })
            .expect(httpStatus.OK);
        assert(!response.body.result);
    }));
    it('select session.purchase.expired なし', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield supertest(app)
            .post('/purchase/confirm')
            .send({
            session: {
                purchase: {
                    input: normalDAta.input,
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    expired: 1490782702,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '12345678'
        })
            .expect(httpStatus.OK);
        assert(!response.body.result);
    }));
    it('select 有効期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield supertest(app)
            .post('/purchase/confirm')
            .send({
            session: {
                purchase: {
                    input: normalDAta.input,
                    theater: normalDAta.theater,
                    reserveTickets: normalDAta.reserveTickets,
                    reserveSeats: normalDAta.reserveSeats,
                    performance: normalDAta.performance,
                    expired: 1490782702,
                    transactionMP: {
                        id: '12345678'
                    }
                }
            },
            transaction_id: '12345678'
        })
            .expect(httpStatus.OK);
        assert(!response.body.result);
    }));
});
describe('GET /complete/', () => {
    it('index session.complete なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/complete')
            .expect(httpStatus.BAD_REQUEST);
    }));
    it('index session.complete なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/complete')
            .expect(httpStatus.BAD_REQUEST);
    }));
});
