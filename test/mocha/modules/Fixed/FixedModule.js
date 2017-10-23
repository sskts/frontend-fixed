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
 * Fixed.FixedModuleテスト
 */
const COA = require("@motionpicture/coa-service");
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const sinon = require("sinon");
const InquiryLoginForm = require("../../../../app/forms/Inquiry/LoginForm");
const FixedModule = require("../../../../app/modules/Fixed/FixedModule");
const ErrorUtilModule = require("../../../../app/modules/Util/ErrorUtilModule");
describe('Fixed.FixedModule', () => {
    it('settingRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });
        const req = {
            session: {}
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield FixedModule.settingRender(req, res, next);
        assert(res.render.calledOnce);
        organization.restore();
    }));
    it('settingRender エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield FixedModule.settingRender(req, res, next);
        assert(next.calledOnce);
    }));
    it('stopRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {};
        const res = {
            locals: {},
            render: sinon.spy()
        };
        yield FixedModule.stopRender(req, res);
        assert(res.render.calledOnce);
    }));
    it('getInquiryData 正常', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return {
                    orderInquiryKey: {
                        confirmationNumber: ''
                    },
                    acceptedOffers: [{
                            itemOffered: {
                                reservationFor: {
                                    workPerformed: {
                                        name: ''
                                    },
                                    startDate: '',
                                    location: {
                                        name: {
                                            ja: '',
                                            en: ''
                                        }
                                    },
                                    coaInfo: {
                                        dateJouei: ''
                                    }
                                },
                                reservedTicket: {
                                    coaTicketInfo: {
                                        seatNum: '',
                                        addGlasses: '',
                                        ticketName: '',
                                        salePrice: ''
                                    },
                                    ticketToken: ''
                                }
                            }
                        }]
                };
            }
        });
        const updReserve = sinon.stub(COA.services.reserve, 'updReserve').returns(Promise.resolve({}));
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            session: {},
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        organization.restore();
        order.restore();
        updReserve.restore();
        inquiryLoginForm.restore();
    }));
    it('getInquiryData エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined,
            body: {}
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
    }));
    it('getInquiryData エラー findMovieTheaterByBranchCodeなし', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return null;
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            session: {},
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        organization.restore();
        inquiryLoginForm.restore();
    }));
    it('getInquiryData エラー orderなし fixedセッションなし', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return null;
            }
        });
        const updReserve = sinon.stub(COA.services.reserve, 'updReserve').returns(Promise.resolve({}));
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            session: {},
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        organization.restore();
        order.restore();
        updReserve.restore();
        inquiryLoginForm.restore();
    }));
    it('getInquiryData エラー orderなし fixedセッションupdateReserveInなし', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return null;
            }
        });
        const updReserve = sinon.stub(COA.services.reserve, 'updReserve').returns(Promise.resolve({}));
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            session: {
                fixed: {}
            },
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        organization.restore();
        order.restore();
        updReserve.restore();
        inquiryLoginForm.restore();
    }));
    it('getInquiryData エラー orderなし fixedセッションupdateReserveInあり', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return null;
            }
        });
        const updReserve = sinon.stub(COA.services.reserve, 'updReserve').returns(Promise.resolve({}));
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            session: {
                fixed: {
                    updateReserveIn: {}
                }
            },
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        organization.restore();
        order.restore();
        updReserve.restore();
        inquiryLoginForm.restore();
    }));
    it('getInquiryData バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            session: {},
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    }
                });
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        inquiryLoginForm.restore();
    }));
    it('createPrintReservations 正常', () => __awaiter(this, void 0, void 0, function* () {
        const inquiryModel = {
            order: {
                orderInquiryKey: {
                    confirmationNumber: ''
                },
                acceptedOffers: [{
                        itemOffered: {
                            reservationFor: {
                                workPerformed: {
                                    name: ''
                                },
                                startDate: '',
                                location: {
                                    name: {
                                        ja: '',
                                        en: ''
                                    }
                                },
                                coaInfo: {
                                    dateJouei: ''
                                }
                            },
                            reservedTicket: {
                                coaTicketInfo: {
                                    seatNum: '',
                                    addGlasses: '',
                                    ticketName: '',
                                    salePrice: ''
                                },
                                ticketToken: ''
                            }
                        }
                    }]
            },
            movieTheaterOrganization: {
                location: {
                    name: {
                        ja: '',
                        en: ''
                    }
                }
            }
        };
        const printReservations = yield FixedModule.createPrintReservations(inquiryModel);
        assert(Array.isArray(printReservations));
    }));
    it('createPrintReservations エラー order,movieTheaterOrganizationなし', () => __awaiter(this, void 0, void 0, function* () {
        const inquiryModel = {
            movieTheaterOrganization: null,
            order: null
        };
        try {
            yield FixedModule.createPrintReservations(inquiryModel);
        }
        catch (err) {
            assert.strictEqual(err.errorType, ErrorUtilModule.ErrorType.Property);
        }
    }));
    it('createPrintReservations エラー reservationForなし', () => __awaiter(this, void 0, void 0, function* () {
        const inquiryModel = {
            order: {
                orderInquiryKey: {
                    confirmationNumber: ''
                },
                acceptedOffers: [{
                        itemOffered: {
                            reservationFor: {}
                        }
                    }]
            },
            movieTheaterOrganization: {
                location: {
                    name: {
                        ja: '',
                        en: ''
                    }
                }
            }
        };
        try {
            yield FixedModule.createPrintReservations(inquiryModel);
        }
        catch (err) {
            assert.strictEqual(err.errorType, ErrorUtilModule.ErrorType.Property);
        }
    }));
});
