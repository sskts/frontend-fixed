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
const MVTK = require("@motionpicture/mvtk-service");
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const PurchaseModel_1 = require("../../../../app/models/Purchase/PurchaseModel");
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
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
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
    it('cancelMvtk 正常', () => __awaiter(this, void 0, void 0, function* () {
        const createSeatInfoSyncService = sinon.stub(MVTK, 'createSeatInfoSyncService').returns({
            seatInfoSync: () => {
                return Promise.resolve({
                    zskyykResult: MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS
                });
            }
        });
        const getMvtkSeatInfoSync = sinon.stub(PurchaseModel_1.PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
        const req = {
            session: {
                purchase: {}
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, true);
        createSeatInfoSyncService.restore();
        getMvtkSeatInfoSync.restore();
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
                    seatReservationAuthorization: {},
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
            render: (file, locals, cb) => {
                file = '';
                locals = '';
                cb(null, '');
            },
            json: sinon.spy()
        };
        yield ConfirmModule.purchase(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        assert.strictEqual(res.json.args[0][0].err, null);
        placeOrder.restore();
        place.restore();
    }));
    it('purchase エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
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
            render: () => '',
            json: sinon.spy()
        };
        yield ConfirmModule.purchase(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
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
        assert.notStrictEqual(res.json.args[0][0].result, null);
        assert.strictEqual(res.json.args[0][0].err, null);
    }));
    it('getCompleteData エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                complete: undefined
            },
            __: () => {
                return '';
            }
        };
        const res = {
            json: sinon.spy()
        };
        yield ConfirmModule.getCompleteData(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    }));
});
