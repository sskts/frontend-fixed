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
 * Auth.SignInModuleテスト
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const sinon = require("sinon");
const AuthModel_1 = require("../../../../app/models/Auth/AuthModel");
const SignInModule = require("../../../../app/modules/Auth/SignInModule");
describe('Auth.SignInModule', () => {
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
        const auth = sinon.stub(sasaki.auth.OAuth2.prototype, 'getToken').returns(Promise.resolve({}));
        const req = {
            query: {
                code: '',
                state: ''
            },
            session: {
                auth: {
                    state: '',
                    codeVerifier: '',
                    memberType: AuthModel_1.MemberType.Member
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
        auth.restore();
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
