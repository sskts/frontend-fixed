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
 * Purchase.OverlapModuleテスト
 */
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const sinon = require("sinon");
const OverlapModule = require("../../../../app/modules/Purchase/OverlapModule");
describe('Purchase.OverlapModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {
                purchase: {
                    individualScreeningEvent: {}
                }
            },
            params: {
                id: ''
            },
            body: {
                performanceId: ''
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield OverlapModule.render(req, res, next);
        assert(res.render.calledOnce);
        event.restore();
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield OverlapModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('newReserve 正常', () => __awaiter(this, void 0, void 0, function* () {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {
                purchase: {
                    individualScreeningEvent: {},
                    transaction: {
                        id: ''
                    },
                    seatReservationAuthorization: {
                        id: ''
                    }
                }
            },
            params: {
                id: ''
            },
            body: {
                performanceId: ''
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield OverlapModule.newReserve(req, res, next);
        assert(res.redirect.calledOnce);
        placeOrder.restore();
    }));
    it('newReserve エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            params: {
                id: ''
            },
            body: {
                performanceId: ''
            }
        };
        const res = {};
        const next = sinon.spy();
        yield OverlapModule.newReserve(req, res, next);
        assert(next.calledOnce);
    }));
    it('prevReserve 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield OverlapModule.prevReserve(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('prevReserve エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield OverlapModule.prevReserve(req, res, next);
        assert(next.calledOnce);
    }));
});
