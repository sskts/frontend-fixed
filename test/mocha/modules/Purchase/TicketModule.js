"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Purchase.TicketModuleテスト
 */
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const TicketForm = require("../../../../app/forms/Purchase/TicketForm");
const PurchaseModel_1 = require("../../../../app/models/Purchase/PurchaseModel");
const TicketModule = require("../../../../app/modules/Purchase/TicketModule");
describe('Purchase.TicketModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    individualScreeningEvent: {},
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
        yield TicketModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    // tslint:disable-next-line:max-func-body-length
    it('ticketSelect 正常', () => __awaiter(this, void 0, void 0, function* () {
        const getMvtkSeatInfoSync = sinon.stub(PurchaseModel_1.PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
        const ticketForm = sinon.stub(TicketForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            createSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            cancelMvtkAuthorization: () => {
                return Promise.resolve({});
            },
            createMvtkAuthorization: () => {
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
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {
                        id: ''
                    },
                    mvtkAuthorization: {
                        id: ''
                    },
                    salesTickets: [
                        {
                            ticketCode: '',
                            limitUnit: '001',
                            limitCount: 1
                        }
                    ],
                    mvtk: [
                        {
                            code: '1',
                            ticket: {
                                ticketCode: '',
                                ticketName: '',
                                ticketNameEng: '',
                                ticketNameKana: '',
                                addPrice: 0,
                                addPriceGlasses: 0
                            },
                            ykknInfo: {
                                kijUnip: '0',
                                eishhshkTyp: '0',
                                dnshKmTyp: '',
                                znkkkytsknGkjknTyp: '',
                                ykknshTyp: '',
                                knshknhmbiUnip: '0'
                            }
                        }
                    ]
                }
            },
            body: {
                transactionId: '',
                reserveTickets: JSON.stringify([
                    {
                        mvtkNum: '1',
                        section: '',
                        ticketCode: '',
                        glasses: false,
                        ticketName: ''
                    },
                    {
                        mvtkNum: '',
                        section: '',
                        ticketCode: '',
                        glasses: false,
                        ticketName: ''
                    }
                ])
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
        yield TicketModule.ticketSelect(req, res, next);
        assert(res.redirect.calledOnce);
        ticketForm.restore();
        placeOrder.restore();
        getMvtkSeatInfoSync.restore();
    }));
    it('ticketSelect 制限単位バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const getMvtkSeatInfoSync = sinon.stub(PurchaseModel_1.PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
        const ticketForm = sinon.stub(TicketForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            createSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            cancelSeatReservationAuthorization: () => {
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
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {
                        id: ''
                    },
                    mvtkAuthorization: {
                        id: ''
                    },
                    salesTickets: [
                        {
                            ticketCode: '',
                            limitUnit: '001',
                            limitCount: 2
                        }
                    ]
                }
            },
            body: {
                transactionId: '',
                reserveTickets: JSON.stringify([
                    {
                        mvtkNum: '',
                        section: '',
                        ticketCode: '',
                        glasses: false,
                        ticketName: ''
                    }
                ])
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
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield TicketModule.ticketSelect(req, res, next);
        assert(res.render.calledOnce);
        ticketForm.restore();
        placeOrder.restore();
        getMvtkSeatInfoSync.restore();
    }));
    it('ticketSelect エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    }));
});
