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
 * InquiryModuleテスト
 */
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const sinon = require("sinon");
const InquiryLoginForm = require("../../../../app/forms/Inquiry/LoginForm");
const InquiryModule = require("../../../../app/modules/Inquiry/InquiryModule");
describe('InquiryModule', () => {
    let organization;
    let order;
    let inquiryLoginForm;
    beforeEach(() => {
        organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: { ja: '', en: '' }
                    }
                };
            }
        });
        order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return {
                    orderNumber: ''
                };
            }
        });
        inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
    });
    afterEach(() => {
        organization.restore();
        order.restore();
        inquiryLoginForm.restore();
    });
    it('loginRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            query: {
                orderNumber: '118-'
            },
            session: {}
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InquiryModule.loginRender(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('loginRender エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            query: {
                orderNumber: '118-'
            },
            session: undefined
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield InquiryModule.loginRender(req, res, next);
        assert(next.calledOnce);
    }));
    it('inquiryAuth 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            body: {},
            session: {},
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
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InquiryModule.inquiryAuth(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('inquiryAuth バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            body: {},
            session: {},
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
        yield InquiryModule.inquiryAuth(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('inquiryAuth エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            body: {},
            session: undefined
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield InquiryModule.inquiryAuth(req, res, next);
        assert(next.calledOnce);
    }));
    it('confirmRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            body: {},
            session: {
                inquiry: {}
            },
            query: {
                theater: ''
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InquiryModule.confirmRender(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('confirmRender リダイレクト', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            body: {},
            session: {},
            params: {
                orderNumber: '1111'
            },
            query: {
                theater: ''
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InquiryModule.confirmRender(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('confirmRender エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            body: {},
            session: undefined,
            params: {},
            query: {}
        };
        const res = {};
        const next = sinon.spy();
        yield InquiryModule.confirmRender(req, res, next);
        assert(next.calledOnce);
    }));
});
