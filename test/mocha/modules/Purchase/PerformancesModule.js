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
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const HTTPStatus = require("http-status");
const sinon = require("sinon");
const PerformancesModule = require("../../../../app/modules/Purchase/PerformancesModule");
describe('Purchase.PerformancesModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {
                purchase: {
                    transaction: {
                        id: ''
                    },
                    seatReservationAuthorization: {
                        id: ''
                    }
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
        yield PerformancesModule.render(req, res, next);
        assert(res.render.calledOnce);
        placeOrder.restore();
        organization.restore();
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield PerformancesModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('getPerformances 正常', () => __awaiter(this, void 0, void 0, function* () {
        const event = sinon.stub(sasaki.service, 'event').returns({
            searchIndividualScreeningEvent: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {},
            query: {
                theater: '',
                day: ''
            }
        };
        const res = {
            locals: {},
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: HTTPStatus.OK
        };
        yield PerformancesModule.getPerformances(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.statusCode, HTTPStatus.OK);
        event.restore();
    }));
    it('getPerformances エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            query: {}
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: HTTPStatus.OK
        };
        yield PerformancesModule.getPerformances(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.statusCode, HTTPStatus.OK);
    }));
    it('getMovieTheaters 正常', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return Promise.resolve({});
            }
        });
        const req = {
            session: {},
            query: {}
        };
        const res = {
            locals: {},
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: HTTPStatus.OK
        };
        yield PerformancesModule.getMovieTheaters(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.statusCode, HTTPStatus.OK);
        organization.restore();
    }));
    it('getMovieTheaters エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            query: {}
        };
        const res = {
            json: sinon.spy(),
            status: (code) => {
                res.statusCode = code;
            },
            statusCode: HTTPStatus.OK
        };
        yield PerformancesModule.getMovieTheaters(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.statusCode, HTTPStatus.OK);
    }));
});
