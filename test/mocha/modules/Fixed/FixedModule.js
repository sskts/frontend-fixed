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
 * FixedModuleテスト
 */
const COA = require("@motionpicture/coa-service");
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const sinon = require("sinon");
const InquiryLoginForm = require("../../../../app/forms/Inquiry/LoginForm");
const FixedModule = require("../../../../app/modules/Fixed/FixedModule");
describe('FixedModule', () => {
    let organization;
    let order;
    let updReserve;
    let inquiryLoginForm;
    beforeEach(() => {
        organization = sinon.stub(sasaki.service, 'organization').returns({
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
        order = sinon.stub(sasaki.service, 'order').returns({
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
        updReserve = sinon.stub(COA.services.reserve, 'updReserve').returns(Promise.resolve({}));
        inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
    });
    afterEach(() => {
        organization.restore();
        order.restore();
        updReserve.restore();
        inquiryLoginForm.restore();
    });
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {};
        const res = {
            locals: {},
            render: sinon.spy()
        };
        yield FixedModule.render(req, res);
        assert(res.render.calledOnce);
    }));
    it('settingRender 正常', () => __awaiter(this, void 0, void 0, function* () {
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
    it('stopRender 正常', () => __awaiter(this, void 0, void 0, function* () {
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
    }));
    it('stopRender エラー', () => __awaiter(this, void 0, void 0, function* () {
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
    it('stopRender バリデーション', () => __awaiter(this, void 0, void 0, function* () {
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
    }));
});
