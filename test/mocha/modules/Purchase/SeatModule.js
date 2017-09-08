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
 * Purchase.SeatModuleテスト
 */
const COA = require("@motionpicture/coa-service");
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const SeatForm = require("../../../../app/forms/Purchase/SeatForm");
const SeatModule = require("../../../../app/modules/Purchase/SeatModule");
describe('Purchase.SeatModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {}
                }
            },
            params: {
                id: ''
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield SeatModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield SeatModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('performanceChange 正常', () => __awaiter(this, void 0, void 0, function* () {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {}
                }
            },
            body: {
                performanceId: ''
            },
            params: {
                id: ''
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield SeatModule.performanceChange(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].err, null);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        event.restore();
    }));
    it('getPerformances エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {
            json: sinon.spy()
        };
        yield SeatModule.performanceChange(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    }));
    it('seatSelect 正常', () => __awaiter(this, void 0, void 0, function* () {
        const seatSelect = sinon.stub(SeatForm, 'seatSelect').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            createSeatReservationAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const salesTicket = sinon.stub(COA.services.reserve, 'salesTicket').returns(Promise.resolve([{
                ticketCode: '',
                ticketName: '',
                ticketNameEng: '',
                ticketNameKana: '',
                stdPrice: '',
                addPrice: '',
                salePrice: ''
            }]));
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    seatReservationAuthorization: {},
                    individualScreeningEvent: {
                        identifier: '',
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: '',
                            titleCode: '',
                            titleBranchNum: '',
                            timeBegin: ''
                        }
                    }
                }
            },
            params: {
                id: ''
            },
            body: {
                transactionId: '',
                seats: JSON.stringify({
                    listTmpReserve: [{
                            seatSection: '',
                            seatNum: ''
                        }]
                })
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield SeatModule.seatSelect(req, res, next);
        assert(res.redirect.calledOnce);
        seatSelect.restore();
        placeOrder.restore();
        salesTicket.restore();
    }));
    it('seatSelect バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const seatSelect = sinon.stub(SeatForm, 'seatSelect').returns({});
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            params: {
                id: ''
            },
            body: {
                transactionId: ''
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield SeatModule.seatSelect(req, res, next);
        assert(res.render.calledOnce);
        seatSelect.restore();
    }));
    it('seatSelect エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield SeatModule.seatSelect(req, res, next);
        assert(next.calledOnce);
    }));
    it('getScreenStateReserve 正常', () => __awaiter(this, void 0, void 0, function* () {
        const seatSelect = sinon.stub(SeatForm, 'screenStateReserve').returns({});
        const stateReserveSeat = sinon.stub(COA.services.reserve, 'stateReserveSeat').returns(Promise.resolve({}));
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            body: {
                theaterCode: '112',
                dateJouei: '',
                titleCode: '',
                titleBranchNum: '',
                timeBegin: '',
                screenCode: '10'
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield SeatModule.getScreenStateReserve(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].err, null);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        seatSelect.restore();
        stateReserveSeat.restore();
    }));
    it('getScreenStateReserve バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const screenStateReserve = sinon.stub(SeatForm, 'screenStateReserve').returns({});
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield SeatModule.getScreenStateReserve(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
        screenStateReserve.restore();
    }));
    it('saveSalesTickets 正常', () => __awaiter(this, void 0, void 0, function* () {
        const salesTickets = sinon.stub(SeatForm, 'salesTickets').returns({});
        const salesTicket = sinon.stub(COA.services.reserve, 'salesTicket').returns(Promise.resolve({}));
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            body: {
                theaterCode: '',
                dateJouei: '',
                titleCode: '',
                titleBranchNum: '',
                timeBegin: '',
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield SeatModule.saveSalesTickets(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].err, null);
        salesTickets.restore();
        salesTicket.restore();
    }));
    it('saveSalesTickets バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const salesTickets = sinon.stub(SeatForm, 'salesTickets').returns({});
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield SeatModule.saveSalesTickets(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].err, null);
        salesTickets.restore();
    }));
});
