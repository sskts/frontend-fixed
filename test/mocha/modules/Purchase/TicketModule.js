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
 * Purchase.TicketModuleテスト
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const TicketForm = require("../../../../app/forms/Purchase/TicketForm");
const AuthModel_1 = require("../../../../app/models/Auth/AuthModel");
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
    it('render 正常 会員', () => __awaiter(this, void 0, void 0, function* () {
        const person = sinon.stub(sasaki.service, 'person').returns({
            getContacts: () => {
                return Promise.resolve({
                    familyName: '',
                    givenName: '',
                    email: '',
                    emailConfirm: '',
                    telephone: ''
                });
            },
            findCreditCards: () => {
                return Promise.resolve([
                    { deleteFlag: '0' }
                ]);
            }
        });
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {}
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
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
        person.restore();
    }));
    it('render エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー プロパティ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {}
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    individualScreeningEvent: {},
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー アクセス', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    individualScreeningEvent: {},
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    // tslint:disable-next-line:max-func-body-length
    it('ticketSelect 正常', () => __awaiter(this, void 0, void 0, function* () {
        const ticketForm = sinon.stub(TicketForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            changeSeatReservationOffers: () => {
                return Promise.resolve({
                    result: {
                        updTmpReserveSeatResult: {
                            tmpReserveNum: '123'
                        }
                    }
                });
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
                    seatReservationAuthorization: {},
                    mvtkAuthorization: {
                        id: ''
                    },
                    salesTickets: [
                        { ticketCode: '100', limitUnit: '001', limitCount: 1, mvtkNum: '' },
                        { ticketCode: '200', limitUnit: '001', limitCount: 1, mvtkNum: '200' }
                    ],
                    mvtk: [
                        {
                            code: '200',
                            password: 'MTIzNDU2Nzg=',
                            ticket: {
                                ticketCode: '200',
                                ticketName: '',
                                ticketNameEng: '',
                                ticketNameKana: '',
                                addPrice: 0,
                                addPriceGlasses: 0
                            },
                            ykknInfo: {
                                kijUnip: '0',
                                eishhshkTyp: '100',
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
                    { mvtkNum: '', section: '', ticketCode: '100', glasses: false, ticketName: '', seatCode: 'Ａー１' },
                    { mvtkNum: '200', section: '', ticketCode: '200', glasses: false, ticketName: '', seatCode: 'Ａー２' }
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
    }));
    it('ticketSelect エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    }));
    it('ticketSelect エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    }));
    it('ticketSelect エラー プロパティ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    }));
    it('ticketSelect エラー 取引ID不整合', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours'),
                    transaction: {
                        id: '123'
                    },
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {}
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res = {};
        const next = sinon.spy();
        yield TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    }));
});