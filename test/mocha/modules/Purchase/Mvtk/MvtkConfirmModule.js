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
 * MvtkConfirmModuleテスト
 */
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const MvtkConfirmModule = require("../../../../../app/modules/Purchase/Mvtk/MvtkConfirmModule");
describe('MvtkConfirmModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                },
                mvtk: []
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield MvtkConfirmModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render 正常 ムビチケなし', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                },
                mvtk: null
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield MvtkConfirmModule.render(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = sinon.spy();
        yield MvtkConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('submit 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '12345678'
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '12345678'
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield MvtkConfirmModule.submit(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('submit エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = sinon.spy();
        yield MvtkConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
});
