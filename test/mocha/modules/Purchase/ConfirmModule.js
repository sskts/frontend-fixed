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
 * Purchase.ConfirmModuleテスト
 */
const mvtkReserve = require("@motionpicture/mvtk-reserve-service");
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const ConfirmModule = require("../../../../app/modules/Purchase/ConfirmModule");
describe('Purchase.ConfirmModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {},
                    profile: {}
                }
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield ConfirmModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー アクセス', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('cancelMvtk 正常', () => __awaiter(this, void 0, void 0, function* () {
        const createSeatInfoSyncService = sinon.stub(mvtkReserve.services.seat.seatInfoSync, 'seatInfoSync').returns(Promise.resolve({
            zskyykResult: mvtkReserve.services.seat.seatInfoSync.ReservationResult.CancelSuccess
        }));
        const req = {
            session: {
                purchase: {
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: '123'
                            }
                        }
                    },
                    reserveTickets: [
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー１' },
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー２' },
                        { mvtkNum: '123', ticketCode: '200', seatCode: 'Ａー３' },
                        { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー４' }
                    ],
                    mvtk: [
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '200' } },
                        { code: '789', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '100' } }
                    ]
                }
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, true);
        createSeatInfoSyncService.restore();
    }));
    it('cancelMvtk エラー 取消失敗', () => __awaiter(this, void 0, void 0, function* () {
        const createSeatInfoSyncService = sinon.stub(mvtkReserve.services.seat.seatInfoSync, 'seatInfoSync').returns(Promise.resolve({
            zskyykResult: mvtkReserve.services.seat.seatInfoSync.ReservationResult.CancelFailure
        }));
        const req = {
            session: {
                purchase: {
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: '123'
                            }
                        }
                    },
                    reserveTickets: [
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー１' },
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー２' },
                        { mvtkNum: '123', ticketCode: '200', seatCode: 'Ａー３' },
                        { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー４' }
                    ],
                    mvtk: [
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '200' } },
                        { code: '789', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '100' } }
                    ]
                }
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, false);
        createSeatInfoSyncService.restore();
    }));
    it('cancelMvtk エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, false);
    }));
    it('purchase 正常', () => __awaiter(this, void 0, void 0, function* () {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            confirm: () => {
                return Promise.resolve({});
            },
            sendEmailNotification: () => {
                return Promise.resolve({});
            }
        });
        const place = sinon.stub(sasaki.service, 'place').returns({
            findMovieTheater: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        },
                        superEvent: {
                            location: {
                                name: {
                                    ja: ''
                                }
                            }
                        }
                    },
                    profile: {},
                    seatReservationAuthorization: {
                        result: {}
                    },
                    reserveTickets: [
                        {
                            mvtkNum: ''
                        }
                    ]
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: {
                host: ''
            }
        };
        const res = {
            locals: {},
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.calledOnce);
        // tslint:disable-next-line:no-console
        console.log('--------------', res);
        assert.strictEqual(res.statusCode, httpStatus.OK);
        placeOrder.restore();
        place.restore();
    }));
    it('purchase 正常 ムビチケ', () => __awaiter(this, void 0, void 0, function* () {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            confirm: () => {
                return Promise.resolve({});
            },
            sendEmailNotification: () => {
                return Promise.resolve({});
            }
        });
        const place = sinon.stub(sasaki.service, 'place').returns({
            findMovieTheater: () => {
                return Promise.resolve({});
            }
        });
        const createSeatInfoSyncService = sinon.stub(mvtkReserve.services.seat.seatInfoSync, 'seatInfoSync').returns(Promise.resolve({
            zskyykResult: mvtkReserve.services.seat.seatInfoSync.ReservationResult.Success
        }));
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: { id: '' },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: '123'
                            }
                        }
                    },
                    reserveTickets: [
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー１' },
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー２' },
                        { mvtkNum: '123', ticketCode: '200', seatCode: 'Ａー３' },
                        { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー４' }
                    ],
                    mvtk: [
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '200' } },
                        { code: '789', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '100' } }
                    ],
                    profile: {}
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: { host: '' }
        };
        const res = {
            locals: {},
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.statusCode, httpStatus.OK);
        placeOrder.restore();
        place.restore();
        createSeatInfoSyncService.restore();
    }));
    it('purchase エラー ムビチケ', () => __awaiter(this, void 0, void 0, function* () {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            confirm: () => {
                return Promise.resolve({});
            },
            sendEmailNotification: () => {
                return Promise.resolve({});
            }
        });
        const place = sinon.stub(sasaki.service, 'place').returns({
            findMovieTheater: () => {
                return Promise.resolve({});
            }
        });
        const createSeatInfoSyncService = sinon.stub(mvtkReserve.services.seat.seatInfoSync, 'seatInfoSync').returns(Promise.resolve({
            zskyykResult: mvtkReserve.services.seat.seatInfoSync.ReservationResult.FailureOther
        }));
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: { id: '' },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: '123'
                            }
                        }
                    },
                    reserveTickets: [
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー１' },
                        { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー２' },
                        { mvtkNum: '123', ticketCode: '200', seatCode: 'Ａー３' },
                        { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー４' }
                    ],
                    mvtk: [
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                        { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '200' } },
                        { code: '789', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '100' } }
                    ],
                    profile: {}
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: { host: '' }
        };
        const res = {
            locals: {},
            render: () => '',
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
        placeOrder.restore();
        place.restore();
        createSeatInfoSyncService.restore();
    }));
    it('purchase エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
    }));
    it('purchase エラー プロパティ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {}
            },
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
    }));
    it('purchase エラー アクセス', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    transaction: {
                        id: '123'
                    },
                    individualScreeningEvent: {},
                    profile: {},
                    seatReservationAuthorization: {
                        result: {}
                    }
                }
            },
            body: {
                transactionId: '456'
            },
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
    }));
    it('purchase エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {},
                    profile: {},
                    seatReservationAuthorization: {
                        result: {}
                    },
                    expired: moment().subtract(1, 'hours')
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
    }));
    it('getCompleteData 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                complete: {}
            }
        };
        const res = {
            json: sinon.spy()
        };
        yield ConfirmModule.getCompleteData(req, res);
        assert(res.json.calledOnce);
        assert(res.json.args[0][0].result);
        assert.strictEqual(res.statusCode, httpStatus.OK);
    }));
    it('getCompleteData エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.getCompleteData(req, res);
        assert(res.json.calledOnce);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
    }));
    it('getCompleteData エラー completeセッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                complete: undefined
            },
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: httpStatus.OK
        };
        yield ConfirmModule.getCompleteData(req, res);
        assert(res.json.calledOnce);
        assert(res.json.args[0][0].error);
        assert.notStrictEqual(res.statusCode, httpStatus.OK);
    }));
});
