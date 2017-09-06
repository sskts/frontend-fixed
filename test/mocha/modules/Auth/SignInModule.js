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
 * 認証
 * @namespace SignInModule
 */
const assert = require("assert");
const sinon = require("sinon");
const SignInModule = require("../../../../app/modules/Auth/SignInModule");
describe('SignInModule', () => {
    it('index サインイン 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            query: {
                id: '12345678'
            },
            session: {}
        };
        const res = {
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield SignInModule.index(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('index 購入ページへ 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            query: {
                code: '12345678',
                state: '12345678'
            },
            session: {
                auth: {
                    state: '12345678'
                }
            }
        };
        const res = {
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield SignInModule.index(req, res, next);
        assert(res.redirect.calledOnce);
    }));
    it('index エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield SignInModule.index(req, res, next);
        assert(next.calledOnce);
    }));
});
