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
 * Purchase.InputModuleテスト
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const InputForm = require("../../../../app/forms/Purchase/InputForm");
const AuthModel_1 = require("../../../../app/models/Auth/AuthModel");
const InputModule = require("../../../../app/modules/Purchase/InputModule");
describe('Purchase.InputModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {}
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
        yield InputModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render 正常 再表示', () => __awaiter(this, void 0, void 0, function* () {
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
        yield InputModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render 正常 会員', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {},
                    profile: {}
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
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
        yield InputModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('render エラー アクセス', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistration 正常', () => __awaiter(this, void 0, void 0, function* () {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
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
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: ''
                            }
                        }
                    },
                    orderCount: 0,
                    creditCards: []
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(res.redirect.calledOnce);
        inputForm.restore();
        placeOrder.restore();
    }));
    it('purchaserInformationRegistration バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: ''
                            }
                        }
                    },
                    orderCount: 0,
                    creditCards: []
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
    }));
    it('purchaserInformationRegistration エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistration エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistration エラー transactionなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistration エラー 取引id不整合', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '123'
                    }
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistration 正常 クレジットカード処理失敗', () => __awaiter(this, void 0, void 0, function* () {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
                return Promise.reject(new Error());
            }
        });
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: ''
                            }
                        }
                    },
                    orderCount: 0,
                    creditCards: []
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
            },
            __: () => {
                return '';
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InputModule.purchaserInformationRegistration(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
        placeOrder.restore();
    }));
    it('purchaserInformationRegistrationOfMember 正常', () => __awaiter(this, void 0, void 0, function* () {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const person = sinon.stub(sasaki.service, 'person').returns({
            deleteCreditCard: () => {
                return Promise.resolve({});
            },
            addCreditCard: () => {
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
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: ''
                            }
                        }
                    },
                    orderCount: 0,
                    creditCards: [{}],
                    profile: {}
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
                }
            },
            body: {
                transactionId: '',
                creditCardRegistration: true,
                gmoTokenObject: JSON.stringify({ token: '' })
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
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.redirect.calledOnce);
        inputForm.restore();
        placeOrder.restore();
        person.restore();
    }));
    it('purchaserInformationRegistrationOfMember バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: ''
                            }
                        }
                    },
                    orderCount: 0,
                    creditCards: [],
                    profile: {}
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
    }));
    it('purchaserInformationRegistrationOfMember エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistrationOfMember エラー 非会員', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                },
                auth: {
                    memberType: AuthModel_1.MemberType.NonMember
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistrationOfMember エラー 期限切れ', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistrationOfMember エラー transactionなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
                }
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistrationOfMember エラー 取引id不整合', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '123'
                    },
                    profile: {}
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res = {};
        const next = sinon.spy();
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    }));
    it('purchaserInformationRegistrationOfMember 正常 クレジットカード処理失敗', () => __awaiter(this, void 0, void 0, function* () {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
                return Promise.reject(new Error());
            }
        });
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        }
                    },
                    seatReservationAuthorization: {
                        result: {
                            updTmpReserveSeatResult: {
                                tmpReserveNum: ''
                            }
                        }
                    },
                    orderCount: 0,
                    creditCards: [],
                    profile: {}
                },
                auth: {
                    memberType: AuthModel_1.MemberType.Member
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
            },
            __: () => {
                return '';
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
        placeOrder.restore();
    }));
});
