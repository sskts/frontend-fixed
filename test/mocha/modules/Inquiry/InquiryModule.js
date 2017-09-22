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
 * Inquiry.InquiryModuleテスト
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const sinon = require("sinon");
const InquiryLoginForm = require("../../../../app/forms/Inquiry/LoginForm");
const InquiryModule = require("../../../../app/modules/Inquiry/InquiryModule");
describe('Inquiry.InquiryModule', () => {
    it('loginRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
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
        organization.restore();
    }));
    it('loginRender エラー 劇場コードなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            query: {}
        };
        const res = {
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield InquiryModule.loginRender(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('loginRender エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
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
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return Promise.resolve({
                    orderNumber: ''
                });
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
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
        organization.restore();
        order.restore();
        inquiryLoginForm.restore();
    }));
    it('inquiryAuth 正常 オーダー情報なし', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return Promise.resolve(null);
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            body: {},
            session: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
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
        yield InquiryModule.inquiryAuth(req, res, next);
        assert(res.render.calledOnce);
        organization.restore();
        order.restore();
        inquiryLoginForm.restore();
    }));
    it('inquiryAuth 正常 バリデーション', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req = {
            body: {},
            session: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return {};
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
        organization.restore();
        inquiryLoginForm.restore();
    }));
    it('inquiryAuth エラー セッションなし', () => __awaiter(this, void 0, void 0, function* () {
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
    it('inquiryAuth エラー 対象劇場なし', () => __awaiter(this, void 0, void 0, function* () {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve(null);
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
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
            locals: {}
        };
        const next = sinon.spy();
        yield InquiryModule.inquiryAuth(req, res, next);
        assert(next.calledOnce);
        organization.restore();
        inquiryLoginForm.restore();
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
